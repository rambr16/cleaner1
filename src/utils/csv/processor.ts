import { GenericRow } from '../../types';
import { CSVRow } from './types';
import { checkEmailProvider } from '../emailUtils';
import { groupByDomain, findAlternateName } from './domain';

export const enrichRow = async (row: CSVRow): Promise<GenericRow> => {
  // Get domain groups for alternate DM lookup
  const groups = groupByDomain([row]);
  const emailDomain = row.email.split('@')[1];
  const group = emailDomain ? groups.find(g => g.domain === emailDomain) : undefined;
  
  return {
    ...row,
    email_provider: await checkEmailProvider(row.email),
    other_dm_name: group ? findAlternateName(row.email, group) || '' : ''
  };
};

export const processRows = async (rows: CSVRow[]): Promise<GenericRow[]> => {
  // Group rows by domain for alternate DM lookup
  const domainGroups = groupByDomain(rows);
  const domainMap = new Map(domainGroups.map(g => [g.domain, g]));
  
  return Promise.all(rows.map(async row => {
    const emailDomain = row.email.split('@')[1];
    const group = emailDomain ? domainMap.get(emailDomain) : undefined;
    
    return {
      ...row,
      email_provider: await checkEmailProvider(row.email),
      other_dm_name: group ? findAlternateName(row.email, group) || '' : ''
    };
  }));
};