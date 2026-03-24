export const logger = {
  info: (...args: unknown[]) => console.log(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
  exception: (code: string, err: unknown) => {
    const payload = err instanceof Error ? err.stack ?? err.message : err;
    console.error(`[${code}]`, payload);
  },
};
