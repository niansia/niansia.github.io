/* Exam gallery (/exams/): search, subject and AI chips, and newest/oldest order. Without this script the page still works:
   the subject chips are plain anchors and every exam is listed. Typed text is only compared, never written into the page. */
(() => {
  const box = document.querySelector('.exfilter');
  if (!box) return;
  const cards = [...document.querySelectorAll('.ex')], sections = [...document.querySelectorAll('.subject')];
  const input = box.querySelector('input[type=search]'), sort = box.querySelector('select'), status = box.querySelector('.exf-status');
  const empty = document.querySelector('.exf-empty'), subjects = [...box.querySelectorAll('[data-subj]')], ais = [...box.querySelectorAll('[data-ai]')];
  const state = {q: '', subj: '', ai: ''};
  const norm = s => (s || '').normalize('NFKC').toLowerCase().replace(/\s+/g, '');

  function apply() {
    const q = norm(state.q);
    let shown = 0;
    for (const c of cards) {
      const ok = (!state.subj || c.closest('.subject').dataset.subj === state.subj) && (!state.ai || c.dataset.ai === state.ai)
        && (!q || norm(c.dataset.q).includes(q));
      c.hidden = !ok;
      if (ok) shown++;
    }
    for (const s of sections) {
      const n = s.querySelectorAll('.ex:not([hidden])').length;
      s.hidden = !n;
      s.querySelector('.note').textContent = box.dataset.count.replace('{n}', n);
    }
    subjects.forEach(a => a.setAttribute('aria-pressed', String(a.dataset.subj === state.subj)));
    ais.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ai === state.ai)));
    status.textContent = box.dataset.shown.replace('{n}', shown).replace('{t}', cards.length);
    empty.hidden = shown > 0;
  }

  function order() {
    const dir = sort.value === 'old' ? 1 : -1;
    for (const s of sections) {
      const grid = s.querySelector('.exams');
      [...grid.children].sort((a, b) => dir * (Number(a.dataset.o) - Number(b.dataset.o))).forEach(c => grid.appendChild(c));
    }
  }

  box.querySelectorAll('[hidden]').forEach(el => { el.hidden = false; });
  subjects.forEach(a => {
    a.setAttribute('role', 'button');
    a.addEventListener('click', ev => {
      ev.preventDefault();
      state.subj = a.dataset.subj === state.subj ? '' : a.dataset.subj;
      apply();
    });
  });
  ais.forEach(b => b.addEventListener('click', () => { state.ai = b.dataset.ai === state.ai ? '' : b.dataset.ai; apply(); }));
  input.addEventListener('input', () => { state.q = input.value.slice(0, 40); apply(); });
  sort.addEventListener('change', order);
  empty.querySelector('button').addEventListener('click', () => {
    Object.assign(state, {q: '', subj: '', ai: ''});
    input.value = '';
    apply();
    input.focus();
  });

  // an old link to a subject (#math-a) opens with that subject selected; a link to one exam clears nothing and just scrolls
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && subjects.some(a => a.dataset.subj === hash)) state.subj = hash;
  apply();
})();
