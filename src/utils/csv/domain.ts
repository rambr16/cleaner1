import { CSVRow, DomainGroup } from './types';

const COMMON_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'protonmail.com', 'mail.com'
]);

export const normalizeUrl = (url: string): string => {
  return url.toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/$/, '');
};

export const getDomainFromEmail = (email: string): string | undefined => {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !COMMON_EMAIL_PROVIDERS.has(domain) ? domain : undefined;
  } catch {
    return undefined;
  }
};

export const groupByDomain = (rows: CSVRow[]): DomainGroup[] => {
  const domainGroups = new Map<string, Set<CSVRow>>();
  
  rows.forEach(row => {
    const domains = new Set<string>();
    
    // Get domain from email
    const emailDomain = getDomainFromEmail(row.email);
    if (emailDomain) domains.add(emailDomain);
    
    // Get domains from website fields
    ['website', 'site', 'domain', 'company_website'].forEach(field => {
      if (row[field]) {
        domains.add(normalizeUrl(row[field]));
      }
    });
    
    // Add row to each domain group
    domains.forEach(domain => {
      const group = domainGroups.get(domain) || new Set();
      group.add(row);
      domainGroups.set(domain, group);
    });
  });
  
  return Array.from(domainGroups.entries())
    .filter(([_, contacts]) => contacts.size >= 2)
    .map(([domain, contacts]) => ({
      domain,
      contacts: Array.from(contacts)
    }));
};

export const findAlternateName = (
  currentEmail: string,
  group: DomainGroup
): string | undefined => {
  const current = group.contacts.find(c => 
    c.email.toLowerCase() === currentEmail.toLowerCase()
  );
  
  if (!current?.full_name) return undefined;
  
  const alternate = group.contacts.find(c => 
    c.email.toLowerCase() !== currentEmail.toLowerCase() &&
    c.full_name && 
    c.full_name !== current.full_name
  );
  
  return alternate?.full_name;
};