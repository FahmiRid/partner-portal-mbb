// mocks/browser.js
import { setupWorker } from 'msw';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// src/index.js (or your main entry file) - add this code
async function startMockServiceWorker() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser');
    worker.start({
      onUnhandledRequest: 'bypass', // Avoid console warnings for unhandled requests
    });
  }
}

// Call this before your app renders
startMockServiceWorker();