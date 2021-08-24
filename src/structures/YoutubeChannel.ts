import { Util } from "../util/Util"

export interface YoutubeChannelInfo {
    title: string
    avatars: {
        url: string
        height: number
        width?: number
    }[]
    banners: {
        url: string
        height: number
        width?: number
    }[]
    subscriberFormattedCount: string
    channelId: string
    availableCountryCodes: string[]
    isFamilySafe: boolean
    keywords: string
    description: string
    rssUrl: string
}

export class YoutubeChannel {
    json: any

    constructor(json: any) {
        this.json = json
    }

    get url() {
        return `${Util.getYTChannelURL()}/${this.details.channelId}`
    }

    get<K extends keyof YoutubeChannelInfo>(key: K): YoutubeChannelInfo[K] {
        return this.details[key]
    }

    get details(): YoutubeChannelInfo {
        const header = this.json.header.c4TabbedHeaderRenderer
        const metadata = this.json.metadata.channelMetadataRenderer

        return {
            channelId: header.channelId,
            title: header.title,
            avatars: header.avatar.thumbnails,
            banners: header.banner.thumbnails, 
            keywords: metadata.keywords, 
            description: metadata.description,
            rssUrl: metadata.rssUrl,
            isFamilySafe: metadata.isFamilySafe,
            availableCountryCodes: metadata.availableCountryCodes,
            subscriberFormattedCount: header.subscriberCountText.simpleText
        }
    } 
}