import axios from "axios";
import getPlaylistInfo from "../functions/getPlaylistInfo";
import getVideoInfo from "../functions/getVideoInfo";
import { Regexes } from "../util/Regexes";
import { Util } from "../util/Util";

const s = Date.now()

getPlaylistInfo("PL59hrAQLMh-ltkCFV-sYoLZm91yFLmXPv", {full:true})
.then(pl => {
    console.log(`Got ${pl.tracks.length} tracks from ${pl.title} within ${Date.now() - s}ms.`)
})