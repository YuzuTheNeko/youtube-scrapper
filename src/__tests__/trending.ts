import getYoutubeTrending from "../functions/getYoutubeTrending";

getYoutubeTrending()
.then(trending  => {
    console.log(trending.videos)
})