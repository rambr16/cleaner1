import { isValidEmail } from '../validation';

export const validateHeaders = (headers: string[]) => {
  if (!headers.includes('email')) {
    throw new Error('The CSV file must contain an "email" column');
  }
};

export const validateRow = (row: any, uniqueEmails: Set<string>): boolean => {
  const email = row.email?.trim();
  return isValidEmail(email) && !uniqueEmails.has(email);
};