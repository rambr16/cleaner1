import { EmailData } from '../../types';
import { isValidEmail } from '../validation';

const EMAIL_RELATED_FIELDS = new Set([
  'email_1', 'email_2', 'email_3',
  'email_1_full_name', 'email_2_full_name', 'email_3_full_name',
  'email_1_first_name', 'email_2_first_name', 'email_3_first_name',
  'email_1_last_name', 'email_2_last_name', 'email_3_last_name',
  'email_1_title', 'email_2_title', 'email_3_title',
  'email_1_phone', 'email_2_phone', 'email_3_phone'
]);

export const parseEmailFields = (row: Record<string, any>): EmailData[] => {
  const emails: EmailData[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const prefix = `email_${i}`;
    const email = row[prefix]?.trim();
    
    if (email && isValidEmail(email)) {
      emails.push({
        email: email.toLowerCase(),
        full_name: row[`${prefix}_full_name`]?.trim(),
        first_name: row[`${prefix}_first_name`]?.trim(),
        last_name: row[`${prefix}_last_name`]?.trim(),
        title: row[`${prefix}_title`]?.trim(),
        phone: row[`${prefix}_phone`]?.trim(),
        // Include original row index for common data mapping
        rowIndex: row._rowIndex
      });
    }
  }
  
  return emails;
};

export const getCommonFields = (row: Record<string, any>): Record<string, any> => {
  const commonFields: Record<string, any> = {};
  
  Object.entries(row).forEach(([key, value]) => {
    if (!EMAIL_RELATED_FIELDS.has(key) && value !== null && value !== undefined) {
      commonFields[key] = value;
    }
  });
  
  return commonFields;
};