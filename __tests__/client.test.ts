import { StatesetClient, StatesetClientConfig } from '../src/client';

describe('StatesetClient', () => {
  const testConfig: StatesetClientConfig = {
    apiKey: 'test-key',
    baseUrl: 'https://api.test.com',
    timeout: 30000,
    retry: 2,
    retryDelayMs: 500
  };

  afterEach(() => {
    // Clean up environment variables
    delete process.env.STATESET_API_KEY;
    delete process.env.STATESET_BASE_URL;
    delete process.env.STATESET_RETRY;
    delete process.env.STATESET_RETRY_DELAY_MS;
  });

  describe('Initialization', () => {
    it('should initialize with provided config', () => {
      const client = new StatesetClient(testConfig);
      
      expect(client).toBeInstanceOf(StatesetClient);
      expect(client.returns).toBeDefined();
      expect(client.orders).toBeDefined();
      expect(client.products).toBeDefined();
      expect(client.customers).toBeDefined();
      expect(client.shipments).toBeDefined();
      expect(client.workorders).toBeDefined();
      expect(client.agents).toBeDefined();
      expect(client.inventory).toBeDefined();
    });

    it('should throw error when API key is missing', () => {
      expect(() => new StatesetClient({})).toThrow(
        'Stateset API key is required'
      );
    });

    it('should use environment variables when config is not provided', () => {
      process.env.STATESET_API_KEY = 'env-key';
      process.env.STATESET_BASE_URL = 'https://env.api.com';
      process.env.STATESET_RETRY = '3';
      process.env.STATESET_RETRY_DELAY_MS = '2000';

      const client = new StatesetClient();
      const config = client.getConfig();

      expect(config.baseUrl).toBe('https://env.api.com');
      expect(config.retry).toBe(3);
      expect(config.retryDelayMs).toBe(2000);
    });

    it('should validate base URL format', () => {
      expect(() => new StatesetClient({
        apiKey: 'test-key',
        baseUrl: 'invalid-url'
      })).toThrow('Invalid base URL');
    });

    it('should validate timeout range', () => {
      expect(() => new StatesetClient({
        apiKey: 'test-key',
        timeout: 500
      })).toThrow('Timeout must be between 1000ms and 600000ms (10 minutes)');
    });

    it('should validate retry count range', () => {
      expect(() => new StatesetClient({
        apiKey: 'test-key',
        retry: 15
      })).toThrow('Retry count must be between 0 and 10');
    });
  });

  describe('Configuration Updates', () => {
    let client: StatesetClient;

    beforeEach(() => {
      client = new StatesetClient(testConfig);
    });

    it('should update API key', () => {
      client.setApiKey('new-key');
      // Verify the key was updated (indirectly through no error)
      expect(() => client.setApiKey('new-key')).not.toThrow();
    });

    it('should update base URL', () => {
      client.setBaseUrl('https://new.api.com');
      const config = client.getConfig();
      expect(config.baseUrl).toBe('https://new.api.com');
    });

    it('should throw error for invalid base URL', () => {
      expect(() => client.setBaseUrl('invalid')).toThrow('Invalid base URL');
    });

    it('should update timeout', () => {
      client.setTimeout(45000);
      const config = client.getConfig();
      expect(config.timeout).toBe(45000);
    });

    it('should validate timeout when updating', () => {
      expect(() => client.setTimeout(500)).toThrow(
        'Timeout must be between 1000ms and 600000ms (10 minutes)'
      );
    });

    it('should update retry options', () => {
      client.setRetryOptions(5, 2000);
      const config = client.getConfig();
      expect(config.retry).toBe(5);
      expect(config.retryDelayMs).toBe(2000);
    });

    it('should validate retry options when updating', () => {
      expect(() => client.setRetryOptions(15, 1000)).toThrow(
        'Retry count must be between 0 and 10'
      );
      expect(() => client.setRetryOptions(3, 50)).toThrow(
        'Retry delay must be between 100ms and 30000ms'
      );
    });

    it('should update headers', () => {
      client.setHeaders({ 'X-Custom': 'value' });
      const config = client.getConfig();
      expect(config.additionalHeaders).toEqual(
        expect.objectContaining({ 'X-Custom': 'value' })
      );
    });

    it('should update app info', () => {
      const appInfo = { name: 'MyApp', version: '1.0.0', url: 'https://myapp.com' };
      client.setAppInfo(appInfo);
      const config = client.getConfig();
      expect(config.appInfo).toEqual(appInfo);
    });
  });

  describe('Health Check', () => {
    let client: StatesetClient;

    beforeEach(() => {
      client = new StatesetClient(testConfig);
    });

    it('should return health status', async () => {
      // Mock the HTTP client healthCheck method
      const mockHealthCheck = jest.fn().mockResolvedValue({
        status: 'ok',
        timestamp: '2023-01-01T00:00:00Z',
        details: { test: 'data' }
      });
      
      // Access the private httpClient through any
      (client as any).httpClient.healthCheck = mockHealthCheck;

      const result = await client.healthCheck();
      
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.details).toBeDefined();
      expect(mockHealthCheck).toHaveBeenCalled();
    });

    it('should handle health check failure', async () => {
      const mockHealthCheck = jest.fn().mockRejectedValue(new Error('Connection failed'));
      (client as any).httpClient.healthCheck = mockHealthCheck;

      await expect(client.healthCheck()).rejects.toThrow('Connection failed');
    });
  });

  describe('Circuit Breaker', () => {
    let client: StatesetClient;

    beforeEach(() => {
      client = new StatesetClient(testConfig);
    });

    it('should get circuit breaker state', () => {
      const mockGetState = jest.fn().mockReturnValue('CLOSED');
      (client as any).httpClient.getCircuitBreakerState = mockGetState;

      const state = client.getCircuitBreakerState();
      
      expect(state).toBe('CLOSED');
      expect(mockGetState).toHaveBeenCalled();
    });

    it('should reset circuit breaker', () => {
      const mockReset = jest.fn();
      (client as any).httpClient.resetCircuitBreaker = mockReset;

      client.resetCircuitBreaker();
      
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Resource Operations', () => {
    let client: StatesetClient;

    beforeEach(() => {
      client = new StatesetClient(testConfig);
    });

    it('should have all resource instances', () => {
      expect(client.returns).toBeDefined();
      expect(client.orders).toBeDefined();
      expect(client.products).toBeDefined();
      expect(client.customers).toBeDefined();
      expect(client.shipments).toBeDefined();
      expect(client.workorders).toBeDefined();
      expect(client.agents).toBeDefined();
      expect(client.inventory).toBeDefined();
    });

    it('should provide basic operations on resources', () => {
      const resources = [
        client.returns,
        client.orders,
        client.products,
        client.customers,
        client.shipments,
        client.workorders,
        client.agents,
        client.inventory
      ];

      resources.forEach(resource => {
        expect(resource).toBeDefined();
        expect(typeof resource).toBe('object');
        // Basic resource structure test - resources should have at least these properties
        expect(resource).toHaveProperty('constructor');
      });
    });
  });

  describe('Legacy Support', () => {
    let client: StatesetClient;

    beforeEach(() => {
      client = new StatesetClient(testConfig);
    });

    it('should support legacy request method', async () => {
      const mockRequest = jest.fn().mockResolvedValue({ data: 'test' });
      (client as any).httpClient.request = mockRequest;

      const result = await client.request('GET', '/test', null, {});
      
      expect(result).toEqual('test');
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'get',
        url: '/test',
        data: null
      });
    });
  });

  describe('Configuration Safety', () => {
    let client: StatesetClient;

    beforeEach(() => {
      client = new StatesetClient(testConfig);
    });

    it('should not expose API key in getConfig', () => {
      const config = client.getConfig();
      expect(config).not.toHaveProperty('apiKey');
      expect(config.baseUrl).toBe(testConfig.baseUrl);
      expect(config.timeout).toBe(testConfig.timeout);
    });
  });

  describe('Cleanup', () => {
    it('should destroy client cleanly', () => {
      const client = new StatesetClient(testConfig);
      expect(() => client.destroy()).not.toThrow();
    });
  });
});