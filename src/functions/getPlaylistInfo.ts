import { Playlist } from '../structures/Playlist';
import { Util } from '../util/Util';

export interface GetPlaylistInfoOptions {
    full?: boolean;
}

export async function getPlaylistInfo(urlOrId: string, options: GetPlaylistInfoOptions = {}): Promise<Playlist> {
    const listId = Util.getListId(urlOrId);

    const playlist = new Playlist(listId);

    if (options.full) {
        await playlist.fetch();
    } else {
        await playlist.fetchFirstPage();
    }

    return playlist;
}
