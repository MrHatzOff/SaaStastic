import { clerkSetup } from '@clerk/testing/playwright'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

/**
 * Global setup for Clerk authentication in Playwright tests
 * This runs once before all tests to obtain a testing token
 */
export default async function globalSetup() {
  await clerkSetup()
}
