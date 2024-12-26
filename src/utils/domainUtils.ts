export interface ContactInfo {
  email: string;
  name?: string;
  website: string;
}

export const extractWebsite = (email: string): string | undefined => {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return undefined;
    
    // Remove common email provider domains
    const commonProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'protonmail.com', 'mail.com'
    ];
    
    return commonProviders.includes(domain) ? undefined : domain;
  } catch {
    return undefined;
  }
};

export const groupByWebsite = (contacts: ContactInfo[]): Map<string, ContactInfo[]> => {
  const websiteGroups = new Map<string, ContactInfo[]>();
  
  contacts.forEach(contact => {
    const website = contact.website;
    if (!website) return;
    
    const existingGroup = websiteGroups.get(website) || [];
    existingGroup.push(contact);
    websiteGroups.set(website, existingGroup);
  });
  
  return websiteGroups;
};

export const findOtherDm = (
  currentEmail: string,
  websiteGroups: Map<string, ContactInfo[]>
): string | undefined => {
  const website = extractWebsite(currentEmail);
  if (!website) return undefined;
  
  const contacts = websiteGroups.get(website);
  if (!contacts || contacts.length < 2) return undefined;
  
  // Find current contact and an alternative
  const currentContact = contacts.find(c => c.email.toLowerCase() === currentEmail.toLowerCase());
  if (!currentContact || !currentContact.name) return undefined;
  
  // Find another contact from the same company with a different name
  const otherContact = contacts.find(c => 
    c.email.toLowerCase() !== currentEmail.toLowerCase() &&
    c.name && c.name !== currentContact.name
  );
  
  return otherContact?.name;
};