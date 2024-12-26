import { SPECIAL_TLDS } from './constants';

export const extractDomain = (url: string): string => {
  try {
    // Clean the URL first
    let cleanUrl = url.trim()
      .replace(/\s+/g, '')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split(/[/?#]/)[0]
      .toLowerCase();

    // Handle empty or invalid domains
    if (!cleanUrl) return '';

    // Split into parts and filter out empty strings
    const parts = cleanUrl.split('.').filter(Boolean);
    
    if (parts.length < 2) return '';
    
    // Handle special TLDs
    if (parts.length > 2) {
      const lastTwoParts = parts.slice(-2).join('.');
      if (SPECIAL_TLDS.includes(lastTwoParts as any)) {
        return parts.slice(-3).join('.');
      }
    }
    
    // Return last two parts for normal domains
    return parts.slice(-2).join('.');
  } catch {
    return '';
  }
};