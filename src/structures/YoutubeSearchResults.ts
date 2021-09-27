import { Util } from ".."

export interface YoutubeSearchVideoInfo {
    id: string
    thumbnails: {
        url: string
        width: string
        height: string
    }[]
    url: string
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

export interface YoutubeSearchListInfo {
    id: string
    thumbnails: {
        url: string
        width: string
        height: string
    }[]
    url: string
    title: String
    channel: {
        name: string
        id: string
        url: string
    },
    videoCount: number
}

export interface YoutubeSearchChannelInfo {
    id: string
    thumbnails: {
        url: string
        width: string
        height: string
    }[]
    url: string
    title: String
    verified: Boolean
    subscriberCount: number
}

export class YoutubeSearchResults {
    private json: any

    constructor(json: any) {
        this.json = json
    }

    getEstimatedResults(): number {
        return Number(this.json.estimatedResults)
    }

    get videos(): YoutubeSearchVideoInfo[] {
        const arr: YoutubeSearchVideoInfo[] = []

        const videos = this.json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents

        for (const data of videos) {
            const video = data.videoRenderer

            if (video) {
                const rawViewCount: string = video.viewCountText?.simpleText?.split(" ")[0] ?? video.viewCountText?.runs[0]?.text
                const formattedDuration = video.lengthText?.simpleText ?? "0"
                const formattedReadableDuration = video.lengthText?.accessibility?.accessibilityData.label ?? "0"
                const formattedViewCount = video.shortViewCountText?.simpleText ?? video.shortViewCountText?.runs[0]?.text

                arr.push({
                    url: Util.getYTVideoURL() + video.videoId,
                    id: video.videoId, 
                    thumbnails: video.thumbnail.thumbnails, 
                    title: video.title.runs[0].text,
                    author: {
                        name: video.ownerText.runs[0].text, 
                        id: video.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url.split("/").slice(-1)[0],
                        thumbnails: video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails
                    },
                    viewCount: rawViewCount ? Number(rawViewCount.replace(/,/g, "")) : 0,
                    publishedTimeAgo: video.publishedTimeText?.simpleText,
                    formattedDuration: formattedDuration,
                    formattedReadableDuration: formattedReadableDuration, 
                    formattedViewCount: formattedViewCount,
                    description: video.detailedMetadataSnippets?.[0].snippetText.runs.map((e: any) => e.text).join(""),
                    duration: formattedDuration !== "0" ? ((): number => {
                        let n = 0
                        let y = 0
                        for (const pointer of video.lengthText.simpleText.split(":").reverse().map((d: string) => Number(d))) {
                            n += (pointer * (
                                y === 0 ? 1000 : y === 1 ? 60000 : y === 2 ? 3600000 : y === 3 ? 86400000 : 0
                            ))

                            y++
                        }
                        return n 
                    })() : 0
                })
            }
        }

        return arr
    }

    get playlists(): YoutubeSearchListInfo[] {
        const arr: YoutubeSearchListInfo[] = []

        const playlists = this.json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents

        for (const data of playlists) {
            const list = data.playlistRenderer

            if (list) {
                arr.push({
                    url: `${Util.getYTPlaylistURL()}?list=${list.playlistId}`,
                    id: list.playlistId, 
                    thumbnails: list.thumbnails, 
                    title: list.title.simpleText,
                    channel: {
                        name: list.shortBylineText.runs[0].text, 
                        id: list.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        url: `${Util.getYTChannelURL()}/${list.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId}`
                    },
                    videoCount: Number(list.videoCount.replace(/\D/g, ""))
                })
            }
        }

        return arr
    }

    get channels(): YoutubeSearchChannelInfo[] {
        const arr: YoutubeSearchChannelInfo[] = []

        const channels = this.json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents

        for (const data of channels) {
            const channel = data.channelRenderer

            if (channel) {
                const rawSubscriberCount: string = channel.subscriberCountText?.simpleText ?? "0"
                const badge = data.channelRenderer.ownerBadges?.[0]

                arr.push({
                    url: `${Util.getYTChannelURL()}/${channel.channelId}`,
                    id: channel.channelId, 
                    thumbnails: channel.thumbnail.thumbnails, 
                    title: channel.title.simpleText,
                    verified: Boolean(badge?.metadataBadgeRenderer?.style?.includes('VERIFIED')),
                    subscriberCount: Number(rawSubscriberCount)
                })
            }
        }

        return arr
    }
}