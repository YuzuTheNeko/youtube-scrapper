import axios from "axios";
import { SearchError } from "../structures/SearchError";
import { YoutubeSearchResults } from "../structures/YoutubeSearchResults";
import { ErrorCodes } from "../util/constants";
import { noop } from "../util/noop";
import { Util } from "../util/Util";

export async function search(query: string) {
    const params = new URLSearchParams()
    
    params.append("search_query", query)

    params.append("hl", "en")

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