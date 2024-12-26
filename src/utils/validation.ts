export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPersonalEmail = (firstName: string, lastName: string): boolean => {
  return Boolean(firstName?.trim() && lastName?.trim());
};