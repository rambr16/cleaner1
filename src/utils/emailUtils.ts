import { ProcessingStats } from '../types';

const MX_CACHE = new Map<string, string>();

export const checkEmailProvider = async (email: string): Promise<string> => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'Invalid email';
  }

  try {
    const domain = email.split('@')[1];
    
    // Check cache first
    if (MX_CACHE.has(domain)) {
      return MX_CACHE.get(domain)!;
    }

    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`
    );
    const data = await response.json();

    let provider = 'Other';
    if (data.Answer && data.Answer.length > 0) {
      const mxRecords = data.Answer.map((record: any) => record.data);

      if (mxRecords.some((record: string) => record.includes('google.com'))) {
        provider = 'Google';
      } else if (
        mxRecords.some(
          (record: string) =>
            record.includes('outlook.com') || record.includes('microsoft.com')
        )
      ) {
        provider = 'Microsoft';
      }
    } else {
      provider = 'No MX records found';
    }

    // Cache the result
    MX_CACHE.set(domain, provider);
    return provider;
  } catch (e) {
    return 'Error fetching MX records';
  }
};