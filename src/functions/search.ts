import axios from "axios";
import { SearchError } from "../structures/SearchError";
import { YoutubeSearchResults } from "../structures/YoutubeSearchResults";
import { ErrorCodes } from "../util/constants";
import { noop } from "../util/noop";
import { Util } from "../util/Util";

enum SearchType {
    "video" = "EgIQAQ%3D%3D",
    "playlist" = "EgIQAw%3D%3D",
    "channel" = "EgIQAg%3D%3D"
}

export async function search(query: string, type?: string) {
    const params = new URLSearchParams()

    params.append("search_query", query)

    params.append("hl", "en")

    if (type && SearchType[type]) {
        params.append("sp", SearchType[type])
    }

    const request = await axios.get<string>(`${Util.getYTSearchURL()}?${params}`).catch(noop)

    if (!request) {
        throw new SearchError(ErrorCodes.SEARCH_FAILED)
    }

    try {
        const json = JSON.parse(/var\s+ytInitialData\s*=\s*({.+?});/.exec(request.data)[1])

        return new YoutubeSearchResults(json)
    } catch (error: any) {
        throw new SearchError(error.message)
    }
}