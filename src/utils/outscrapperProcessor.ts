import Papa from 'papaparse';
import { ProcessedRow, ProgressStatus, EmailData } from '../types';
import { checkEmailProvider } from './emailUtils';
import { parseEmailFields, getCommonFields } from './email/parser';
import { groupByDomain, findAlternateDm } from './email/grouper';
import { processBatch, calculateEstimatedTime } from './batchProcessor';

export const processOutscrapperData = async (
  file: File,
  onProgress: (status: ProgressStatus) => void
): Promise<ProcessedRow[]> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const rows: Record<string, any>[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunk: async (results, parser) => {
        parser.pause();
        // Add row index for mapping common fields later
        const rowsWithIndex = results.data.map((row, index) => ({
          ...row,
          _rowIndex: rows.length + index
        }));
        rows.push(...rowsWithIndex);
        parser.resume();
      },
      complete: async () => {
        try {
          // Extract all email data and common fields
          const allEmailData: EmailData[] = [];
          const commonFieldsMap = new Map<number, Record<string, any>>();
          
          rows.forEach((row, index) => {
            const emailFields = parseEmailFields(row);
            allEmailData.push(...emailFields);
            commonFieldsMap.set(row._rowIndex, getCommonFields(row));
          });

          // Group by domain for alternate DM lookup
          const groups = groupByDomain(allEmailData);
          const domainMap = new Map(groups.map(g => [g.website, g]));

          // Process and enrich each email
          const processedRows = await processBatch(
            allEmailData,
            async (data) => {
              const domain = data.email.split('@')[1];
              const group = domain ? domainMap.get(domain) : undefined;
              const commonFields = commonFieldsMap.get(data.rowIndex) || {};
              
              const processedRow = {
                ...commonFields,
                email: data.email,
                full_name: data.full_name || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                title: data.title || '',
                phone: data.phone || '',
                email_provider: await checkEmailProvider(data.email),
                other_dm_name: group ? findAlternateDm(data.email, group) : '',
                website: domain || ''
              };

              // Remove internal tracking fields
              delete processedRow._rowIndex;
              
              return processedRow as ProcessedRow;
            },
            (processed) => {
              onProgress({
                total: allEmailData.length,
                current: processed,
                stage: 'mx-lookup',
                estimatedTimeRemaining: calculateEstimatedTime(processed, allEmailData.length, startTime)
              });
            }
          );

          resolve(processedRows);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};