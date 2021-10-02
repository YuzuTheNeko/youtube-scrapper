import axios from 'axios';
import { SearchError } from '../structures/SearchError';
import { YoutubeSearchResults } from '../structures/YoutubeSearchResults';
import { ErrorCodes } from '../util/constants';
import * as Regexes from '../util/Regexes';

export async function getSearchInfo(url: string, limit: number) {
    const request = await axios.get<string>(url).catch(() => {});

    if (!request) {
        throw new SearchError(ErrorCodes.SEARCH_FAILED);
    }

    try {
        const json = JSON.parse((Regexes.YOUTUBE_INITIAL_DATA.exec(request.data) as RegExpExecArray)[1]);

        return new YoutubeSearchResults(json, limit);
    } catch (error: any) {
        throw new SearchError(error.message);
    }
}
