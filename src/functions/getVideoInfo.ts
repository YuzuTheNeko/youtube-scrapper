import axios from "axios";
import { YoutubeVideo, YoutubeVideoFormat } from "../structures/YoutubeVideo";
import { Util } from "../util/Util";

export async function getVideoInfo(urlOrId: string, getPlaylistFormats: boolean = false) {
    const id = Util.getId(urlOrId)

    console.log(id)
    
    const request = await axios.get<string>(`${Util.getYTVideoURL()}${id}&hl=en`)

    const json = JSON.parse(request.data.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0])

    if (json.playabilityStatus?.status === "ERROR") {
        throw Error(json.playabilityStatus.reason)
    } 

    const video = new YoutubeVideo(json)

    video.getHtml5Player(request.data)

    const pending: Promise<unknown>[] = []

    pending.push(video.fetchTokens())
    
    const moreFormats: YoutubeVideoFormat[] = []
    const dashMpdUrl = video['json'].streamingData?.dashManifestUrl
    const m3u8Url = video['json'].streamingData?.hlsManifestUrl

    if (getPlaylistFormats) {
        if (dashMpdUrl) pending.push(Util.dashMpdFormat(dashMpdUrl))
        if (m3u8Url) pending.push(Util.m3u8Format(m3u8Url))
    }

    const resolved = await Promise.all(pending)

    for (const moreFormat of resolved.slice(1)) moreFormats.push(...moreFormat as YoutubeVideoFormat[])

    video.moreFormats = moreFormats

    return video
}