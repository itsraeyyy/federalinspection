// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://57bcd1cdfebc95c1a8bca2ed542b5171@o4511695635546112.ingest.de.sentry.io/4511699434078288",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  profileSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  profileLifecycle: "trace",

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
