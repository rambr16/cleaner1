export interface CSVRow {
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  website?: string;
  site?: string;
  domain?: string;
  company_website?: string;
  [key: string]: any;
}

export interface DomainGroup {
  domain: string;
  contacts: CSVRow[];
}