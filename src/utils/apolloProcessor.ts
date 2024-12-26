import Papa from 'papaparse';
import { ApolloRow, ProgressStatus } from '../types';
import { checkEmailProvider } from './emailUtils';
import { processBatch, calculateEstimatedTime } from './batchProcessor';

export const processApolloData = async (
  file: File,
  onProgress: (status: ProgressStatus) => void
): Promise<ApolloRow[]> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let totalRows = 0;
    
    Papa.parse(file, {
      header: true,
      chunk: async (results, parser) => {
        parser.pause();
        totalRows += results.data.length;
        
        try {
          const data = results.data as ApolloRow[];
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
        resolve(results.data as ApolloRow[]);
      },
      error: (error) => reject(error),
    });
  });
};

async function processChunk(
  data: ApolloRow[],
  totalRows: number,
  startTime: number,
  onProgress: (status: ProgressStatus) => void
): Promise<ApolloRow[]> {
  onProgress({
    total: totalRows,
    current: data.length,
    stage: 'processing',
    estimatedTimeRemaining: calculateEstimatedTime(data.length, totalRows, startTime)
  });

  return processBatch(
    data,
    async (row) => {
      const enrichedRow = {
        ...row,
        email_provider: await checkEmailProvider(row.email)
      };
      
      onProgress({
        total: totalRows,
        current: data.length,
        stage: 'mx-lookup',
        estimatedTimeRemaining: calculateEstimatedTime(data.length, totalRows, startTime)
      });
      
      return enrichedRow;
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