import { opus } from "prism-media"
import downloadFromVideo from "../functions/downloadFromVideo"
import getVideoInfo from "../functions/getVideoInfo"
import Speaker from "speaker"

async function d() {
  const video = await getVideoInfo("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  const format = video.formats.filter(format => format.type === "audio/webm" && format.codec === "opus" && format.hasAudio).sort((a,b)=>(b.audioBitrate as number)-(a.audioBitrate as number))[0]
  const stream = downloadFromVideo(video, format, { chunkMode: {} })
  const demuxer = new opus.WebmDemuxer()
  const decoder = new opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })
  const speaker = new Speaker({ sampleRate: 48000, channels: 2, bitDepth: 16 })

  stream.pipe(demuxer).pipe(decoder).pipe(speaker)
}

d()