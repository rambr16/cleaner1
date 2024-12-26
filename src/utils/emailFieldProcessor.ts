import { EmailGroup } from '../types';
import { isValidEmail } from './validation';
import { extractNameFields, generateDmName } from './nameProcessor';

export const extractEmailGroups = (row: Record<string, any>): EmailGroup[] => {
  const groups: EmailGroup[] = [];
  
  // Process numbered email fields (email_1, email_2, etc.)
  for (let i = 1; i <= 10; i++) { // Support up to 10 email fields
    const emailKey = `email_${i}`;
    const email = row[emailKey]?.trim();
    
    if (email && isValidEmail(email)) {
      const nameFields = extractNameFields({
        first_name: row[`${emailKey}_first_name`],
        last_name: row[`${emailKey}_last_name`],
        full_name: row[`${emailKey}_full_name`]
      });
      
      groups.push({
        email: email.toLowerCase(),
        ...nameFields,
        title: row[`${emailKey}_title`]?.trim(),
        phone: row[`${emailKey}_phone`]?.trim(),
        source_column: emailKey
      });
    }
  }
  
  return groups;
};

export const generateFullName = (group: EmailGroup): string | undefined => {
  return generateDmName({
    first_name: group.first_name,
    last_name: group.last_name,
    full_name: group.full_name
  });
};