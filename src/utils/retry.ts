import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
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

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: (error: Error) => {
    // Retry on network errors and 5xx status codes
    if (error.message.includes('ECONNRESET') || 
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ETIMEDOUT')) {
      return true;
    }
    
    // Check for HTTP status codes that should be retried
    const statusMatch = error.message.match(/status code (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return status >= 500 || status === 429; // 5xx errors or rate limit
    }
    
    return false;
  },
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
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
      
      // Check retry condition first
      const retryConditionMet = config.retryCondition?.(lastError) ?? true;
      const shouldRetry = attempt < config.maxAttempts && retryConditionMet;
      
      if (!shouldRetry) {
        attempts.push({ attempt, delay: 0, error: lastError });
        break;
      }
      
      const delay = calculateDelay(attempt, config);
      attempts.push({ attempt, delay, error: lastError });
      
      logger.warn('Operation failed, retrying', {
        operation: 'retry',
        metadata: { 
          attempt, 
          maxAttempts: config.maxAttempts,
          delay,
          error: lastError.message 
        },
      });
      
      await sleep(delay);
    }
  }
  
  // If we didn't retry due to retry condition, throw the original error
  if (attempts.length === 1 && config.retryCondition && !config.retryCondition(lastError!)) {
    throw lastError!;
  }
  
  throw new RetryError(
    `Operation failed after ${config.maxAttempts} attempts`,
    attempts,
    lastError!
  );
}

function calculateDelay(attempt: number, options: RetryOptions): number {
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