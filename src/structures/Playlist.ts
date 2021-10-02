import axios from 'axios';
import * as Regexes from '../util/Regexes';
import { Util } from '../util/Util';
import { TypeError } from './TypeError';
import { DEFAULT_CONTEXT, ErrorCodes } from '../util/constants';

export interface PlaylistVideo {
    id: string;
    url: string;
    thumbnails: {
        width: number;
        height: number;
        url: string;
    }[];
    title: string;
    index: number;
    duration: number;
    formattedDuration: string;
    formattedReadableDuration: string;
    isPlayable: boolean;
}

export interface PlaylistData {
    name: string;
    description: string;
}

export class Playlist {
    tracks: PlaylistVideo[] = [];
    listId: string;
    data?: PlaylistData;
    totalPageCount = 0;

    private token?: string;
    private apiKey?: string;
    private clientVersion?: string;

    constructor(listId: string) {
        this.listId = listId;
    }

    get title() {
        return this.data?.name as string;
    }

    allLoaded(): this is this & { token: undefined } {
        return Boolean(this.token);
    }

    get description() {
        return this.data?.description;
    }

    async fetch(): Promise<this> {
        if (!this.tracks.length) {
            await this.fetchFirstPage();
        }

        if (!this.token || !this.apiKey) {
            await this.fetchFirstPage();
            if (!this.token) {
                throw new TypeError(ErrorCodes.UNKNOWN_TOKEN);
            } else {
                throw new TypeError(ErrorCodes.API_KEY_FAILED);
            }
        }

        const { data: json } = await axios.post(`${Util.getYTApiBaseURL()}/browse?key=${this.apiKey}`, {
            context: this.context,
            continuation: this.token
        });

        const tracks = json.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;

        const hasAnotherPage = Boolean(tracks[tracks.length - 1].continuationItemRenderer);

        if (hasAnotherPage) {
            const renderer = tracks[tracks.length - 1];

            this.token = renderer.continuationItemRenderer.continuationEndpoint.continuationCommand.token;

            if (!this.token) {
                throw new TypeError(ErrorCodes.UNKNOWN_TOKEN);
            }

            this.addTracks(tracks);
            return await this.fetch();
        } else {
            delete this.token;
            this.addTracks(tracks);
        }

        return this;
    }

    get url() {
        return `${Util.getYTPlaylistURL()}?list=${this.listId}`;
    }

    async fetchFirstPage() {
        if (this.tracks.length > 99) {
            return this.tracks.slice(0, 100);
        }

        const request = await axios.get<string>(`${Util.getYTPlaylistURL()}?list=${this.listId}&hl=en`).catch(() => {});

        if (!request) {
            throw new TypeError(ErrorCodes.PLAYLIST_LOAD_FAILED);
        }

        const res = Regexes.YOUTUBE_INITIAL_DATA.exec(request.data)?.[1];

        if (!res) {
            throw new TypeError(ErrorCodes.PLAYLIST_LOAD_FAILED);
        }

        const json = JSON.parse(res);

        const apiKey = Regexes.YOUTUBE_API_KEY.exec(request.data)?.[1];

        const version = Regexes.INNERTUBE_CLIENT_VERSION.exec(request.data)?.[1];

        if (!version) {
            throw new TypeError(ErrorCodes.CLIENT_VERSION_FAILED);
        } else if (!apiKey) {
            throw new TypeError(ErrorCodes.API_KEY_FAILED);
        }

        const metadata = json.metadata.playlistMetadataRenderer;

        this.data = {
            name: metadata.title,
            description: metadata.description
        };

        const tracks =
            json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;

        const hasAnotherPage = Boolean(tracks[tracks.length - 1].continuationItemRenderer);

        if (hasAnotherPage) {
            const renderer = tracks[tracks.length - 1];

            this.token = renderer.continuationItemRenderer.continuationEndpoint.continuationCommand.token;

            if (!this.token) {
                throw new TypeError(ErrorCodes.UNKNOWN_TOKEN);
            }
        }

        this.clientVersion = version;
        this.apiKey = apiKey;

        this.addTracks(tracks);

        return this.tracks.slice(0, 100);
    }

    get context() {
        const context = { ...DEFAULT_CONTEXT };

        if (this.clientVersion) {
            context.client.clientVersion = this.clientVersion;
        }

        return context;
    }

    private addTracks(tracks: any[]): this {
        for (const data of tracks) {
            const track = data.playlistVideoRenderer;

            if (track) {
                this.tracks.push({
                    url: `${Util.getYTVideoURL()}${track.videoId}`,
                    id: track.videoId,
                    index: Number(track.index.simpleText),
                    formattedDuration: track.lengthText.simpleText,
                    formattedReadableDuration: track.lengthText.accessibility.accessibilityData.label,
                    duration: Number(track.lengthSeconds) * 1000,
                    isPlayable: track.isPlayable,
                    thumbnails: track.thumbnail?.thumbnails ?? [],
                    title: track.title.runs[0].text
                });
            }
        }

        this.totalPageCount++;

        return this;
    }
}
