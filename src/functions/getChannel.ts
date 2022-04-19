import axios from "axios";
import { YoutubeChannel } from "../structures/YoutubeChannel";
import { JSONParser } from "../util/jsonParser";
import { Util } from "../util/Util";

export async function getChannel(id: string) {
    const request = await axios.get<string>(`${Util.getYTChannelURL()}/${id}?hl=en`)

    const json = JSONParser(
        Util.getBetween(
            request.data,
            `var ytInitialData = `,
            ";</script>"
        )
    )

    return new YoutubeChannel(json)
}