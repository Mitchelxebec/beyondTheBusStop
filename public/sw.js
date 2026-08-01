// 1. Install Event: Force immediate transition to activation
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");

  // Skip the waiting room; prepare to activate immediately
  self.skipWaiting();
});

// 2. Activate Event: Take immediate control of the application
self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");

  // Extend worker lifetime until the open browser tabs are successfully claimed
  event.waitUntil(self.clients.claim());
});
