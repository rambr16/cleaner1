import Papa from 'papaparse';
import { OutscrapperRow, ProcessedRow, ProgressStatus } from '../types';
import { checkEmailProvider } from './emailUtils';
import { processBatch, calculateEstimatedTime } from './batchProcessor';

export const processOutscrapperData = async (
  file: File,
  onProgress: (status: ProgressStatus) => void
): Promise<ProcessedRow[]> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let totalRows = 0;
    
    Papa.parse(file, {
      header: true,
      chunk: async (results, parser) => {
        parser.pause();
        totalRows += results.data.length;
        
        try {
          const data = results.data as OutscrapperRow[];
          onProgress({
            total: totalRows,
            current: results.data.length,
            stage: 'parsing',
            estimatedTimeRemaining: calculateEstimatedTime(results.data.length, totalRows, startTime)
          });
          
          const processedChunk = await processChunk(data, totalRows, startTime, onProgress);
          parser.resume();
          return processedChunk;
        } catch (error) {
          parser.abort();
          reject(error);
        }
      },
      complete: (results) => {
        resolve(results.data as ProcessedRow[]);
      },
      error: (error) => reject(error),
    });
  });
};

async function processChunk(
  data: OutscrapperRow[],
  totalRows: number,
  startTime: number,
  onProgress: (status: ProgressStatus) => void
): Promise<ProcessedRow[]> {
  onProgress({
    total: totalRows,
    current: data.length,
    stage: 'processing',
    estimatedTimeRemaining: calculateEstimatedTime(data.length, totalRows, startTime)
  });

  return processBatch(
    data,
    async (row) => {
      const processedRow: ProcessedRow = {
        email: row.email_1 || '',
        source_column: 'email_1',
        email_provider: ''
      };
      
      if (row.email_1) {
        processedRow.email_provider = await checkEmailProvider(row.email_1);
      }
      
      onProgress({
        total: totalRows,
        current: data.length,
        stage: 'mx-lookup',
        estimatedTimeRemaining: calculateEstimatedTime(data.length, totalRows, startTime)
      });
      
      return processedRow;
    },
    (processed) => {
      onProgress({
        total: totalRows,
        current: processed,
        stage: 'mx-lookup',
        estimatedTimeRemaining: calculateEstimatedTime(processed, totalRows, startTime)
      });
    }
  );
}