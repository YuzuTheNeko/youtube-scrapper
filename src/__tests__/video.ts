import getVideoInfo from "../functions/getVideoInfo";

async function a() {
  const video = await getVideoInfo("https://www.youtube.com/watch?v=e3fWFJwFXZQ")

  console.log(video)
}

a()