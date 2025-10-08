/**
 * Vitest Setup File
 * 
 * Runs before all unit tests to configure the test environment.
 */

import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Global setup
beforeAll(() => {
  // NODE_ENV is set by vitest.config.ts or via environment
  // No need to manually set it here
  
  // Suppress console logs during tests (optional)
  // console.log = () => {};
});

// Global cleanup
afterAll(() => {
  // Any global cleanup needed
});
