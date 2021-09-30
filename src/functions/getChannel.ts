import axios from 'axios';
import { YoutubeChannel } from '../structures/YoutubeChannel';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';

export async function getChannel(id: string) {
    const { data } = await axios.get<string>(`${Util.getYTChannelURL()}/${id}?hl=en`);

    const json = JSON.parse(Regexes.YOUTUBE_INITIAL_DATA.exec(data)[1]);

    return new YoutubeChannel(json);
}
