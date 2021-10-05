import { getPlaylistInfo } from "../functions/getPlaylistInfo";

const s = Date.now()

getPlaylistInfo("https://www.youtube.com/watch?v=mKx2zq-tuV8&list=PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph&index=24", {full:true})
.then(pl => {
    console.log(`Got ${pl.tracks.length} tracks from ${pl.title} within ${Date.now() - s}ms.`)
})