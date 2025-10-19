import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
  onRetryAttempt?: (attempt: RetryAttempt) => void;
}

export interface RetryAttempt {
  attempt: number;
  delay: number;
  error?: Error;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: RetryAttempt[],
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

type InternalRetryOptions = Required<Omit<RetryOptions, 'onRetryAttempt'>> &
  Pick<RetryOptions, 'onRetryAttempt'>;

const TRANSIENT_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ECONNREFUSED',
  'EPIPE',
  'EAI_AGAIN',
  'ECONNABORTED',
  'EHOSTDOWN',
]);

const TRANSIENT_STATUS_CODES = new Set([408, 425, 429, 499]);

function extractStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;

  const err = error as Record<string, unknown>;
  if (typeof err.statusCode === 'number') {
    return err.statusCode;
  }

  if (typeof err.status === 'number') {
    return err.status;
  }

  const response = err.response as { status?: number } | undefined;
  if (response && typeof response.status === 'number') {
    return response.status;
  }

  if (err.cause) {
    return extractStatusCode(err.cause);
  }

  return undefined;
}

function isRetriableStatus(status: number): boolean {
  if (status >= 500) {
    return true;
  }

  return TRANSIENT_STATUS_CODES.has(status);
}

function defaultRetryCondition(error: Error): boolean {
  const status = extractStatusCode(error);
  if (status !== undefined) {
    return isRetriableStatus(status);
  }

  const code = (error as any)?.code;
  if (typeof code === 'string') {
    return TRANSIENT_ERROR_CODES.has(code);
  }

  return true;
}

const DEFAULT_RETRY_OPTIONS: InternalRetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: defaultRetryCondition,
  onRetryAttempt: undefined,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config: InternalRetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const attempts: RetryAttempt[] = [];
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();

      if (attempts.length > 0) {
        logger.info('Operation succeeded after retry', {
          operation: 'retry',
          metadata: { attempt, totalAttempts: attempts.length + 1 },
        });
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // For the last attempt, don't check retry condition and don't delay
      if (attempt === config.maxAttempts) {
        attempts.push({ attempt, delay: 0, error: lastError });
        break;
      }

      // Check retry condition for non-final attempts
      const shouldRetry = config.retryCondition(lastError);

      if (!shouldRetry) {
        // If retry condition fails, throw the original error immediately
        throw lastError;
      }

      const delay = calculateDelay(attempt, config);
      const attemptInfo: RetryAttempt = { attempt, delay, error: lastError };
      attempts.push(attemptInfo);

      logger.warn('Operation failed, retrying', {
        operation: 'retry',
        metadata: {
          attempt,
          maxAttempts: config.maxAttempts,
          delay,
          error: lastError.message,
        },
      });

      config.onRetryAttempt?.(attemptInfo);
      await sleep(delay);
    }
  }

  throw new RetryError(
    `Operation failed after ${config.maxAttempts} attempts`,
    attempts,
    lastError!
  );
}

function calculateDelay(attempt: number, options: InternalRetryOptions): number {
  let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  delay = Math.min(delay, options.maxDelay);

  if (options.jitter) {
    // Add random jitter to prevent thundering herd
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Decorator for automatic retry
export function retry(options: Partial<RetryOptions> = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (this: any, ...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), options);
    } as T;

    return descriptor;
  };
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000,
    private monitoringPeriod: number = 10000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker transitioning to HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info('Circuit breaker closed after successful operation');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.warn('Circuit breaker opened due to repeated failures', {
        operation: 'circuit_breaker',
        metadata: { failures: this.failures, threshold: this.failureThreshold },
      });
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }
}
