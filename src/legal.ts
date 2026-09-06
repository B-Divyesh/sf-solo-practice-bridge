import './style.css';

if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js');

document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector<HTMLElement>('#main')?.focus();
});
