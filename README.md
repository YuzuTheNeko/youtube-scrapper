# youtube-scrapper
[![NPM Version](https://img.shields.io/npm/v/youtube-scrapper.svg?maxAge=3600)](https://www.npmjs.com/package/youtube-scrapper)
[![NPM Downloads](https://img.shields.io/npm/dt/youtube-scrapper.svg?maxAge=3600)](https://www.npmjs.com/package/youtube-scrapper)

## Table Of Contents
- [Installing](#installing)
- [Useful Links](#links)
- [Example Usage](#example)
- [Disclaimer](#disclaimer)

### Links
- [Documentation](https://rubenennj.github.io/youtube-scrapper)
- [GitHub Repository](https://github.com/Rubenennj/youtube-scrapper)

### Installing
Simply use `npm i youtube-scrapper`.

### Example
```js
const scrapper = require("youtube-scrapper")
const { createWriteStream } = require("fs")

async function main() {
    // Getting videos through query.
    const result = await scrapper.search("best hits 2010")

    console.log(result.videos.map(vid => vid.details.title)) // Array of videos mapped by name.

    // Downloading first result and piping to a file.
    // We have to get the full song info first.
    const video = await scrapper.getVideoInfo(result.videos[0].id)

    // Write to file.
    scrapper
        .downloadFromVideo(video)
        .pipe(createWriteStream("./song.ogg"))
}

main()
```