import { nanoid } from 'nanoid';

interface ProcessingJob {
  id: string;
  worker: Worker;
  file: File;
  type: 'outscrapper' | 'other';
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: {
    current: number;
    total: number;
    stage: string;
  };
}

export class ProcessingManager {
  private static instance: ProcessingManager;
  private jobs: Map<string, ProcessingJob> = new Map();
  private maxConcurrentJobs: number;

  private constructor() {
    // Calculate based on available CPU cores
    this.maxConcurrentJobs = navigator.hardwareConcurrency || 4;
  }

  static getInstance(): ProcessingManager {
    if (!ProcessingManager.instance) {
      ProcessingManager.instance = new ProcessingManager();
    }
    return ProcessingManager.instance;
  }

  async startJob(file: File, type: 'outscrapper' | 'other'): Promise<string> {
    const jobId = nanoid();
    const worker = new Worker(
      new URL('../workers/csvWorker.ts', import.meta.url),
      { type: 'module' }
    );

    const job: ProcessingJob = {
      id: jobId,
      worker,
      file,
      type,
      status: 'pending',
      progress: {
        current: 0,
        total: 0,
        stage: 'pending'
      }
    };

    this.jobs.set(jobId, job);
    
    // Manage concurrent jobs
    await this.scheduleJob(job);
    
    return jobId;
  }

  private async scheduleJob(job: ProcessingJob): Promise<void> {
    const activeJobs = Array.from(this.jobs.values())
      .filter(j => j.status === 'processing');

    if (activeJobs.length >= this.maxConcurrentJobs) {
      await new Promise<void>(resolve => {
        const checkInterval = setInterval(() => {
          const currentActive = Array.from(this.jobs.values())
            .filter(j => j.status === 'processing');
          
          if (currentActive.length < this.maxConcurrentJobs) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    this.startProcessing(job);
  }

  private startProcessing(job: ProcessingJob): void {
    job.status = 'processing';
    
    job.worker.postMessage({
      file: job.file,
      type: job.type,
      batchSize: this.calculateOptimalBatchSize(job.file.size)
    });

    job.worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        job.progress = e.data.progress;
      } else if (e.data.type === 'complete') {
        this.completeJob(job.id);
      } else if (e.data.type === 'error') {
        this.failJob(job.id, e.data.error);
      }
    };
  }

  private calculateOptimalBatchSize(fileSize: number): number {
    // Adjust batch size based on file size and available memory
    const baseSize = 1000;
    const memoryLimit = 1024 * 1024 * 50; // 50MB
    return Math.min(baseSize, Math.floor(memoryLimit / fileSize * baseSize));
  }

  private completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'complete';
      job.worker.terminate();
      this.jobs.delete(jobId);
    }
  }

  private failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'error';
      job.worker.terminate();
      this.jobs.delete(jobId);
    }
  }

  getJobStatus(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }
}