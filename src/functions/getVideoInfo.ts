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

    const m3u8Url = json.streamingData?.hlsManifestUrl;
    const dashMpdUrl = json.streamingData?.dashManifestUrl;

    if (video.details.isLive && m3u8Url) {
        video.moreFormats = [];
        const pending = [Util.m3u8Format(m3u8Url)];
        if (dashMpdUrl) {
            pending.push(Util.dashMpdFormat(dashMpdUrl));
        }

        for (const moreFormat of await Promise.all(pending)) {
            video.moreFormats.push(...(moreFormat as YoutubeVideoFormat[]));
        }
    }

    return video;
}
