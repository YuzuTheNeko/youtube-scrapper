import { YoutubeVideoFormat } from '../structures/YoutubeVideo';
import { parse as xmlParse } from 'fast-xml-parser';
import { formats } from './formats';
import axios from 'axios';

export class Util extends null {
    constructor() {}

    static getBaseYTURL() {
        return 'https://www.youtube.com';
    }

    static getYTSearchURL() {
        return 'https://www.youtube.com/results';
    }

    static getYTVideoURL() {
        return 'https://www.youtube.com/watch?v=';
    }

    static getYTChannelURL() {
        return 'https://www.youtube.com/channel';
    }

    static getYTTrendingURL() {
        return 'https://www.youtube.com/feed/trending';
    }

    static getYTUserURL() {
        return 'https://www.youtube.com/user';
    }

    static getYTPlaylistURL() {
        return 'https://www.youtube.com/playlist';
    }

    static getYTApiBaseURL() {
        return 'https://www.youtube.com/youtubei/v1';
    }

    static getId(str: string) {
        return str.includes('/v/')
            ? str.split('/v/')[1].split('&')[0]
            : str.includes('youtube.com/embed/')
            ? str.split('embed/')[1].split('&')[0]
            : str.includes('youtu.be/') && !str.includes('/v/')
            ? str.split('youtu.be/')[1].split('&')[0]
            : str.includes('watch?v=')
            ? str.split('watch?v=')[1].split('&')[0]
            : str;
    }

    static getListId(str: string) {
        return str.includes('&list=')
            ? str.split('&list=')[1].split('&')[0]
            : str.includes('?list=')
            ? str.split('?list=')[1].split('&')[0]
            : str;
    }

    static addMetadataToFormat(format: YoutubeVideoFormat): YoutubeVideoFormat {
        format = { ...formats[format.itag as keyof typeof formats], ...format };
        format.hasVideo = Boolean(format.qualityLabel);
        format.hasAudio = Boolean(format.audioBitrate);
        format.isLive = /\bsource[/=]yt_(live|premiere)_broadcast\b/.test(format.url as string);
        format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url as string);
        format.isDashMPD = /\/manifest\/dash\//.test(format.url as string);
        return format;
    }

    static async dashMpdFormat(url: string): Promise<YoutubeVideoFormat[]> {
        const moreFormats: YoutubeVideoFormat[] = [];
        try {
            const { data } = await axios.get<string>(new URL(url, Util.getYTVideoURL()).toString());
            const xml = xmlParse(data, {
                attributeNamePrefix: '$',
                ignoreAttributes: false
            });

            for (const adaptationSet of xml.MPD.Period.AdaptationSet) {
                for (const representation of adaptationSet.Representation) {
                    const itag = Number(representation['$id']) as keyof typeof formats;
                    const reservedFormat = formats[itag];

                    if (reservedFormat) {
                        const format: YoutubeVideoFormat = {
                            ...reservedFormat,
                            itag,
                            url,
                            type: reservedFormat.mimeType.split(';')[0],
                            codec: reservedFormat.mimeType.split('"')[1]
                        };

                        if (representation['$height']) {
                            format.width = Number(representation['$width']);
                            format.height = Number(representation['$height']);
                            format.fps = Number(representation['$frameRate']);
                        }

                        moreFormats.push(Util.addMetadataToFormat(format));
                    }
                }
            }
        } catch {}
        return moreFormats;
    }

    static async m3u8Format(url: string): Promise<YoutubeVideoFormat[]> {
        const moreFormats: YoutubeVideoFormat[] = [];
        try {
            const { data } = await axios.get<string>(new URL(url, Util.getYTVideoURL()).toString());

            for (const line of data.split('\n')) {
                if (!/^https?:\/\//.test(line)) {
                    continue;
                }

                const itag = Number(line.match(/\/itag\/(\d+)\//)?.[1]) as keyof typeof formats;
                const reservedFormat = formats[itag];

                if (reservedFormat) {
                    const format: YoutubeVideoFormat = {
                        ...reservedFormat,
                        itag,
                        url: line,
                        type: reservedFormat.mimeType.split(';')[0],
                        codec: reservedFormat.mimeType.split('"')[1]
                    };

                    moreFormats.push(Util.addMetadataToFormat(format));
                }
            }
        } catch {}
        return moreFormats;
    }
}
