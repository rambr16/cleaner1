import { ApolloSearchResult, RawApolloData } from './types';

export const mapApolloData = (data: RawApolloData): ApolloSearchResult => ({
  id: data.id,
  first_name: data.first_name || '',
  last_name: data.last_name || '',
  email: data.email || '',
  title: data.title || '',
  company_name: data.company_name || '',
  company_website: data.company_website || '',
  company_linkedin_url: data.company_linkedin_url || '',
  linkedin_url: data.linkedin_url || '',
  phone: data.phone || '',
  city: data.city || '',
  state: data.state || '',
  country: data.country || '',
  industry: data.industry || '',
  enriched_at: new Date().toISOString()
});