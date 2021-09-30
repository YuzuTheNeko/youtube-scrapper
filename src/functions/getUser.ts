import axios from 'axios';
import { YoutubeChannel } from '../structures/YoutubeChannel';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';

/**
 * Gets a user's channel data, behaves same as getChannel method but it uses the author name or id.
 * @param id The id or name of the owner.
 * @returns
 */
export async function getUser(id: string) {
    const { data } = await axios.get<string>(`${Util.getYTUserURL()}/${id}?hl=en`);

    const json = JSON.parse(Regexes.YOUTUBE_INITIAL_DATA.exec(data)[1]);

    return new YoutubeChannel(json);
}
