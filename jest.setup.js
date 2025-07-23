// Global test setup
process.env.NODE_ENV = 'test';

// Mock console methods that we don't want in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test timeout
jest.setTimeout(10000);

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});