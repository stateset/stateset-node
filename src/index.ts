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
