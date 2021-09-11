import { getVideoInfo } from "../functions/getVideoInfo";

async function a() {
  console.time("w")
  const video = await getVideoInfo("https://www.youtube.com/watch?v=5qap5aO4i9A")
  console.timeEnd("w")
}

a()