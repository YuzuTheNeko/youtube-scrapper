import { search } from "../functions/search";

async function s() {
  const result = await search('i')

  const video = result.video(0)

  const video2 = result.video(1)

  console.log(result.videos.length)
  
  console.log(video.title, video2.title, result.videos[0].title)
}

s()