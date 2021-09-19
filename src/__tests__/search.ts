import { search } from "../functions/search";

async function s() {
  const result = await search('i')

  console.log(result.videos)
}

s()