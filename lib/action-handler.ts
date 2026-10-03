export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

type SafeResult<T> = { data: T; error: null } | { data: null; error: string };

export const safeAction =
  <TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>) =>
  async (...args: TArgs): Promise<SafeResult<TReturn>> => {
    try {
      return { data: await fn(...args), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "An unexpected error occurred" };
    }
  };
