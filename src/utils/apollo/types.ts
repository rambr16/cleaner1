export interface SearchParams {
  page: number;
  personLocations: string[];
  personTitles: string[];
  organizationNumEmployeesRanges: string[];
  organizationKeywordTags: string[];
  notOrganizationKeywordTags: string[];
  includedKeywordFields: string[];
  excludedKeywordFields: string[];
}

export interface RawApolloData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  title?: string;
  company_name?: string;
  company_website?: string;
  company_linkedin_url?: string;
  linkedin_url?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
}

export interface ApolloSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company_name: string;
  company_website: string;
  company_linkedin_url: string;
  linkedin_url: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  industry: string;
  enriched_at: string;
}

export interface ApolloApiResponse {
  data: RawApolloData[];
  pagination: {
    total_entries: number;
    per_page: number;
    total_pages: number;
    current_page: number;
  };
}