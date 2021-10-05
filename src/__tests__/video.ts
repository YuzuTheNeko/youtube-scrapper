import { getVideoInfo } from "../functions/getVideoInfo";

async function a() {
  console.time("w")
  const video = await getVideoInfo("https://www.youtube.com/watch?v=qZjfDbu6hnE")
  console.timeEnd("w")

  console.time("w")
  const s = await getVideoInfo("https://www.youtube.com/watch?v=qZjfDbu6hnE")
  console.timeEnd("w")
}

a()