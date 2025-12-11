import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    // Replay integration is available in @sentry/nextjs v8+
    // Temporarily commenting out until properly configured
    // Sentry.replayIntegration({
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],

  // Filter out common non-critical errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // Network errors
    "Network request failed",
    "NetworkError",
    "Failed to fetch",
    // ResizeObserver loop limit exceeded (non-critical)
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Add user context if available
    const error = hint.originalException;
    if (error instanceof Error) {
      console.error("Sentry captured error:", error);
    }

    return event;
  },
});
