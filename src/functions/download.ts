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
        // This format is downloadable.
        const videoOrAudio = video.formats.filter((c) => c.hasVideo || c.hasAudio);
        // This format is suitable for live video or music bots.
        const liveOrOpus = videoOrAudio.filter((c) =>
            c.isLive ? c.isHLS : c.codec === 'opus' && c.hasAudio && !c.hasVideo
        );

        // Choose last available format because format is ascending order.
        return downloadFromVideo(
            video,
            liveOrOpus[liveOrOpus.length - 1] ?? videoOrAudio[videoOrAudio.length - 1],
            options
        );
    }
}
