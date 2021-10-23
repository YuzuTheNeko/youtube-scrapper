import { opus } from "prism-media"
import { downloadFromVideo } from "../functions/downloadFromVideo"
import { getVideoInfo } from "../functions/getVideoInfo"
import Speaker from "speaker"
import { getPlaylistInfo, YoutubeVideoFormat } from ".."

async function d() {
  const pl = await getPlaylistInfo("https://www.youtube.com/watch?v=znso0RKZbr0&list=PL59hrAQLMh-ltkCFV-sYoLZm91yFLmXPv", { full: true })

  for (let i = 0;i < pl.tracks.length;i++) {
    await new Promise<void>(async (resolve) => {
      const video = await getVideoInfo(pl.tracks[i].url)
      const filter = (c: YoutubeVideoFormat) => c.hasAudio && !c.hasVideo && c.codec === 'opus'
      const v = await video.download(video.formats.find(filter) ?? video.formats[0], { debug: true, highWaterMark: 512000, chunkMode: { chunkSize: 512_000 }, retryFilter: filter, pipe: false })
      .on("data", c => {
        v.destroy()
        resolve()
      })
    })
    console.log(i)
  }
}

d()