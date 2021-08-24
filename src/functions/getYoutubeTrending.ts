import axios from "axios";
import { YoutubeTrending } from "../structures/YoutubeTrending";
import { Util } from "../util/Util";

export async function getYoutubeTrending() {
    const request = await axios.get<string>(Util.getYTTrendingURL() + "?hl=en")

    const json = JSON.parse(
        Util.getBetween(
            request.data,
            `var ytInitialData = `,
            `;</script>`
        )
    )

    return new YoutubeTrending(json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].shelfRenderer.content.expandedShelfContentsRenderer.items)
}