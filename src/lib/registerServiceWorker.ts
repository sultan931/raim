export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    let isRefreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) return;
      isRefreshing = true;
      window.location.reload();
    });

    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      void registration.update();
    });
  });
}
