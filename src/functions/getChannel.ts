import axios from "axios";
import { YoutubeChannel } from "../structures/YoutubeChannel";
import { Util } from "../util/Util";

export async function getChannel(id: string) {
    const request = await axios.get<string>(`${Util.getYTChannelURL()}/${id}?hl=en`)

    const json = JSON.parse(/var\s+ytInitialData\s*=\s*({.+?});/.exec(request.data)[1])

    return new YoutubeChannel(json)
}