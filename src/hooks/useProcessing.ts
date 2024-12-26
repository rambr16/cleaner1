import { useState } from 'react';
import { ProgressStatus } from '../types';

export function useProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressStatus>({
    total: 0,
    current: 0,
    stage: 'parsing',
    estimatedTimeRemaining: 0
  });

  const resetProcessing = () => {
    setIsProcessing(false);
    setError(null);
    setProgress({
      total: 0,
      current: 0,
      stage: 'parsing',
      estimatedTimeRemaining: 0
    });
  };

  return {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    progress,
    setProgress,
    resetProcessing
  };
}