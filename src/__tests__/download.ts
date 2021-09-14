import { opus } from "prism-media"
import { downloadFromVideo } from "../functions/downloadFromVideo"
import { getVideoInfo } from "../functions/getVideoInfo"
import Speaker from "speaker"
import { YoutubeVideoFormat } from ".."

async function d() {
  const video = await getVideoInfo("https://www.youtube.com/watch?v=gBF2TqxjJSk&list=RDgBF2TqxjJSk&start_radio=1")
  console.log(video.formats.length)
  const v = await getVideoInfo("https://www.youtube.com/watch?v=gBF2TqxjJSk&list=RDgBF2TqxjJSk&start_radio=1")
  console.log(v.formats.length, v.formats.length)
}

d()