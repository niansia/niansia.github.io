/* Small behaviours for the static brief and paper pages (loaded as a file: the pages' CSP has no inline scripts). */
(() => {
  'use strict';
  document.addEventListener('click', async event => {
    if (event.target.closest('[data-print]')) { window.print(); return; }
    const copy = event.target.closest('[data-copy-pre]');
    if (copy) {
      const text = copy.parentElement.querySelector('pre')?.textContent || '';
      const label = copy.lastChild, before = label.textContent;
      try { await navigator.clipboard.writeText(text); label.textContent = copy.dataset.done || 'Copied'; }
      catch { const range = document.createRange(); range.selectNodeContents(copy.parentElement.querySelector('pre')); getSelection().removeAllRanges(); getSelection().addRange(range); }
      setTimeout(() => { label.textContent = before; }, 1800);
    }
  });
  document.addEventListener('input', event => {
    const box = event.target.closest('[data-compare]');
    if (box) box.style.setProperty('--x', `${event.target.value}%`);
  });
})();
