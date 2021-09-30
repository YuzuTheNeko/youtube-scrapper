import { getVideoInfo } from '../functions/getVideoInfo';

async function d() {
    const video = await getVideoInfo('https://www.youtube.com/watch?v=gBF2TqxjJSk&list=RDgBF2TqxjJSk&start_radio=1');
    console.log(video.formats.length);
    const v = await getVideoInfo('https://www.youtube.com/watch?v=gBF2TqxjJSk&list=RDgBF2TqxjJSk&start_radio=1');
    console.log(v.formats.length);
}

d();
