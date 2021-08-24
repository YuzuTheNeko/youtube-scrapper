import axios from "axios";
import Miniget from "miniget";
import { YoutubeVideo } from "../structures/YoutubeVideo";
import { Util } from "../util/Util";

export default async function(urlOrId: string) {
    const id = Util.getId(urlOrId)

    const request = await axios.get<string>(`${Util.getYTVideoURL()}${id}&hl=en`)

    const json = JSON.parse(request.data.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0])

    const video = new YoutubeVideo(json)

    video.getHtml5Player(request.data)

    await video.fetchTokens() 

    return video
}