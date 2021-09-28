import axios from 'axios';
import { YoutubeVideo, YoutubeVideoFormat } from '../structures/YoutubeVideo';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';

export async function getVideoInfo(urlOrId: string) {
    const id = Util.getId(urlOrId);

    const request = await axios.get<string>(`${Util.getYTVideoURL()}${id}&hl=en`);

    const json = JSON.parse(Regexes.YOUTUBE_PLAYER_RESPONSE.exec(request.data)[1]);

    if (json.playabilityStatus?.status === 'ERROR') {
        throw Error(json.playabilityStatus.reason);
    }

    const video = new YoutubeVideo(json);

    video.getHtml5Player(request.data);
    await video.fetchTokens();

    const moreFormats: YoutubeVideoFormat[] = [];
    const dashMpdUrl = video['json'].streamingData?.dashManifestUrl;
    const m3u8Url = video['json'].streamingData?.hlsManifestUrl;

    if (video.details.isLiveContent && video.details.duration === 0 && m3u8Url) {
        const pending: Promise<unknown>[] = [Util.m3u8Format(m3u8Url)];
        if (dashMpdUrl) pending.push(Util.dashMpdFormat(dashMpdUrl));

        const resolved = await Promise.all(pending);

        for (const moreFormat of resolved) moreFormats.push(...(moreFormat as YoutubeVideoFormat[]));
    }

    video.moreFormats = moreFormats;

    return video;
}
