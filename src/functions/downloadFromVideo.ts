import { DownloadOptions, YoutubeVideo, YoutubeVideoFormat } from '../structures/YoutubeVideo';
import { ErrorCodes } from '../util/constants';

/**
 * Downloads a
 * @param video
 * @param format
 * @returns
 */
export function downloadFromVideo(video: YoutubeVideo, format?: YoutubeVideoFormat, options?: DownloadOptions) {
    if (!format) {
        format = video.formats.find((c) => c.quality !== 'LOW');
    }

    if (!format) {
        throw new Error(ErrorCodes.NO_AVAILABLE_FORMAT);
    }

    return video.download(format, options);
}
