import { Util } from '../util/Util';

export interface YoutubeSearchVideoInfo {
    id: string;
    thumbnails: {
        url: string;
        width: string;
        height: string;
    }[];
    url: string;
    title: string;
    publishedTimeAgo?: string;
    viewCount: number;
    formattedViewCount: number;
    description?: string;
    duration: number;
    formattedDuration: string;
    formattedReadableDuration: string;
    channel: {
        name: string;
        id: string;
        url: string;
        thumbnails: {
            url: string;
            width: number;
            height: number;
        }[];
    };
}

export interface YoutubeSearchListInfo {
    id: string;
    thumbnails: {
        url: string;
        width: string;
        height: string;
    }[];
    url: string;
    title: string;
    channel: {
        name: string;
        id: string;
        url: string;
    };
    videoCount: number;
}

export interface YoutubeSearchChannelInfo {
    id: string;
    thumbnails: {
        url: string;
        width: string;
        height: string;
    }[];
    url: string;
    title: string;
    verified: boolean;
    subscriberCount: number;
}

export class YoutubeSearchResults {
    private json: any;
    private limit: number;

    constructor(json: any, limit: number) {
        this.json = json;
        this.limit = limit;
    }

    getEstimatedResults() {
        return Number(this.json.estimatedResults);
    }

    get results(): (YoutubeSearchVideoInfo | YoutubeSearchListInfo | YoutubeSearchChannelInfo)[] {
        const arr: (YoutubeSearchVideoInfo | YoutubeSearchListInfo | YoutubeSearchChannelInfo)[] = [];

        const datas =
            this.json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents;

        for (const data of datas) {
            const video = data.videoRenderer;
            const list = data.playlistRenderer;
            const channel = data.channelRenderer;

            if (video) {
                const rawViewCount: string =
                    video.viewCountText?.simpleText?.split(' ')[0] ?? video.viewCountText?.runs[0]?.text;
                const formattedDuration = video.lengthText?.simpleText ?? '0';
                const formattedReadableDuration = video.lengthText?.accessibility?.accessibilityData.label ?? '0';
                const formattedViewCount =
                    video.shortViewCountText?.simpleText ?? video.shortViewCountText?.runs[0]?.text;

                arr.push({
                    url: `${Util.getYTVideoURL()}${video.videoId}`,
                    id: video.videoId,
                    thumbnails: video.thumbnail.thumbnails,
                    title: video.title.runs[0].text,
                    channel: {
                        name: video.ownerText.runs[0].text,
                        id: video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        url: `${Util.getYTChannelURL()}/${
                            video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId
                        }`,
                        thumbnails:
                            video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                                .thumbnails
                    },
                    viewCount: rawViewCount ? Number(rawViewCount.replace(/,/g, '')) : 0,
                    publishedTimeAgo: video.publishedTimeText?.simpleText,
                    formattedDuration: formattedDuration,
                    formattedReadableDuration: formattedReadableDuration,
                    formattedViewCount: formattedViewCount,
                    description: video.detailedMetadataSnippets?.[0].snippetText.runs.map((e: any) => e.text).join(''),
                    duration:
                        formattedDuration
                            .split(':')
                            .map((d: string) => Number(d))
                            .reduce((acc: number, time: number) => 60 * acc + time) * 1000
                });
            } else if (list) {
                arr.push({
                    url: `${Util.getYTPlaylistURL()}?list=${list.playlistId}`,
                    id: list.playlistId,
                    thumbnails: list.thumbnails,
                    title: list.title.simpleText,
                    channel: {
                        name: list.shortBylineText.runs[0].text,
                        id: list.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        url: `${Util.getYTChannelURL()}/${
                            list.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId
                        }`
                    },
                    videoCount: Number(list.videoCount.replace(/\D/g, ''))
                });
            } else if (channel) {
                const rawSubscriberCount: string = channel.subscriberCountText?.simpleText ?? '0';
                const badge = channel.ownerBadges?.[0];

                arr.push({
                    url: `${Util.getYTChannelURL()}/${channel.channelId}`,
                    id: channel.channelId,
                    thumbnails: channel.thumbnail.thumbnails,
                    title: channel.title.simpleText,
                    verified: Boolean(badge?.metadataBadgeRenderer?.style?.includes('VERIFIED')),
                    subscriberCount: Number(rawSubscriberCount)
                });
            }

            if (arr.length === this.limit) {
                break;
            }
        }

        return arr;
    }
}
