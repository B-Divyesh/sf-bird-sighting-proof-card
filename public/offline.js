const offlineTitle = document.querySelector('h1[tabindex="-1"]');
const offlineStatus = document.querySelector('[data-route-status]');
requestAnimationFrame(() => {
  offlineTitle?.focus({ preventScroll: true });
  if (offlineStatus) {
    offlineStatus.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
    offlineStatus.textContent = `${document.title}.`;
  }
});
