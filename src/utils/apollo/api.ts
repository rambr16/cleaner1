import { APOLLO_API_ENDPOINT, APOLLO_PAGE_SIZE, getApiKey } from './config';
import { ApolloApiResponse, SearchParams } from './types';

export const fetchApolloData = async (params: SearchParams): Promise<ApolloApiResponse> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch(APOLLO_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: apiKey,
        page: params.page,
        per_page: APOLLO_PAGE_SIZE,
        person_locations: params.personLocations,
        person_titles: params.personTitles,
        organization_num_employees_ranges: params.organizationNumEmployeesRanges,
        q_organization_keyword_tags: params.organizationKeywordTags,
        q_not_organization_keyword_tags: params.notOrganizationKeywordTags,
        included_organization_keyword_fields: params.includedKeywordFields,
        excluded_organization_keyword_fields: params.excludedKeywordFields
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Apollo API error: ${error.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch data from Apollo API');
  }
};