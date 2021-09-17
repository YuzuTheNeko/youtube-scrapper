import { getPlaylistInfo } from "../functions/getPlaylistInfo";

const s = Date.now()

getPlaylistInfo("https://www.youtube.com/watch?v=57K-bZN1vcE&list=PLsgJZnNTvLu7Fi_mVZSoEi0B4aGsvgO9T", {full:true})
.then(pl => {
    console.log(`Got ${pl.tracks.length} tracks from ${pl.title} within ${Date.now() - s}ms.`)
})