import { download } from "../functions/download";
import { downloadFromVideo } from "../functions/downloadFromVideo";
import { getChannel } from "../functions/getChannel";
import { getPlaylistInfo } from "../functions/getPlaylistInfo";
import { getUser } from "../functions/getUser";
import { getVideoInfo } from "../functions/getVideoInfo";
import { getYoutubeTrending } from "../functions/getYoutubeTrending";
import { search } from "../functions/search";

/**
 * Just a manager class with all functions this package brings to you.
 */
export class Manager {
    get search() {
        return search
    }

    get getPlaylistInfo() {
        return getPlaylistInfo
    }

    get getVideoInfo() {
        return getVideoInfo
    }

    get getUser() {
        return getUser
    }

    get download() {
        return download
    }

    get getYoutubeTrending() {
        return getYoutubeTrending
    }

    get downloadFromVideo() {
        return downloadFromVideo
    }

    get getChannel() {
        return getChannel
    }
}