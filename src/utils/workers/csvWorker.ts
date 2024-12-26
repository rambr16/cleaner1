// Web Worker for CSV processing
self.onmessage = async (e) => {
  const { file, type, batchSize = 1000 } = e.data;
  let processedRows = 0;
  
  try {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;
      
      // Process in chunks to avoid blocking
      const lines = text.split('\n');
      const totalRows = lines.length - 1; // Exclude header
      
      for (let i = 1; i < lines.length; i += batchSize) {
        const chunk = lines.slice(i, i + batchSize);
        processedRows += chunk.length;
        
        self.postMessage({
          type: 'progress',
          progress: {
            current: processedRows,
            total: totalRows,
            stage: 'processing'
          }
        });
        
        // Allow other tasks to run
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      self.postMessage({ type: 'complete' });
    };
    
    reader.readAsText(file);
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};