import { search } from "../functions/search";

async function s() {
  const result = await search('lofi hip hop radio')

  console.log(result.getVideos())
}

s()