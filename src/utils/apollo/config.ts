// Apollo API configuration
export const APOLLO_API_ENDPOINT = 'https://api.apollo.io/api/v1/people/search';
export const APOLLO_PAGE_SIZE = 100;

export const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_APOLLO_API_KEY;
  if (!apiKey) {
    throw new Error('Apollo API key not configured. Please add VITE_APOLLO_API_KEY to your .env file.');
  }
  return apiKey;
};