import React from 'react';
import { Clock } from 'lucide-react';
import { ProgressStatus } from '../types';
import { STAGE_WEIGHTS, STAGE_LABELS } from '../constants/progressStages';
import { formatTime } from '../utils/timeFormatter';

interface ProgressBarProps {
  status: ProgressStatus;
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const getProgressPercentage = () => {
    const baseProgress = (status.current / status.total) * 100;
    const stageProgress = STAGE_WEIGHTS[status.stage] * baseProgress;
    return Math.min(Math.round(stageProgress), 100);
  };

  const progress = getProgressPercentage();

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{STAGE_LABELS[status.stage]}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {status.estimatedTimeRemaining > 0 && (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Estimated time remaining: {formatTime(status.estimatedTimeRemaining)}</span>
        </div>
      )}
    </div>
  );
}