"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.RetryError = void 0;
exports.withRetry = withRetry;
exports.retry = retry;
const logger_1 = require("./logger");
class RetryError extends Error {
    attempts;
    lastError;
    constructor(message, attempts, lastError) {
        super(message);
        this.attempts = attempts;
        this.lastError = lastError;
        this.name = 'RetryError';
    }
}
exports.RetryError = RetryError;
const DEFAULT_RETRY_OPTIONS = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: () => true, // Default: retry all errors
    onRetryAttempt: undefined,
};
async function withRetry(operation, options = {}) {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
    const attempts = [];
    let lastError;
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            const result = await operation();
            if (attempts.length > 0) {
                logger_1.logger.info('Operation succeeded after retry', {
                    operation: 'retry',
                    metadata: { attempt, totalAttempts: attempts.length + 1 },
                });
            }
            return result;
        }
        catch (error) {
            lastError = error;
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
            const attemptInfo = { attempt, delay, error: lastError };
            attempts.push(attemptInfo);
            logger_1.logger.warn('Operation failed, retrying', {
                operation: 'retry',
                metadata: {
                    attempt,
                    maxAttempts: config.maxAttempts,
                    delay,
                    error: lastError.message
                },
            });
            config.onRetryAttempt?.(attemptInfo);
            await sleep(delay);
        }
    }
    throw new RetryError(`Operation failed after ${config.maxAttempts} attempts`, attempts, lastError);
}
function calculateDelay(attempt, options) {
    let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, options.maxDelay);
    if (options.jitter) {
        // Add random jitter to prevent thundering herd
        delay = delay * (0.5 + Math.random() * 0.5);
    }
    return Math.floor(delay);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Decorator for automatic retry
function retry(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            return withRetry(() => originalMethod.apply(this, args), options);
        };
        return descriptor;
    };
}
// Circuit breaker pattern
class CircuitBreaker {
    failureThreshold;
    timeout;
    monitoringPeriod;
    failures = 0;
    lastFailureTime = 0;
    state = 'CLOSED';
    constructor(failureThreshold = 5, timeout = 60000, monitoringPeriod = 10000) {
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
        this.monitoringPeriod = monitoringPeriod;
    }
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
                logger_1.logger.info('Circuit breaker transitioning to HALF_OPEN');
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failures = 0;
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            logger_1.logger.info('Circuit breaker closed after successful operation');
        }
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            logger_1.logger.warn('Circuit breaker opened due to repeated failures', {
                operation: 'circuit_breaker',
                metadata: { failures: this.failures, threshold: this.failureThreshold },
            });
        }
    }
    getState() {
        return this.state;
    }
    reset() {
        this.failures = 0;
        this.state = 'CLOSED';
        this.lastFailureTime = 0;
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=retry.js.map