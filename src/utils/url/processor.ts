import Papa from 'papaparse';
import { ProgressStatus } from '../../types';
import { processBatch, calculateEstimatedTime } from '../batchProcessor';
import { UrlProcessingResult } from './types';
import { validateUrlColumns, isValidUrl } from './validation';
import { extractDomain } from './domainExtractor';

export const processUrlData = async (
  file: File,
  onProgress: (status: ProgressStatus) => void
): Promise<UrlProcessingResult[]> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const results: UrlProcessingResult[] = [];
    const uniqueDomains = new Set<string>();

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        try {
          const rows = parseResults.data as Record<string, string>[];
          if (rows.length === 0) {
            throw new Error('No data found in the CSV file');
          }

          // Validate URL columns
          const urlColumns = validateUrlColumns(Object.keys(rows[0]));

          const processed = await processBatch(
            rows,
            async (row) => {
              const cleanedDomains = new Set<string>();
              const errors: string[] = [];

              // Only process URL columns
              for (const column of urlColumns) {
                const value = row[column]?.trim();
                if (!value) continue;

                if (!isValidUrl(value)) {
                  errors.push(`Invalid URL in ${column}: ${value}`);
                  continue;
                }

                const domain = extractDomain(value);
                if (domain) {
                  cleanedDomains.add(domain);
                  uniqueDomains.add(domain);
                }
              }

              return {
                originalRow: row,
                cleanedDomains,
                errors
              };
            },
            (processed) => {
              onProgress({
                total: rows.length,
                current: processed,
                stage: 'processing',
                estimatedTimeRemaining: calculateEstimatedTime(processed, rows.length, startTime)
              });
            }
          );

          resolve(processed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(new Error(`Failed to parse CSV: ${error.message}`))
    });
  });
};