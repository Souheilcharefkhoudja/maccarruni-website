(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Language ---------- */
  let lang = 'it';
  try { lang = localStorage.getItem('lang') || lang; } catch {}
  const t = (o) => (o && (o[lang] ?? o.it)) || '';

  function setLang(next) {
    lang = next;
    try { localStorage.setItem('lang', lang); } catch {}
    document.documentElement.lang = lang;
    for (const el of $$('[data-it]')) el.innerHTML = el.dataset[lang] ?? el.dataset.it;
    for (const b of $$('.lang button')) b.classList.toggle('is-on', b.dataset.lang === lang);
    renderTabs(); renderMenu(); renderFixed(); renderOpen();
  }
  for (const b of $$('.lang button')) b.addEventListener('click', () => setLang(b.dataset.lang));

  /* ---------- Menu ---------- */
  let active = window.MENU[0].id;
  const price = (p) => {
    if (p == null) return '—';
    if (typeof p === 'string') return p;
    return '€ ' + (Number.isInteger(p) ? p : p.toFixed(2).replace('.', lang === 'it' ? ',' : '.'));
  };

  function renderTabs() {
    $('#tabs').innerHTML = window.MENU.map((c) =>
      `<button class="tab${c.id === active ? ' is-on' : ''}" role="tab" aria-selected="${c.id === active}" data-id="${c.id}">${t(c)}</button>`).join('');
  }
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b || b.dataset.id === active) return;
    active = b.dataset.id;
    renderTabs(); renderMenu();
  });

  function renderMenu() {
    const cat = window.MENU.find((c) => c.id === active);
    const note = cat.note ? `<p class="menu__note">${t(cat.note)}</p>` : '';
    $('#menuList').innerHTML = note + cat.items.map((d, i) => {
      const name = lang === 'en' && d.en ? d.en : d.it;
      const desc = lang === 'en' ? (d.dEn || '') : (d.dIt || '');
      return `<article class="dish" style="--i:${i}">
        ${d.tag ? `<span class="dish__tag">${t(d.tag)}</span>` : ''}
        <div class="dish__row"><span class="dish__name">${name}</span><span class="dish__dots"></span><span class="dish__price">${price(d.price)}</span></div>
        ${desc ? `<p class="dish__desc">${desc}</p>` : ''}
      </article>`;
    }).join('');
  }

  function renderFixed() {
    const f = window.FIXED_MENU;
    $('#fixedMenu').innerHTML = `
      <div class="fixed__kicker">${t(f.sub)}</div>
      <h3 class="fixed__title">${t(f.title)}</h3>
      <div class="fixed__price"><small>€</small>${f.price}</div>
      <dl>${f.courses.map((c) => `<dt>${t(c.k)}</dt><dd>${t(c.v)}</dd>`).join('')}</dl>
      <p class="fixed__foot">${t(f.foot)}</p>`;
  }

  /* ---------- Open now (Catania time, 11:30 – 02:00 every day) ---------- */
  function renderOpen() {
    const el = $('#openNow');
    try {
      const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false })
        .format(new Date()).split(':').map(Number);
      const mins = h * 60 + m;
      const open = mins >= 11 * 60 + 30 || mins < 2 * 60;
      el.textContent = open ? (lang === 'it' ? 'Aperto ora' : 'Open now') : (lang === 'it' ? 'Chiuso ora' : 'Closed now');
      el.classList.toggle('is-closed', !open);
    } catch { el.textContent = ''; }
  }

  /* ---------- Sliding background ---------- */
  const slides = $$('.bg__slide');
  const dots = $('#bgDots');
  const HOLD = 6500;
  let cur = -1, timer;
  dots.innerHTML = slides.map((_, i) => `<button aria-label="Foto ${i + 1}" data-i="${i}"></button>`).join('');
  dots.style.setProperty('--dur', HOLD + 'ms');

  function show(i) {
    const prev = slides[cur];
    const next = slides[i];
    if (prev === next) return;
    // Park every idle slide off to the right, without animating it across the screen.
    for (const s of slides) {
      if (s === prev || s === next) continue;
      s.classList.add('no-anim'); s.classList.remove('is-active', 'is-leaving');
    }
    next.classList.add('no-anim'); next.classList.remove('is-leaving');
    void next.offsetWidth;
    for (const s of slides) s.classList.remove('no-anim');
    if (prev) { prev.classList.remove('is-active'); prev.classList.add('is-leaving'); }
    next.classList.add('is-active');
    cur = i;
    $$('button', dots).forEach((b, k) => b.classList.toggle('is-on', k === i));
    $('#bgCount').textContent = `${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  function play() {
    clearInterval(timer);
    timer = setInterval(() => show((cur + 1) % slides.length), HOLD);
  }
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { show(+b.dataset.i); play(); } });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : play()));
  // Preload so a slide never arrives half-painted.
  for (const s of slides) { const m = /url\(['"]?(.*?)['"]?\)/.exec(s.style.getPropertyValue('--img')); if (m) new Image().src = m[1]; }
  show(0); play();

  /* ---------- Hero film (only if assets/video/hero.mp4 exists) ---------- */
  const video = $('#heroVideo');
  video.addEventListener('canplay', () => { $('.hero').classList.add('has-video'); video.play().catch(() => {}); }, { once: true });

  /* ---------- Nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeNav = () => { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', String(links.classList.toggle('is-open'))));
  links.addEventListener('click', (e) => e.target.closest('a') && closeNav());

  /* ---------- Marquees: duplicate the track once so the loop is seamless ---------- */
  for (const track of $$('.quotes__track, .reel__track')) {
    for (const node of [...track.children]) { const c = node.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
  }

  /* ---------- Scroll reveals ---------- */
  const targets = $$('.head, .story__text > *, .story__art, .tabs, .menu, .menu__notes, .scores, .quotes, .reel, .visit__info > *, .visit__map');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    targets.forEach((el) => { el.classList.add('io'); io.observe(el); });
  }

  $('#year').textContent = new Date().getFullYear();
  setLang(lang);
})();
