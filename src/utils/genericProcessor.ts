import { GenericRow, ProgressStatus } from '../types';
import { parseCSV } from './csv/parser';

export const processGenericData = async (
  file: File,
  onProgress: (status: ProgressStatus) => void
): Promise<GenericRow[]> => {
  return parseCSV(file, onProgress);
};