/*
 * App shell: icon rail navigation, header filters (shared by every page),
 * hash routing and theme toggle.
 */
(function () {
  const { h } = SN.ui;
  const { filters, setFilter } = SN.state;

  const icon = paths => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = paths;
    return svg;
  };

  const PAGES = [
    { id: 'overview', label: 'Overview', title: 'Overview', icon: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>' },
    { id: 'strategy', label: 'Strategy', title: 'Strategy', icon: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>' },
    { id: 'business', label: 'Business', title: 'Business', icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
    { id: 'community', label: 'Community', title: 'Community', icon: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>' },
    { id: 'partners', label: 'Partners', title: 'Partners', icon: '<circle cx="8" cy="8" r="3.5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M2 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M14.5 15.2c.8-.5 1.6-.7 2.5-.7 2.3 0 4.2 1.7 4.7 4.5"/>' },
    { id: 'calendar', label: 'Calendar', title: 'Calendar', icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>' },
    { id: 'hub', label: 'Hub', title: 'Knowledge Hub', icon: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M9 8h7M9 12h5"/>' },
    { id: 'reports', label: 'Reports', title: 'Reports', icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>' }
  ];

  function current() {
    const id = (location.hash.match(/^#\/(\w+)/) || [])[1];
    return PAGES.find(p => p.id === id) || PAGES[0];
  }

  function renderRail() {
    const rail = document.getElementById('rail');
    rail.innerHTML = '';
    const cur = current();
    rail.appendChild(h('a', { class: 'mark', href: '#/overview', 'aria-label': 'Second Nature home' },
      h('img', { src: 'assets/logo/mark-n.svg', alt: '' })));
    PAGES.forEach(p => {
      const badge = p.id === 'hub' && SN.updates && SN.updates.recentMajor() ? h('span', { class: 'rail-dot', title: 'New major platform change' }) : null;
      const a = h('a', { href: '#/' + p.id, class: p.id === cur.id ? 'active' : '', 'aria-label': p.label + (badge ? ', new major change' : ''), 'aria-current': p.id === cur.id ? 'page' : null },
        icon(p.icon), h('span', { class: 'lbl' }, p.label), badge);
      rail.appendChild(a);
    });
    rail.appendChild(h('div', { class: 'spacer' }));
    rail.appendChild(h('a', { href: '#', 'aria-label': 'Switch theme', onclick: e => { e.preventDefault(); toggleTheme(); } },
      icon('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'), h('span', { class: 'lbl' }, 'Theme')));
  }

  function select(label, key, options) {
    return h('label', null, label,
      h('select', { 'aria-label': label, onchange: e => setFilter(key, e.target.value) },
        options.map(([v, l]) => h('option', { value: v, selected: filters[key] === v ? true : null }, l))));
  }

  function renderTop() {
    const top = document.getElementById('top');
    top.innerHTML = '';
    const cur = current();
    top.appendChild(h('div', null,
      h('div', { class: 'brand' },
        h('img', { class: 'dark', src: 'assets/logo/wordmark.svg', alt: 'Second Nature' }),
        h('img', { class: 'light', src: 'assets/logo/wordmark-light.svg', alt: 'Second Nature' }),
        h('span', { class: 'crumb' }, 'Social')),
      h('h1', null, cur.title)));
    top.appendChild(h('div', { class: 'filters' },
      select('Platform', 'platform', [['all', 'All platforms'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']]),
      select('Property', 'property', [['all', 'All properties'], ...SN.data.PROPERTIES.map(p => [p, p])]),
      SN.datePicker(),
      filters.excludePaid ? h('span', { class: 'chip live', title: 'Paid and boosted posts are excluded from every card' }, 'Organic only') : null));
  }

  function renderBanner() {
    const el = document.getElementById('banner');
    if (SN.store.get('bannerHidden', false)) { el.innerHTML = ''; return; }
    el.innerHTML = '';
    el.appendChild(h('div', { class: 'banner no-print' },
      h('span', null, h('b', null, 'Sample data. '),
        'Instagram figures from Nov 2025 come from the ', h('i', null, SN.data.sheetSource), ' and the ', h('i', null, SN.data.reportSource),
        '. TikTok before September, website, booking, inbox and partner figures are illustrative until the connectors are live.'),
      h('button', { class: 'link-btn', style: { marginLeft: 'auto' }, onclick: () => { SN.store.set('bannerHidden', true); renderBanner(); } }, 'Hide')));
  }

  // isNav: a new page (cards rise in); otherwise a filter change (numbers recount only)
  function renderPage(isNav) {
    const page = document.getElementById('page');
    const cur = current();
    SN.charts.hideTip();
    page.innerHTML = '';
    const render = SN.pages && SN.pages[cur.id];
    page.appendChild(render ? render() : h('p', null, 'Page not found.'));
    document.title = `${cur.title} · Second Nature Social`;
    if (isNav) SN.motion.enter(page);
    SN.motion.numbers(page);
    requestAnimationFrame(() => SN.motion.celebrate(page));
  }

  function renderAll() { renderRail(); renderTop(); renderBanner(); renderPage(true); }

  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    SN.store.set('theme', root.dataset.theme);
    renderPage();
  }

  const savedTheme = SN.store.get('theme', null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  window.addEventListener('hashchange', () => { renderAll(); window.scrollTo(0, 0); });
  SN.state.onChange(() => { renderTop(); renderPage(false); });
  SN.app = { rerender: renderPage, PAGES };
  renderAll();
  // Major platform change announced today? Show it once.
  setTimeout(() => SN.updates && SN.updates.checkPopup(), 900);
})();
