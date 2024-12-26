export const cleanupData = () => {
  // Clear any stored data from memory
  window.gc?.(); // Request garbage collection if available
};

export const cleanupAfterDownload = (
  setProcessedData: (data: any[]) => void,
  resetProcessing: () => void
) => {
  // Clear the processed data
  setProcessedData([]);
  
  // Reset processing state
  resetProcessing();
  
  // Request cleanup
  cleanupData();
};