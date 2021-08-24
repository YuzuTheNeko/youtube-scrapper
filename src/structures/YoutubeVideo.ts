import axios from "axios"
import Miniget from "miniget"
import querystring from "querystring"
import { PassThrough, Readable } from "stream"
import download from "../functions/download"
import downloadFromVideo from "../functions/downloadFromVideo"
import { cachedTokens } from "../util/cache"
import { ErrorCodes } from "../util/constants"
import { Util } from "../util/Util"
import TypeError from "./TypeError"

export interface YoutubeVideoDetails {
    url: string
    id: string
    title: string
    duration: number
    keywords: string[]
    channelId: string
    isOwnerViewing: boolean
    shortDescription: string
    isCrawlable: boolean
    thumbnails: {
        url: string
        height: string
        width: string
    }[]
    averageRating: number
    allowRatings: boolean
    viewCount: number
    author: string
    isPrivate: boolean
    isUnpluggedCorpus: boolean
    isLiveContent: boolean
}

export interface YoutubeVideoFormat {
    itag: number
    mimeType: string
    codec: string
    type: string
    bitrate: number
    width?: number
    height?: number
    initRange: {
        start: number
        end: number
    }
    indexRange: {
        start: number
        end: number
    }
    lastModifiedTimestamp: number
    contentLength: number
    quality: string
    audioChannels?: number
    audioSampleRate?: number
    loudnessDb?: number
    s?: string
    sp?: string
    url?: string
    fps: number
    qualityLabel: string
    projectionType: "RECTANGULAR",
    averageBitrate: number
    approxDurationMs: number
    signatureCipher?: string
    getDecodedCipher: () => string | undefined

    /* Provided by itag format. */
    audioBitrate?: number

    /* These come from metadata and not by youtube. */
    hasAudio?: boolean
    hasVideo?: boolean
    isLive?: boolean
    isHLS?: boolean
    isDashMPD?: boolean
}

export interface DownloadOptions {
    chunkMode?: {
        chunkSize: number
    }
    highWaterMark?: number
    resource?: PassThrough
}

export class YoutubeVideo {
    private json: any
    html5Player?: string
    tokens?: string[]

    constructor(json: any) {
        this.json = json
    }

    get formats(): YoutubeVideoFormat[] {
        const arr: YoutubeVideoFormat[] = []

        for (const format of 
            [].concat(
                this.json.streamingData.adaptiveFormats ?? [],
                this.json.streamingData.formats ?? []
            ) as any[]) {
            
            let frmt: YoutubeVideoFormat = {
                itag: format.itag, 
                mimeType: format.mimeType,
                type: format.mimeType.split(";")[0],
                codec: format.mimeType.split('"')[1].split('"')[0],
                bitrate: format.bitrate,
                width: format.width,
                height: format.height,
                initRange: {
                    start: Number(format.initRange?.start),
                    end: Number(format.initRange?.end)
                },
                indexRange: {
                    start: Number(format.indexRange?.start),
                    end: Number(format.indexRange?.end)
                },
                lastModifiedTimestamp: Number(format.lastModified),
                contentLength: Number(format.contentLength),
                fps: format.fps, 
                quality: format.quality,
                url: format.url, 
                qualityLabel: format.qualityLabel,
                projectionType: format.projectionType,
                averageBitrate: format.averageBitrate,
                approxDurationMs: Number(format.approxDurationMs),
                signatureCipher: format.signatureCipher ?? format.cipher,
                getDecodedCipher: () => decodeURIComponent(format.signatureCipher),
            }

            if (format.url && !frmt.signatureCipher) {
                frmt.url = format.url 
            }

            if (!frmt.url) {
                frmt = Object.assign(frmt, querystring.parse(frmt.signatureCipher as string))
            }

            let sig = this.tokens && frmt.s ? YoutubeVideo.decipher(this.tokens, frmt.s) : undefined

            const url = new URL(decodeURIComponent(frmt.url as string))

            url.searchParams.set("ratebypass", "yes")

            if (sig) {
                url.searchParams.set(frmt.sp ?? "signature", sig)
            }
            
            frmt.url = url.toString()

            arr.push(
                Util.addMetadataToFormat(frmt)
            )
        }

        return arr
    }

