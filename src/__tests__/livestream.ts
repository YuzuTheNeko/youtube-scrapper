import { FFmpeg } from "prism-media"
import { getVideoInfo } from "../functions/getVideoInfo"
import { downloadFromVideo } from "../functions/downloadFromVideo"
import Speaker from "speaker"

async function d() {
  const video = await getVideoInfo("https://www.youtube.com/watch?v=5qap5aO4i9A")
  const format = video.formats.find(format => format.isDashMPD && format.hasAudio)
  const stream = downloadFromVideo(video, format)
  const ffmpeg = new FFmpeg({ args: [ "-f", "s16le", "-ar", "48000", "-ac", "2", "-vn" ] })
  const speaker = new Speaker({ sampleRate: 48000, channels: 2, bitDepth: 16 })

  stream.pipe(ffmpeg).pipe(speaker)
}

d()