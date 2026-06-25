import path from 'node:path';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';

export interface NotFoundLogEntry {
  url: string;
  pathname: string;
  referer?: string;
  userAgent?: string;
  at: string;
}

export interface Monitor404Options {
  logFile?: string;
  maxEntries?: number;
}

const DEFAULT_LOG = '.seosuite/404-log.json';

async function readLog(filePath: string): Promise<NotFoundLogEntry[]> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as { entries?: NotFoundLogEntry[] };
    return parsed.entries ?? [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function log404Hit(
  entry: Omit<NotFoundLogEntry, 'at'> & { at?: string },
  options: Monitor404Options = {}
): Promise<void> {
  const logFile = options.logFile ?? DEFAULT_LOG;
  const absolute = path.isAbsolute(logFile) ? logFile : path.join(process.cwd(), logFile);
  await mkdir(path.dirname(absolute), { recursive: true });

  const entries = await readLog(absolute);
  const next: NotFoundLogEntry = {
    ...entry,
    at: entry.at ?? new Date().toISOString(),
  };
  const max = options.maxEntries ?? 500;
  const trimmed = [next, ...entries].slice(0, max);

  await writeFile(absolute, `${JSON.stringify({ entries: trimmed }, null, 2)}\n`, 'utf8');
}

export async function read404Log(options: Monitor404Options = {}): Promise<NotFoundLogEntry[]> {
  const logFile = options.logFile ?? DEFAULT_LOG;
  const absolute = path.isAbsolute(logFile) ? logFile : path.join(process.cwd(), logFile);
  return readLog(absolute);
}

export function create404MonitorMiddleware(options: Monitor404Options = {}) {
  return async function monitor404(req: Request): Promise<void> {
    const url = new URL(req.url);
    await log404Hit(
      {
        url: req.url,
        pathname: url.pathname,
        referer: req.headers.get('referer') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      },
      options
    );
  };
}

/** Append a line to a JSON-lines debug log (optional). */
export async function append404DebugLine(line: string, logFile = '.seosuite/404-debug.log'): Promise<void> {
  const absolute = path.isAbsolute(logFile) ? logFile : path.join(process.cwd(), logFile);
  await mkdir(path.dirname(absolute), { recursive: true });
  await appendFile(absolute, `${line}\n`, 'utf8');
}
