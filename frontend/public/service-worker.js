importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded');

  // Check if manifest exists
  if (self.__WB_MANIFEST) {
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
  } else {
    console.warn('No precache manifest found. Are you in development mode?');
  }

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate()
  );
} else {
  console.log('Workbox could not be loaded.');
}
