# Sentry Error Tracking

This project uses Sentry for error tracking and performance monitoring.

## Setup

1. Create a Sentry account at https://sentry.io
2. Create a new Next.js project in Sentry
3. Add the DSN to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

## Configuration

Sentry is configured in:
- `instrumentation.ts` - Client-side initialization
- `app/error.tsx` - Global error boundary

## Features

- **Error Tracking**: Automatic capture of unhandled errors
- **Performance Monitoring**: 10% sample rate for traces
- **Session Replay**: Records user sessions when errors occur
- **Source Maps**: Automatically uploaded in production builds

## Ignored Errors

The following errors are filtered out:
- Browser extension errors
- Network request failures (transient)
- ResizeObserver loop notifications (non-critical)
- Development environment errors

## Testing

To test error tracking:

```javascript
throw new Error("Test Sentry error");
```

## Production Considerations

- Adjust `tracesSampleRate` based on your traffic (currently 10%)
- Adjust `replaysSessionSampleRate` for session replay sampling
- Review and update `ignoreErrors` patterns as needed
- Set up release tracking for better error attribution
