/* Click-to-enlarge for figures in notes and the research log. External file so pages can keep a strict CSP. */
(() => {
  const links = () => [...document.querySelectorAll('a[data-lightbox]')];
  let box, img, cap, i = -1;
  function open(k) {
    const list = links(); if (!list[k]) return; i = k;
    if (!box) {
      box = document.createElement('div'); box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<button class="lb-x" type="button" aria-label="Close">×</button><img alt=""><p></p>';
      document.body.append(box); img = box.querySelector('img'); cap = box.querySelector('p');
      box.addEventListener('click', e => { if (e.target !== img) close(); });
    }
    const a = list[k], alt = a.querySelector('img')?.alt || '';
    img.src = a.getAttribute('href'); img.alt = alt; cap.textContent = alt;
    box.classList.add('on'); document.documentElement.style.overflow = 'hidden'; box.querySelector('.lb-x').focus();
  }
  function close() { if (!box) return; box.classList.remove('on'); document.documentElement.style.overflow = ''; links()[i]?.focus(); i = -1; }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-lightbox]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); open(links().indexOf(a));
  });
  document.addEventListener('keydown', e => {
    if (i < 0) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') open(Math.min(links().length - 1, i + 1));
    else if (e.key === 'ArrowLeft') open(Math.max(0, i - 1));
  });
})();
