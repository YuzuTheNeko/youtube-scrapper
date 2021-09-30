export const YOUTUBE_INITIAL_DATA = /var\s+ytInitialData\s*=\s*({.+?});/;
export const YOUTUBE_PLAYER_RESPONSE = /var\s+ytInitialPlayerResponse\s*=\s*({.+?});/;
export const YOUTUBE_API_KEY = /"(?:INNERTUBE_API_KEY|innertubeApiKey)":"(.+?)"/;
export const INNERTUBE_CLIENT_VERSION =
    /"(?:INNERTUBE_CONTEXT_CLIENT_VERSION|innertube_context_client_version)":"(.+?)"/;
export const PLAYER_URL = /"jsUrl":"(.+?)"/;
