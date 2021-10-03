import { DownloadOptions, YoutubeVideo, YoutubeVideoFormat } from '../structures/YoutubeVideo';
import { ErrorCodes } from '../util/constants';

/**
 * Downloads a youtube stream using its YoutubeVideo class.
 * @param video The YoutubeVideo class of the song to download its stream.
 * @param format The format to use for the song.
 * @returns
 */
export function downloadFromVideo(video: YoutubeVideo, format?: YoutubeVideoFormat, options?: DownloadOptions) {
    if (!format) {
        const videoOrAudio = video.formats.filter((c) => c.hasVideo || c.hasAudio);
        format = videoOrAudio[videoOrAudio.length - 1];
    }

    if (!format) {
        throw new Error(ErrorCodes.NO_AVAILABLE_FORMAT);
    }

    return video.download(format, options);
}
