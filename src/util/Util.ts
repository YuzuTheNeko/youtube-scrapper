import { YoutubeVideoFormat } from "../structures/YoutubeVideo"
import formats from "./formats"

export class Util extends null {
    constructor() {}

    static getYTSearchURL() {
        return "https://www.youtube.com/results"
    }

    static getYTVideoURL() {
        return "https://www.youtube.com/watch?v="
    }

    static getBetween<K = undefined>(body: string, one: string, two: string): K extends undefined ? string | undefined : K {
        return body.split(one)[1]?.split(two)[0] as K extends undefined ? string | undefined : K
    }

    static getYTChannelURL() {
        return `https://youtube.com/channel`
    }

    static getYTTrendingURL() {
        return `${Util.getBaseYTURL()}/feed/trending`
    }

    static getYTUserURL() {
        return `https://youtube.com/user`
    }

    static getYTPlaylistURL() {
        return "https://www.youtube.com/playlist"
    }

    static getYTApiBaseURL() {
        return `https://www.youtube.com/youtubei/v1`
    }

    static getId(str: string) {
        return str.includes("watch?v=") ? str.split("watch?v=")[1].split("&")[0] : str
    }

    static getListId(str: string) {
        return str.includes("?list=") ? str.split("list?=")[1].split("&")[0] : str
    }

    static getBaseYTURL() {
        return `https://youtube.com`
    }

    static swapSignatureArray(arr: string[], position: number): string[] {
        const first = arr[0]
        arr[0] = arr[position % arr.length]
        arr[position] = first
        return arr
    }

    static addMetadataToFormat(format: YoutubeVideoFormat): YoutubeVideoFormat {
        //@ts-ignore
        format = Object.assign({}, formats[format.itag], format)
        format.hasVideo = !!format.qualityLabel;
        format.hasAudio = !!format.audioBitrate;
        format.isLive = /\bsource[/=]yt_live_broadcast\b/.test(format.url as string);
        format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url as string);
        format.isDashMPD = /\/manifest\/dash\//.test(format.url as string);
        return format
    }
}