import { UrlProcessingResult } from './types';
import { cleanupAfterDownload } from '../cleanup';
import Papa from 'papaparse';

export const exportToCSV = (
  results: UrlProcessingResult[],
  setProcessedData: (data: UrlProcessingResult[]) => void,
  resetProcessing: () => void
): void => {
  if (results.length === 0) return;
  
  const csvData = results.map(({ originalRow, cleanedDomains }) => ({
    ...originalRow,
    cleaned_domains: Array.from(cleanedDomains).join(', ')
  }));
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'cleaned_data.csv';
  
  // Add cleanup after download
  link.addEventListener('click', () => {
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      cleanupAfterDownload(setProcessedData, resetProcessing);
    }, 100);
  });
  
  link.click();
};