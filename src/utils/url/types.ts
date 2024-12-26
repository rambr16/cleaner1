export interface UrlProcessingResult {
  originalRow: Record<string, string>;
  cleanedDomains: Set<string>;
  errors: string[];
}

export interface UrlProcessingStats {
  totalProcessed: number;
  validCount: number;
  errorCount: number;
}

export type ProcessingStage = 'parsing' | 'processing' | 'complete';