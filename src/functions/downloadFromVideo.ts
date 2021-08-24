import { DownloadOptions, YoutubeVideo, YoutubeVideoFormat } from "../structures/YoutubeVideo";

/**
 * Downloads a 
 * @param video 
 * @param format 
 * @returns 
 */
export function downloadFromVideo(video: YoutubeVideo, format?: YoutubeVideoFormat, options?: DownloadOptions) {
    if (!format) format = video.formats.find(c => c.quality !== "LOW")
    
    if (!format) {
        throw new Error(`Could not find suitable format for this download.`)
    }

    return video.download(format, options)
}