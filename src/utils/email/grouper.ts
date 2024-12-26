import { EmailData, ContactGroup } from '../../types';

const COMMON_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'protonmail.com', 'mail.com'
]);

export const extractDomain = (email: string): string | undefined => {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !COMMON_EMAIL_PROVIDERS.has(domain) ? domain : undefined;
  } catch {
    return undefined;
  }
};

export const normalizeWebsite = (website: string): string => {
  return website.toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/$/, '');
};

export const groupByDomain = (emails: EmailData[]): ContactGroup[] => {
  const groups = new Map<string, Set<EmailData>>();
  
  emails.forEach(email => {
    const possibleDomains = new Set<string>();
    
    // Check email domain
    const emailDomain = extractDomain(email.email);
    if (emailDomain) possibleDomains.add(emailDomain);
    
    // Add any website/domain fields from common data
    ['website', 'site', 'domain', 'company_website'].forEach(field => {
      if (email[field]) {
        possibleDomains.add(normalizeWebsite(email[field]));
      }
    });
    
    // Add email to all matching domain groups
    possibleDomains.forEach(domain => {
      const existing = groups.get(domain) || new Set();
      existing.add(email);
      groups.set(domain, existing);
    });
  });
  
  return Array.from(groups.entries())
    .filter(([_, contacts]) => contacts.size >= 2) // Only keep groups with 2+ contacts
    .map(([website, contacts]) => ({
      website,
      contacts: Array.from(contacts)
    }));
};

export const findAlternateDm = (
  currentEmail: string,
  group: ContactGroup
): string | undefined => {
  const current = group.contacts.find(c => 
    c.email.toLowerCase() === currentEmail.toLowerCase()
  );
  
  if (!current?.full_name) return undefined;
  
  // Find all other contacts with different names
  const alternates = group.contacts.filter(c => 
    c.email.toLowerCase() !== currentEmail.toLowerCase() &&
    c.full_name && 
    c.full_name !== current.full_name
  );
  
  // Return the first alternate name if found
  return alternates.length > 0 ? alternates[0].full_name : undefined;
}