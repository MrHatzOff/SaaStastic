import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Reduce sampling rate in development to improve performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,

  // Disable debug logging in development to reduce console noise
  debug: false,

  // Reduce replay sampling to improve performance
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.01,

  // You can add data like request details, user information, etc.
  // to be sent along with the error report:
  beforeSend(event) {
    // Don't send events in development unless explicitly configured
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_ENABLED) {
      return null
    }
    return event
  },

  // Disable performance monitoring in development to improve speed
  enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_DEV_ENABLED === 'true',
})
