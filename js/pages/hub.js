/*
 * Knowledge Hub: platform updates from Instagram and TikTok.
 * Major functional changes get a pop-up on the day they're announced.
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, card, chip, platformTag, segmented, modal } = SN.ui;

  // Functional changes only: new features, formats, ranking, ads tools. Not music, events or partnerships.
  const FUNCTIONAL = /\b(introduc|launch|algorithm|ranking|now available|rolling out|new feature|new tools?|changes? to|update[sd]? (to|for)|subscription|policy)/i;
  const NOT_FUNCTIONAL = /\b(album|podcast|livestream|premiere|partnership|honoring|guide:|halloween|holiday)\b/i;

  function notes() { return window.SN_UPDATE_NOTES || {}; }

  function items() {
    const list = (window.SN_UPDATES && window.SN_UPDATES.items) || [];
    return list.map(u => {
      const n = notes()[u.url] || {};
      const auto = u.type === 'product' && FUNCTIONAL.test(u.title) && !NOT_FUNCTIONAL.test(u.title) && !/\btests?\b/i.test(u.title);
      return Object.assign({}, u, { id: u.url, note: n.note || null, major: n.major !== undefined ? n.major : auto });
    }).sort((a, b) => b.date.localeCompare(a.date));
  }

  // Real calendar date, not the dashboard's report date
  function todayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const TYPE_LABEL = { product: 'Product change', tips: 'Tips & guides', insight: 'Trends & insight', news: 'News' };

  function noteBox(text) {
    return h('div', { class: 'update-note' }, h('span', { class: 'note-label' }, 'For Second Nature'), h('p', null, text));
  }

  function updateRow(u) {
    return h('li', { class: 'update' + (u.major ? ' major' : '') },
      h('div', { class: 'update-date' }, fmt.date(u.date), h('span', null, u.date.slice(0, 4))),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { class: 'update-tags' }, platformTag(u.platform), u.major ? chip('Major change', 'declined') : chip(TYPE_LABEL[u.type] || 'News', u.type === 'product' ? 'approved' : '')),
        h('a', { class: 'update-title', href: u.url, target: '_blank', rel: 'noopener' }, u.title, ' ↗'),
        u.summary ? h('p', { class: 'small muted', style: { margin: '2px 0 0' } }, u.summary) : null,
        u.note ? noteBox(u.note) : null));
  }

  function popup(u, preview) {
    const close = modal('Major change announced today', h('div', { class: 'popup-update' },
      h('div', { class: 'update-tags' }, platformTag(u.platform), chip('Major change', 'declined'), h('span', { class: 'muted small' }, fmt.dateLong(u.date))),
      h('h3', { class: 'popup-title' }, u.title),
      u.summary ? h('p', null, u.summary) : null,
      u.note ? noteBox(u.note) : null,
      h('div', { class: 'form-actions' },
        h('a', { class: 'btn', href: u.url, target: '_blank', rel: 'noopener' }, 'Read the announcement ↗'),
        h('a', { class: 'btn', href: '#/hub', onclick: () => close() }, 'Knowledge Hub'),
        h('button', { class: 'btn primary', onclick: () => { if (!preview) dismiss(u); close(); } }, 'Got it'))));
    if (!preview && SN.motion) setTimeout(() => SN.motion.burst(innerWidth / 2, innerHeight / 2 - 120, 40), 250);
  }

  function dismissed() { return SN.store.get('updatesSeen', {}); }
  function dismiss(u) { const d = dismissed(); d[u.id] = todayIso(); SN.store.set('updatesSeen', d); }

  // Pop-up on the day a major change is announced, once per change
  function checkPopup() {
    const today = todayIso();
    const due = items().filter(u => u.major && u.date === today && !dismissed()[u.id]);
    if (due.length) popup(due[0], false);
  }

  // Unseen major changes from the last 7 days, for the dot on the rail icon
  function recentMajor() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const since = d.toISOString().slice(0, 10);
    return items().filter(u => u.major && u.date >= since && !dismissed()[u.id]).length;
  }

  SN.pages.hub = function () {
    const all = items();
    const filter = SN.store.get('hubFilter', 'all');
    const plats = SN.q.platforms();
    const search = SN.store.get('hubSearch', '');
    const shown = all.filter(u => plats.includes(u.platform) &&
      (filter === 'all' || (filter === 'major' ? u.major : u.type === filter)) &&
      (!search || (u.title + ' ' + (u.summary || '') + ' ' + (u.note || '')).toLowerCase().includes(search.toLowerCase())));
    const majors = all.filter(u => u.major && plats.includes(u.platform));
    const checked = window.SN_UPDATES ? window.SN_UPDATES.checked : null;
    const searchIn = h('input', { type: 'search', class: 'inline', placeholder: 'Search updates', value: search, 'aria-label': 'Search updates',
      onchange: e => { SN.store.set('hubSearch', e.target.value); SN.app.rerender(); } });

    return h('div', { class: 'grid' },
      card({ title: 'Major changes', span: 12, subtitle: 'Functional changes to how the platforms work. Each gets a pop-up on the day it\'s announced.',
        actions: majors.length ? h('button', { class: 'btn small', onclick: () => popup(majors[0], true) }, 'Preview pop-up') : null },
        majors.length ? h('div', { class: 'major-grid' }, majors.map(u => h('div', { class: 'major-card' },
          h('div', { class: 'update-tags' }, platformTag(u.platform), h('span', { class: 'muted small' }, fmt.dateLong(u.date))),
          h('a', { class: 'update-title', href: u.url, target: '_blank', rel: 'noopener' }, u.title, ' ↗'),
          u.summary ? h('p', { class: 'small muted', style: { margin: '4px 0 0' } }, u.summary) : null,
          u.note ? noteBox(u.note) : null)))
          : h('p', { class: 'muted' }, 'No major changes for the selected platform.')),
      card({ title: 'All updates', span: 8, subtitle: `${shown.length} of ${all.length} · newest first`,
        actions: [searchIn, segmented([['all', 'All'], ['major', 'Major'], ['product', 'Product'], ['tips', 'Tips'], ['news', 'News']], filter, v => { SN.store.set('hubFilter', v); SN.app.rerender(); })] },
        h('ul', { class: 'list updates' }, shown.length ? shown.map(updateRow) : h('li', { class: 'muted' }, 'Nothing matches.'))),
      card({ title: 'Sources', span: 4, subtitle: checked ? `Last checked ${fmt.dateLong(checked)}` : null },
        h('ul', { class: 'list' },
          [['Instagram Blog', 'https://about.instagram.com/blog', 'Announcements, product news and guides'],
           ['Instagram latest updates', 'https://www.instagram.com/popular/instagrams-latest-updates/?hl=en', 'Summary of recent feature tests and launches'],
           ['TikTok Newsroom', 'https://newsroom.tiktok.com/?lang=en', 'Product, advertiser and company news']].map(([n, u, d]) =>
            h('li', null, h('div', null, h('a', { href: u, target: '_blank', rel: 'noopener' }, h('b', null, n), ' ↗'), h('div', { class: 'muted small' }, d))))),
        h('p', { class: 'small muted' }, 'Updates are fetched daily by a GitHub Action. Team notes and major or minor overrides go in js/update-notes.js.')));
  };

  SN.updates = { items, checkPopup, recentMajor, popup };
})();
