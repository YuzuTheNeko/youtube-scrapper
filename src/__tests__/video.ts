import { getVideoInfo } from "../functions/getVideoInfo";

async function a() {
  const video = await getVideoInfo("https://www.youtube.com/watch?v=5qap5aO4i9A")

  console.log(video)
  console.log("formats", video.formats.length)
}

a()