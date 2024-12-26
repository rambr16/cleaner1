const BATCH_SIZE = 100;
const MX_LOOKUP_DELAY = 50; // ms between MX lookups to avoid rate limits

export async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<T>,
  onProgress: (processed: number) => void
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (item, index) => {
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, MX_LOOKUP_DELAY));
        }
        return processor(item);
      })
    );
    results.push(...batchResults);
    onProgress(i + batch.length);
  }
  
  return results;
}

export function calculateEstimatedTime(
  processed: number,
  total: number,
  startTime: number
): number {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = processed / elapsed;
  return rate > 0 ? (total - processed) / rate : 0;
}