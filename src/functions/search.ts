import axios from "axios";
import { inspect } from "util";
import { SearchError } from "../structures/SearchError";
import { YoutubeSearchResults } from "../structures/YoutubeSearchResults";
import { ErrorCodes } from "../util/constants";
import noop from "../util/noop";
import { Util } from "../util/Util";

export default async function(query: string) {
    const params = new URLSearchParams()
    
    params.append("search_query", query)

    params.append("hl", "en")

    const request = await axios.get<string>(`${Util.getYTSearchURL()}?${params}`).catch(noop)

    if (!request) {
        throw new SearchError(ErrorCodes.SEARCH_FAILED)
    }

    try {
        const json = JSON.parse(request.data.split("var ytInitialData = ")[1].split(";</script>")[0])

        return new YoutubeSearchResults(json)
    } catch (error: any) {
        throw new SearchError(error.message)
    }
}