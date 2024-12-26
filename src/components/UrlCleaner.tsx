import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { UrlProcessingResult } from '../utils/url/types';
import { processUrlData } from '../utils/url/processor';
import { exportToCSV } from '../utils/url/export';
import FileUploadZone from './FileUploadZone';
import ProgressBar from './ProgressBar';
import { useProcessing } from '../hooks/useProcessing';
import ResultsPreview from './url/ResultsPreview';
import ErrorList from './url/ErrorList';

export default function UrlCleaner() {
  const {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    progress,
    setProgress,
    resetProcessing
  } = useProcessing();
  const [processedData, setProcessedData] = useState<UrlProcessingResult[]>([]);

  const handleFileUpload = async (file: File) => {
    resetProcessing();
    setIsProcessing(true);

    try {
      const processed = await processUrlData(file, setProgress);
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

  const handleExport = () => {
    exportToCSV(processedData, setProcessedData, resetProcessing);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">URL Cleaner</h2>
            <div className="text-gray-600 mb-4">
              <p className="mb-2">Upload a CSV file with URL columns to:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Extract and normalize domains</li>
                <li>Remove duplicates</li>
                <li>Validate URLs</li>
                <li>Clean formatting</li>
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
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Results
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
            <div className="space-y-6">
              <ResultsPreview results={processedData} />
              {processedData.some(result => result.errors.length > 0) && (
                <ErrorList results={processedData.filter(r => r.errors.length > 0)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}