    download(format: YoutubeVideoFormat, options: DownloadOptions = {}) {
        if (format.isLive) {
            throw new TypeError(ErrorCodes.UNSUPPORTED_FORMAT)
        } else {
            if (options.chunkMode) {
                const stream = options.resource ?? new PassThrough({
                    // Set watermark to 512000 (default) for chunking.
                    highWaterMark: options.highWaterMark ?? 512000
                }) 
    
                let downloadChunkSize = options.chunkMode.chunkSize ?? 512000
    
                let endBytes = downloadChunkSize, startBytes = 0, chunkIndex = 0
                
                const getNextChunk = () => {
                    chunkIndex++
    
                    if (endBytes > format.contentLength) {
                        endBytes = format.contentLength
                    }
    
                    const request = Miniget(format.url as string, {
                        headers: {
                            Range: `bytes=${startBytes}-${endBytes}`
                        }
                    })

                    // Handle unknown 403 errors accordinly.
                    request.once("error", error => {
                        if (error.message.includes("403")) {
                            request.removeAllListeners()
                            options.resource = stream
                            download(this.details.url)
                        } else {
                            throw error
                        }
                        request.destroy()
                    })
    
                    request.on("data", (chunk: Buffer) => {
                        if (stream.destroyed) {
                            request.destroy()
                            return;
                        }
                        startBytes += chunk.length
                        stream.write(chunk)
                    })
    
                    request.once("end", () => {
                        if (stream.destroyed) return;
                        if (endBytes === format.contentLength) {
                            return;
                        }
                        endBytes = startBytes + downloadChunkSize 
                        getNextChunk() 
                    })
                }
    
                getNextChunk()
    
                return stream
            } else {
                const stream = new PassThrough({ highWaterMark: format.contentLength })

                const request = Miniget(format.url as string) 

                request.once("error", error => {
                    if (error.message.includes("403")) {
                        request.removeAllListeners()
                        options.resource = stream
                        download(this.details.url)
                    } else {
                        throw error
                    }
                    request.destroy()
                })

                request.once("end", request.destroy)
                stream.once("end", stream.destroy)

                request.pipe(stream)

                return stream
            }
        }
    }

    static decipher(tokens: string[], sig: string): string {
        let arr = sig.split("")
        
        for (let i = 0;i < tokens.length;i++) {
            const token = tokens[i]
            let position; 

            switch(token[0]) {
                case 'r': 
                    arr = arr.reverse()
                    break
                case 'w':
                    position = ~~token.slice(1)
                    arr = Util.swapSignatureArray(arr, position)
                    break
                case 's':
                    position = ~~token.slice(1);
                    arr = arr.slice(position);
                    break
                case 'p':
                    position = ~~token.slice(1);
                    arr.splice(0, position);
                    break
            }
        }

        return arr.join('')
    }

    get info(): YoutubeVideoDetails & { formats: YoutubeVideoFormat[] } {
        const details = this.details

        const formats = this.formats

        return Object.assign(details, { formats: formats })
    }

    getHtml5Player(body: string): string {
        const playerURL = body.split(`"jsUrl":"`)[1]?.split('"')[0]

        this.html5Player = `${Util.getBaseYTURL()}${playerURL}`

        return this.html5Player
    }

    async fetchTokens() {
        if (cachedTokens || this.tokens) {
            return cachedTokens ?? this.tokens
        }

        const request = await axios.get<string>(this.html5Player as string)

        const fakeTokens = request.data.split('{a=a.split("");')[1].split(';return a.join("")};')[0].split(";").map(ftoken => {
            return {
                i: ftoken.slice(3, 5),
                t: ftoken.slice(0, 2),
                raw: ftoken,
                n: ftoken.match(/(\d+)/g)?.join("") 
            }
        })

        const tokens = fakeTokens.map(token => {
            switch(token.i) {
                case 'yU':
                    return `w${token.n}`  
                    break;
                case 'QQ':
                    return `p${token.n}`
                    break;
                case 'z6':
                    return `r`
                    break
                default:
                    console.log(`Found token`, token)
                    throw new TypeError(ErrorCodes.UNKNOWN_TOKEN)
                    break
            }
        })

        //@ts-ignore 
        cachedTokens = tokens

        this.tokens = tokens as string[]

        return tokens
    }

    get details(): YoutubeVideoDetails {
        return {
            url: `${Util.getYTVideoURL()}${this.json.videoDetails.videoId}`,
            id: this.json.videoDetails.videoId,
            title: this.json.videoDetails.title, 
            duration: Number(this.json.videoDetails.lengthSeconds) * 1000,
            channelId: this.json.videoDetails.channelId,
            keywords: this.json.videoDetails.keywords,
            isOwnerViewing: this.json.videoDetails.isOwnerViewing,
            shortDescription: this.json.videoDetails.shortDescription,
            isCrawlable: this.json.videoDetails.isCrawlable,
            thumbnails: this.json.videoDetails.thumbnail.thumbnails,
            averageRating: this.json.videoDetails.averageRating,
            allowRatings: this.json.videoDetails.allowRatings,
            viewCount: Number(this.json.videoDetails.viewCount),
            isPrivate: this.json.videoDetails.isPrivate,
            author: this.json.videoDetails.author,
            isUnpluggedCorpus: this.json.videoDetails.isUnpluggedCorpus,
            isLiveContent: this.json.videoDetails.isLiveContent
        }
    }
}