import { DownloadOptions, YoutubeVideoFormat } from "../structures/YoutubeVideo";
import { downloadFromVideo } from "./downloadFromVideo";
import { getVideoInfo } from "./getVideoInfo";

/**
 * Downloads a youtube stream using its url or id.
 * @param urlOrId The url or id of the song to download its stream.
 * @param format The format to use for the song.
 */
export async function download(urlOrId: string, format?: YoutubeVideoFormat, options?: DownloadOptions) {
    const video = await getVideoInfo(urlOrId)

    if (format) {
        // If a format was provided, we can just use it instead.
        return downloadFromVideo(video, format, options)
    } else {
        // This format is suitable for music bots.
        const opus = video.formats.find(c => c.codec === "opus" && c.hasAudio && c.url && !c.hasVideo)

        if (opus) {
            return downloadFromVideo(video, opus, options)
        } else {
            // This will last available format.
            return downloadFromVideo(video, video.formats[video.formats.length - 1], options)
        }
    }
}