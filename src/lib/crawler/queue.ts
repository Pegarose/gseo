import { Queue, Job } from 'bullmq';

export interface SiteCrawlJobData {
  tenantId: string;
  siteId: string;
  startUrl: string;
  maxPages?: number;
  options?: {
    renderJavascript?: boolean;
    includeAiVisibility?: boolean;
  };
}

let siteCrawlQueue: Queue<SiteCrawlJobData, any, string> | null = null;

export function getSiteCrawlQueue(): Queue<SiteCrawlJobData, any, string> {
  if (siteCrawlQueue) return siteCrawlQueue;

  const connection = getRedisConnection();
  siteCrawlQueue = new Queue<SiteCrawlJobData>('site-crawl', { connection });
  return siteCrawlQueue;
}

export async function enqueueSiteCrawl(data: SiteCrawlJobData): Promise<Job<SiteCrawlJobData>> {
  const queue = getSiteCrawlQueue();
  return queue.add('crawl', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 24 * 3600, count: 100 },
    removeOnFail: { age: 24 * 3600, count: 100 },
  });
}

function getRedisConnection() {
  const url = process.env.REDIS_URL;
  if (!url) {
    // BullMQ does not work without Redis; fail fast.
    throw new Error('REDIS_URL is required for the site-wide crawler queue.');
  }

  // BullMQ v5+ expects an object with url (or host/port)
  return { url };
}
