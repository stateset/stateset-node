import { withRetry, RetryError, CircuitBreaker } from '../src/utils/retry';

describe('Retry Utility', () => {
  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await withRetry(mockOperation, { maxAttempts: 3 });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Another failure'))
        .mockResolvedValue('success');

      const result = await withRetry(mockOperation, {
        maxAttempts: 3,
        baseDelay: 10, // Short delay for tests
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(
        withRetry(mockOperation, {
          maxAttempts: 2,
          baseDelay: 10,
        })
      ).rejects.toThrow(RetryError);

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should respect retry condition', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Auth error'));

      const retryCondition = (error: Error) => !error.message.includes('Auth');

      await expect(
        withRetry(mockOperation, {
          maxAttempts: 3,
          retryCondition,
          baseDelay: 10,
        })
      ).rejects.toThrow('Auth error');

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('does not retry on non-retriable client errors by default', async () => {
      const clientError = new Error('Bad Request') as Error & { statusCode?: number };
      clientError.statusCode = 400;

      const mockOperation = jest.fn().mockRejectedValue(clientError);

      await expect(
        withRetry(mockOperation, {
          maxAttempts: 3,
          baseDelay: 10,
        })
      ).rejects.toThrow('Bad Request');

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('retries on rate limit errors by default', async () => {
      const rateLimitError = new Error('Too Many Requests') as Error & { statusCode?: number };
      rateLimitError.statusCode = 429;

      const mockOperation = jest.fn().mockRejectedValue(rateLimitError);

      await expect(
        withRetry(mockOperation, {
          maxAttempts: 3,
          baseDelay: 10,
          jitter: false,
        })
      ).rejects.toThrow(RetryError);

      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should apply exponential backoff', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failure'));
      const delays: number[] = [];

      const originalSetTimeout = global.setTimeout;
      const mockSetTimeout = jest.fn().mockImplementation((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      }) as any;
      mockSetTimeout.__promisify__ = undefined;
      global.setTimeout = mockSetTimeout;

      try {
        await withRetry(mockOperation, {
          maxAttempts: 3,
          baseDelay: 100,
          backoffMultiplier: 2,
          jitter: false,
        });
      } catch {
        // Expected to fail
      }

      expect(delays).toHaveLength(2); // Two retries
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);

      global.setTimeout = originalSetTimeout;
    });

    it('should invoke retry callback on each attempt', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary'))
        .mockRejectedValueOnce(new Error('Temporary'))
        .mockResolvedValue('ok');

      const onRetryAttempt = jest.fn();

      const result = await withRetry(mockOperation, {
        maxAttempts: 3,
        baseDelay: 10,
        onRetryAttempt,
      });

      expect(result).toBe('ok');
      expect(onRetryAttempt).toHaveBeenCalledTimes(2);
      expect(onRetryAttempt).toHaveBeenNthCalledWith(1, expect.objectContaining({ attempt: 1 }));
      expect(onRetryAttempt).toHaveBeenNthCalledWith(2, expect.objectContaining({ attempt: 2 }));
    });
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker(2, 1000, 100); // 2 failures, 1s timeout
    });

    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should remain CLOSED on successful operations', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      await circuitBreaker.execute(mockOperation);

      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should open after failure threshold', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failure'));

      // First failure
      try {
        await circuitBreaker.execute(mockOperation);
      } catch {
        // Expected
      }
      expect(circuitBreaker.getState()).toBe('CLOSED');

      // Second failure - should open
      try {
        await circuitBreaker.execute(mockOperation);
      } catch {
        // Expected
      }
      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should reject immediately when OPEN', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failure'));

      // Cause failures to open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(mockOperation);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      // Next call should fail immediately
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      expect(mockOperation).toHaveBeenCalledTimes(2); // Not called for the immediate rejection
    });

    it('should reset to CLOSED state', () => {
      // Force to OPEN state
      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('RetryError', () => {
    it('should contain attempt history', () => {
      const attempts = [
        { attempt: 1, delay: 100, error: new Error('First') },
        { attempt: 2, delay: 200, error: new Error('Second') },
      ];
      const lastError = new Error('Final');

      const retryError = new RetryError('Operation failed', attempts, lastError);

      expect(retryError.message).toBe('Operation failed');
      expect(retryError.attempts).toBe(attempts);
      expect(retryError.lastError).toBe(lastError);
      expect(retryError.name).toBe('RetryError');
    });
  });
});
