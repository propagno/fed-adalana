// Polyfill for global (required by sockjs-client)
// This file must be loaded before any modules that use global
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// Also define it on globalThis for better compatibility
if (typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}

