const title = document.querySelector<HTMLElement>('h1[tabindex="-1"]');
const status = document.querySelector<HTMLElement>('[data-route-status]');

requestAnimationFrame(() => {
  title?.focus({ preventScroll: true });
  if (title) {
    title.style.outline = '3px solid var(--amber)';
    title.style.outlineOffset = '4px';
  }
  if (status) {
    status.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
    status.textContent = `${document.title}.`;
  }
});
