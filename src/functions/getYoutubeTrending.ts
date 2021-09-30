import axios from 'axios';
import { YoutubeTrending } from '../structures/YoutubeTrending';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';

export async function getYoutubeTrending() {
    const { data } = await axios.get<string>(`${Util.getYTTrendingURL()}?hl=en`);

    const json = JSON.parse((Regexes.YOUTUBE_INITIAL_DATA.exec(data) as RegExpExecArray)[1]);

    return new YoutubeTrending(
        json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].shelfRenderer.content.expandedShelfContentsRenderer.items
    );
}
