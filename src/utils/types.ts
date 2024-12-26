export interface EmailData {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
}

export interface DomainData {
  emails: EmailData[];
  names: string[];
}