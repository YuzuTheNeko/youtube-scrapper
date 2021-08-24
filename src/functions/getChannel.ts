import axios from "axios";
import {YoutubeChannel} from "../structures/YoutubeChannel";
import { Util } from "../util/Util";

export default async function(id: string) {
    const request = await axios.get<string>(`${Util.getYTChannelURL()}/${id}?hl=en`)

    const json = JSON.parse(
        Util.getBetween(
            request.data,
            `var ytInitialData = `,
            ";</script>"
        )
    )

    return new YoutubeChannel(json)
}