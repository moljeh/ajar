/* EduPlan AI — Tambahan PWA. Tidak mengubah app.js atau autentikasi. */
'use strict';

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', async () => {
    try {
      const worker = new URL('./sw.js', document.baseURI);
      await navigator.serviceWorker.register(worker.href, {
        scope: new URL('./', worker).href,
        updateViaCache: 'none'
      });
    } catch (error) {
      console.warn('PWA EduPlan AI belum terdaftar:', error);
    }
  });
}
