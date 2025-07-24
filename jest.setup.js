// Global test setup

// Increase timeout for integration tests
jest.setTimeout(30000);

// Cleanup function to be called after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
  
  // Reset all mocks
  jest.clearAllMocks();
});

// Global teardown to handle any remaining resources
afterAll(() => {
  // Close any open handles
  jest.clearAllTimers();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Mock console methods in test environment to reduce noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Only suppress console in test environment
  if (process.env.NODE_ENV === 'test') {
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});