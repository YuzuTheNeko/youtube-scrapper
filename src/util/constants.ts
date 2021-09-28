export enum ErrorCodes {
    'NO_AVAILABLE_FORMAT' = 'Could not find a suitable format for this download.',
    'UNKNOWN_TOKEN' = 'An invalid token was found.',
    'PLAYLIST_LOAD_FAILED' = 'Failed to load desired playlist.',
    'UNSUPPORTED_FORMAT' = 'Livestreams are not yet supported.',
    'SEARCH_FAILED' = 'Failed to search for videos.',
    'API_KEY_FAILED' = 'Could not find api key in request.',
    'CLIENT_VERSION_FAILED' = 'Could not find client version in request.',
    'NO_PLAYLIST_TOKEN' = 'Could not find the token to continue pagination load.'
}

export const DEFAULT_CONTEXT = {
    client: {
        hl: 'en',
        utcOffsetMinutes: 0,
        gl: 'US',
        clientName: 'WEB',
        clientVersion: ''
    },
    user: {},
    request: {}
};
