// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://57bcd1cdfebc95c1a8bca2ed542b5171@o4511695635546112.ingest.de.sentry.io/4511699434078288",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  integrations: [
    nodeProfilingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],

  profileSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  profileLifecycle: "trace",

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
