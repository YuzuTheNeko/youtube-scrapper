import axios from 'axios';
import { YoutubeVideo, YoutubeVideoFormat } from '../structures/YoutubeVideo';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';

export async function getVideoInfo(urlOrId: string) {
    const id = Util.getId(urlOrId);

    const { data } = await axios.get<string>(`${Util.getYTVideoURL()}${id}&hl=en`);

    const json = JSON.parse((Regexes.YOUTUBE_PLAYER_RESPONSE.exec(data) as RegExpExecArray)[1]);

    if (json.playabilityStatus?.status === 'ERROR') {
        throw Error(json.playabilityStatus.reason);
    }

    const video = new YoutubeVideo(json);

    video.getHtml5Player(data);
    await video.fetchTokens();

    video.moreFormats = [];
    const dashMpdUrl = video['json'].streamingData?.dashManifestUrl;
    const m3u8Url = video['json'].streamingData?.hlsManifestUrl;

    if (video.details.isLiveContent && video.details.duration === 0 && m3u8Url) {
        const pending: Promise<unknown>[] = [Util.m3u8Format(m3u8Url)];
        if (dashMpdUrl) {
            pending.push(Util.dashMpdFormat(dashMpdUrl));
        }

        const resolved = await Promise.all(pending);

        for (const moreFormat of resolved) {
            video.moreFormats.push(...(moreFormat as YoutubeVideoFormat[]));
        }
    }

    return video;
}
