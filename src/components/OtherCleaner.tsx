import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { processGenericData } from '../utils/genericProcessor';
import { GenericRow } from '../types';
import Papa from 'papaparse';
import FileUploadZone from './FileUploadZone';
import ProgressBar from './ProgressBar';
import { useProcessing } from '../hooks/useProcessing';
import { cleanupAfterDownload } from '../utils/cleanup';

export default function OtherCleaner() {
  const {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    progress,
    setProgress,
    resetProcessing
  } = useProcessing();
  const [processedData, setProcessedData] = useState<GenericRow[]>([]);

  const handleFileUpload = async (file: File) => {
    resetProcessing();
    setIsProcessing(true);

    try {
      const processed = await processGenericData(file, setProgress);
      setProcessedData(processed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error processing file';
      setError(errorMessage);
      console.error(err);
      setProcessedData([]);
    } finally {
      setIsProcessing(false);
      setProgress(prev => ({ ...prev, stage: 'complete' }));
    }
  };

  const downloadProcessedData = () => {
    if (processedData.length === 0) return;
    
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'processed_generic_data.csv';
    
    link.addEventListener('click', () => {
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        cleanupAfterDownload(setProcessedData, resetProcessing);
      }, 100);
    });
    
    link.click();
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Generic CSV Cleaner</h2>
            <div className="text-gray-600 mb-4">
              <p className="mb-2">Upload a CSV file with an email column to:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Validate email addresses</li>
                <li>Remove duplicates</li>
                <li>Detect email providers</li>
                <li>Generate DM names when possible</li>
              </ul>
            </div>
            
            <FileUploadZone 
              onFileSelect={handleFileUpload}
              disabled={isProcessing}
            />
            
            {isProcessing && (
              <div className="mt-4">
                <ProgressBar status={progress} />
              </div>
            )}
            
            {processedData.length > 0 && !isProcessing && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={downloadProcessedData}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Processed Data
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {processedData.length > 0 && !isProcessing && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(processedData[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.keys(processedData[0] || {}).map((header) => (
                          <td
                            key={`${index}-${header}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {row[header] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}