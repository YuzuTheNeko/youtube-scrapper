import { getVideoInfo } from '../functions/getVideoInfo';

async function a() {
    console.time('w');
    const video = await getVideoInfo('https://www.youtube.com/watch?v=gBF2TqxjJSk');
    console.log(video.url);
    console.timeEnd('w');
}

a();
