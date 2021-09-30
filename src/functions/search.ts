import { Util } from '../util/Util';
import { getSearchInfo } from './getSearchInfo';

enum SearchType {
    'video' = 'EgIQAQ%3D%3D',
    'playlist' = 'EgIQAw%3D%3D',
    'channel' = 'EgIQAg%3D%3D'
}

export interface SearchOption {
    type?: 'video' | 'playlist' | 'channel';
    limit?: number;
}

export async function search(query: string, { type, limit = Infinity }: SearchOption = {}) {
    const params = new URLSearchParams();

    params.append('search_query', query);

    params.append('hl', 'en');

    if (type && SearchType[type]) {
        params.append('sp', SearchType[type]);
    }

    const { results } = await getSearchInfo(`${Util.getYTSearchURL()}?${params}`, limit);

    return results;
}
