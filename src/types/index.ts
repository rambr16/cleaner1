export interface ProcessedRow {
  // Email related fields
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  email_provider?: string;
  other_dm_name?: string;
  source_column: string;
  website?: string;
  
  // Common fields from original CSV
  [key: string]: any;
}

export interface ProgressStatus {
  total: number;
  current: number;
  stage: 'parsing' | 'processing' | 'mx-lookup' | 'complete';
  estimatedTimeRemaining: number;
}

export interface EmailData {
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  website?: string;
}

export interface ContactGroup {
  website: string;
  contacts: EmailData[];
}