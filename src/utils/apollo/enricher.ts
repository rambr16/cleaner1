import { parseSearchUrl } from './parser';
import { fetchApolloData } from './api';
import { mapApolloData } from './mapper';
import { ApolloSearchResult } from './types';

export async function enrichApolloData(searchUrl: string): Promise<ApolloSearchResult[]> {
  try {
    const searchParams = parseSearchUrl(searchUrl);
    const response = await fetchApolloData(searchParams);
    return response.data.map(mapApolloData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to enrich Apollo data: ${error.message}`);
    }
    throw error;
  }
}