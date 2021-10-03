import axios from 'axios';
import { YoutubeVideo } from '../structures/YoutubeVideo';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';

export async function getVideoInfo(urlOrId: string, getPlaylistFormats: boolean = false) {
    const id = Util.getId(urlOrId);

    const { data } = await axios.get<string>(`${Util.getYTVideoURL()}${id}&hl=en`);

    const json = JSON.parse((Regexes.YOUTUBE_PLAYER_RESPONSE.exec(data) as RegExpExecArray)[1]);

    if (json.playabilityStatus?.status === 'ERROR') {
        throw Error(json.playabilityStatus.reason);
    }

    const video = new YoutubeVideo(json);

    video.getHtml5Player(data);
    await video.fetchTokens();

    const dashMpdUrl = json.streamingData?.dashManifestUrl;
    const m3u8Url = json.streamingData?.hlsManifestUrl;

    if (getPlaylistFormats) {
        video.moreFormats = [];
        const pending: Promise<typeof video.moreFormats>[] = [];
        if (dashMpdUrl) {
            pending.push(Util.dashMpdFormat(dashMpdUrl));
        }
        if (m3u8Url) {
            pending.push(Util.m3u8Format(m3u8Url));
        }

        for (const moreFormat of await Promise.all(pending)) {
            video.moreFormats.push(...moreFormat);
        }
    }

    return video;
}
