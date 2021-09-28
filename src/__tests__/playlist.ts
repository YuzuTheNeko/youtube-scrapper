import { getPlaylistInfo } from '../functions/getPlaylistInfo';

const s = Date.now();

getPlaylistInfo('https://www.youtube.com/playlist?list=PLBk_tnN9pBjUqdOAMLOuIIT83GwBoHTwX', { full: true }).then(
    (pl) => {
        console.log(`Got ${pl.tracks.length} tracks from ${pl.title} within ${Date.now() - s}ms.`);
    }
);
