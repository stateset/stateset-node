import { StatesetClient } from './client';
import { stateset as legacyStateset } from './stateset-client';
import OpenAIIntegration from './lib/integrations/OpenAIIntegration';
import {
  StatesetError,
  StatesetAPIError,
  StatesetAuthenticationError,
  StatesetConnectionError,
  StatesetInvalidRequestError,
  StatesetNotFoundError,
  StatesetRateLimitError,
  StatesetPermissionError
} from './StatesetError';

// Export new client as default
export default StatesetClient;

// Export legacy client for backward compatibility
export const Stateset = StatesetClient;
export const stateset = legacyStateset;

// Export other utilities
export {
  StatesetClient,
  OpenAIIntegration,
  StatesetError,
  StatesetAPIError,
  StatesetAuthenticationError,
  StatesetConnectionError,
  StatesetInvalidRequestError,
  StatesetNotFoundError,
  StatesetRateLimitError,
  StatesetPermissionError
};

// Export types
export * from './types';

// Export utilities
export { logger, LogLevel } from './utils/logger';
export { MemoryCache, globalCache, resourceCache } from './utils/cache';
export { performanceMonitor, PerformanceMonitor } from './utils/performance';
export { withRetry, CircuitBreaker, RetryError } from './utils/retry';
export { Validator, SchemaValidator, CommonSchemas } from './utils/validation';
export { BaseResource, BaseResourceInterface } from './lib/resources/BaseResource';
