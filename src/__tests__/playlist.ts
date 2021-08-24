import { getPlaylistInfo } from "../functions/getPlaylistInfo";

const s = Date.now()

getPlaylistInfo("PL59hrAQLMh-ltkCFV-sYoLZm91yFLmXPv", {full:true})
.then(pl => {
    console.log(`Got ${pl.tracks.length} tracks from ${pl.title} within ${Date.now() - s}ms.`)
})