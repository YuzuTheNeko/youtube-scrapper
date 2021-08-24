import { inspect } from "util"

export interface YoutubeSearchVideoInfo {
    id: string
    thumbnails: {
        url: string
        width: string
        height: string
    }[]
    title: string
    publishedTimeAgo?: string
    viewCount: number
    formattedViewCount: number
    description?: string
    duration: number
    formattedDuration: string
    formattedReadableDuration: string
    author: {
        name: string
        id: string
        thumbnails: {
            url: string
            width: number
            height: number
        }[]
    }
}

export class YoutubeSearchResults {
    private json: any

    constructor(json: any) {
        this.json = json
    }

    getEstimatedResults(): number {
        return Number(this.json.estimatedResults)
    }

    getVideos(): YoutubeSearchVideoInfo[] {
        const arr: YoutubeSearchVideoInfo[] = []

        const videos = this.json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents

        for (const data of videos) {
            const video = data.videoRenderer

            if (video) {
                arr.push({
                    id: video.videoId, 
                    thumbnails: video.thumbnail.thumbnails, 
                    title: video.title.runs[0].text,
                    author: {
                        name: video.ownerText.runs[0].text, 
                        id: video.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url.split("/").slice(-1)[0],
                        thumbnails: video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails
                    },
                    viewCount: Number(video.viewCountText.simpleText.split(" ")[0].replace(/,/g, "")),
                    publishedTimeAgo: video.publishedTimeText?.simpleText,
                    formattedDuration: video.lengthText.simpleText,
                    formattedReadableDuration: video.lengthText.accessibility.accessibilityData.label, 
                    formattedViewCount: video.shortViewCountText.simpleText,
                    description: video.detailedMetadataSnippets?.[0].snippetText.runs.map((e: any) => e.text).join(""),
                    duration: ((): number => {
                        let n = 0
                        let y = 0
                        for (const pointer of video.lengthText.simpleText.split(":").reverse().map((d: string) => Number(d))) {
                            n += (pointer * (
                                y === 0 ? 1000 : y === 1 ? 60000 : y === 2 ? 3600000 : y === 3 ? 86400000 : 0
                            ))

                            y++
                        }
                        return n 
                    })()
                })
            }
        }

        return arr
    }
}