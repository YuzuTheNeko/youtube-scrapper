import { DownloadOptions, YoutubeVideoFormat } from '../structures/YoutubeVideo';
import { downloadFromVideo } from './downloadFromVideo';
import { getVideoInfo } from './getVideoInfo';

/**
 * Downloads a youtube stream using its url or id.
 * @param urlOrId The url or id of the song to download its stream.
 * @param format The format to use for the song.
 */
export async function download(urlOrId: string, format?: YoutubeVideoFormat, options?: DownloadOptions) {
    const video = await getVideoInfo(urlOrId);

    if (format) {
        // If a format was provided, we can just use it instead.
        return downloadFromVideo(video, format, options);
    } else {
        // This format is suitable for live video or music bots.
        const liveOrOpus = video.formats.find((c) =>
            c.isLive ? c.isHLS : c.codec === 'opus' && c.hasAudio && !c.hasVideo
        );

        return downloadFromVideo(video, liveOrOpus ?? video.formats[video.formats.length - 1], options);
    }
}
