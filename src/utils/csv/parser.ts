import Papa from 'papaparse';
import { GenericRow, ProgressStatus } from '../../types';
import { validateHeaders, validateRow } from './validators';
import { enrichRow } from './processor';
import { processBatch, calculateEstimatedTime } from '../batchProcessor';

export const parseCSV = async (
  file: File,
  onProgress: (status: ProgressStatus) => void
): Promise<GenericRow[]> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let totalRows = 0;
    const uniqueEmails = new Set<string>();
    const processedData: GenericRow[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunk: async (results, parser) => {
        parser.pause();
        
        try {
          if (totalRows === 0) {
            validateHeaders(Object.keys(results.data[0] || {}));
          }

          // Filter for valid emails and duplicates
          const validRows = results.data.filter(row => {
            const email = row.email?.trim().toLowerCase(); // Normalize email
            if (!email || uniqueEmails.has(email)) return false;
            uniqueEmails.add(email);
            return true;
          });

          totalRows += validRows.length;
          
          onProgress({
            total: totalRows,
            current: processedData.length,
            stage: 'parsing',
            estimatedTimeRemaining: calculateEstimatedTime(processedData.length, totalRows, startTime)
          });

          const enrichedRows = await processBatch(
            validRows,
            async (row: any) => enrichRow(row),
            (processed) => {
              onProgress({
                total: totalRows,
                current: processed + processedData.length,
                stage: 'mx-lookup',
                estimatedTimeRemaining: calculateEstimatedTime(processed + processedData.length, totalRows, startTime)
              });
            }
          );

          processedData.push(...enrichedRows);
          parser.resume();
        } catch (error) {
          parser.abort();
          reject(error);
        }
      },
      complete: () => {
        if (processedData.length === 0) {
          reject(new Error('No valid email addresses found in the CSV file'));
        } else {
          resolve(processedData);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    });
  });
};