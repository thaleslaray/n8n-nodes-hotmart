// Jest setup file
// Add any global test configuration here

// Increase timeout for integration tests
if (process.env.TEST_TYPE === 'integration') {
  jest.setTimeout(30000);
}

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep important methods
  error: console.error,
  warn: console.warn,
  // Mock less important methods
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};