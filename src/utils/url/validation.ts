import { URL_COLUMNS } from './constants';

export const validateUrlColumns = (headers: string[]): string[] => {
  const urlColumns = headers.filter(header => 
    URL_COLUMNS.includes(header.toLowerCase().trim())
  );

  if (urlColumns.length === 0) {
    throw new Error('No URL columns found in CSV. Expected columns: website, site, sites, or domains');
  }

  return urlColumns;
};

export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Remove whitespace and common prefixes
  const cleanUrl = url.trim()
    .replace(/\s+/g, '')
    .toLowerCase();
    
  // Allow basic domain patterns
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(cleanUrl)) {
    return true;
  }
  
  try {
    // Try parsing as full URL
    new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    return true;
  } catch {
    return false;
  }
};