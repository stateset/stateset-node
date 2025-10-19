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
export declare class RetryError extends Error {
    readonly attempts: RetryAttempt[];
    readonly lastError: Error;
    constructor(message: string, attempts: RetryAttempt[], lastError: Error);
}
export declare function withRetry<T>(operation: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
export declare function retry(options?: Partial<RetryOptions>): <T extends (...args: any[]) => Promise<any>>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
export declare class CircuitBreaker {
    private failureThreshold;
    private timeout;
    private monitoringPeriod;
    private failures;
    private lastFailureTime;
    private state;
    constructor(failureThreshold?: number, timeout?: number, monitoringPeriod?: number);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): string;
    reset(): void;
}
//# sourceMappingURL=retry.d.ts.map