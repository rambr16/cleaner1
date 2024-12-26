import { isPersonalEmail } from './validation';

export interface NameFields {
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

// Detect personal names vs organization names
const isPersonName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const normalized = name.toLowerCase().trim();
  
  // Common business indicators
  const businessTerms = [
    'inc', 'llc', 'ltd', 'corp', 'co', 'company', 'services', 
    'solutions', 'group', 'enterprises', 'technologies', 'consulting',
    'international', 'corporation', 'incorporated', 'limited',
    'agency', 'associates', 'partners', 'business', 'industries',
    'systems', 'holdings', 'global', 'software', 'team'
  ];

  // Check for business terms
  if (businessTerms.some(term => 
    normalized.includes(term) || 
    normalized.endsWith(` ${term}`)
  )) {
    return false;
  }

  // Check for special characters common in business names
  if (/[&@®™©#$%*]/.test(name)) {
    return false;
  }

  // Check name format (2-3 words, each capitalized)
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 3) return false;

  // Validate each word looks like a name
  return words.every(word => {
    // Names should be properly capitalized and contain only letters
    const isProperCase = /^[A-Z][a-z]+$/.test(word);
    // Names shouldn't be too short or too long
    const isValidLength = word.length >= 2 && word.length <= 20;
    return isProperCase && isValidLength;
  });
};

export const extractNameFields = (data: Record<string, string>): NameFields => {
  const nameFields: NameFields = {};
  
  // Common field name mappings
  const fieldMappings = {
    first_name: ['first_name', 'firstname', 'fname', 'given_name'],
    last_name: ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
    full_name: ['full_name', 'fullname', 'name', 'contact_name', 'person_name']
  };

  // Extract and validate name fields
  Object.entries(fieldMappings).forEach(([standardField, variants]) => {
    const foundKey = Object.keys(data).find(key => 
      variants.includes(key.toLowerCase().replace(/[^a-z]/g, ''))
    );
    
    if (foundKey) {
      const value = data[foundKey]?.trim();
      if (value && isPersonName(value)) {
        nameFields[standardField] = value;
      }
    }
  });

  return nameFields;
};

export const generateDmName = (nameFields: NameFields): string | undefined => {
  const { first_name, last_name, full_name } = nameFields;

  // Prefer first name + last name combination
  if (first_name && last_name) {
    const combinedName = `${first_name} ${last_name}`;
    return isPersonName(combinedName) ? combinedName : undefined;
  }

  // Fall back to full name if it's a valid person name
  if (full_name && isPersonName(full_name)) {
    return full_name;
  }

  return undefined;
};