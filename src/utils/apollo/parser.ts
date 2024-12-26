import { SearchParams } from './types';

export const parseSearchUrl = (searchUrl: string): SearchParams => {
  try {
    const url = new URL(searchUrl);
    const params = Object.fromEntries(url.searchParams.entries());
    
    return {
      page: parseInt(params.page) || 1,
      personLocations: params.personLocations?.split(',') || [],
      personTitles: params.personTitles?.split(',').map(decodeURIComponent) || [],
      organizationNumEmployeesRanges: params.organizationNumEmployeesRanges?.split(',').map(decodeURIComponent) || [],
      organizationKeywordTags: params.qOrganizationKeywordTags?.split(',').map(decodeURIComponent) || [],
      notOrganizationKeywordTags: params.qNotOrganizationKeywordTags?.split(',').map(decodeURIComponent) || [],
      includedKeywordFields: params.includedOrganizationKeywordFields?.split(',') || [],
      excludedKeywordFields: params.excludedOrganizationKeywordFields?.split(',') || []
    };
  } catch (error) {
    throw new Error('Invalid Apollo search URL. Please make sure to copy the complete URL from Apollo.');
  }
};