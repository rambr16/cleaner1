import { useState, useCallback } from 'react';
import { ProcessingManager } from '../utils/processing/ProcessingManager';
import { ProgressStatus } from '../types';

export function useFileProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressStatus>({
    total: 0,
    current: 0,
    stage: 'parsing',
    estimatedTimeRemaining: 0
  });
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (
    file: File,
    type: 'outscrapper' | 'other'
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const manager = ProcessingManager.getInstance();
      const jobId = await manager.startJob(file, type);

      // Poll for status updates
      const statusInterval = setInterval(() => {
        const status = manager.getJobStatus(jobId);
        if (!status) {
          clearInterval(statusInterval);
          setIsProcessing(false);
          return;
        }

        if (status.status === 'error') {
          clearInterval(statusInterval);
          setError('Processing failed');
          setIsProcessing(false);
          return;
        }

        setProgress(prev => ({
          ...prev,
          ...status.progress
        }));

        if (status.status === 'complete') {
          clearInterval(statusInterval);
          setIsProcessing(false);
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    progress,
    error,
    processFile
  };
}