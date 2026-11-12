/*
 * Reports: export panel + live preview, laid out like the Second Nature deck
 * (Template V2) and brand book.
 *
 *  - A4 landscape pages (the deck's 16:9 feel, printable)
 *  - Cover and closing on Dark Green with Light Green type, "for impact" only;
 *    every other page on Warm Grey, as the brand book asks ("bright and fresh")
 *  - The split SECOND / NATURE wordmark book-ends each page, with a hairline rule
 *  - Small titles: Special Gothic Semibold, uppercase, wide tracking
 *  - Large titles: GT Alpina Light (Lustria stand-in), sentence case, italic second line
 *  - Short sections share a page so the report stays tight
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, table, delta, chip, toast } = SN.ui;
  const q = SN.q;
  const PAGE_UNITS = 4; // a page holds 4 units; sections declare their size

  const SECTIONS = [
    { id: 'headline', label: 'Headline stats', fixed: true },
    { id: 'goals', label: '2026 goals', size: 2 },
    { id: 'top', label: 'Top posts', size: 2 },
    { id: 'insights', label: 'Successes and improvements', size: 4 },
    { id: 'stay', label: 'Social to stay', size: 4 },
    { id: 'fold', label: 'The Fold sign-ups', size: 1 },
    { id: 'property', label: 'Property breakdown', size: 2 },
    { id: 'campaigns', label: 'Campaigns', size: 3 },
    { id: 'community', label: 'Community', size: 3 },
    { id: 'notes', label: 'Chart notes', size: 1 },
    { id: 'agency', label: 'Agency scorecard', size: 2 },
    { id: 'actions', label: 'Actions and plans', size: 2 }
  ];
  const PRESETS = {
    weekly: ['headline', 'top', 'insights', 'community', 'notes'],
    monthly: SECTIONS.map(s => s.id)
  };

  function enabled() { return SN.store.get('reportSections', PRESETS.monthly); }

  // ---------------------------------------------------------------
  // Page frame
  // ---------------------------------------------------------------
  function bookends(dark) {
    const c = dark ? 'lime' : 'forest';
    return [h('img', { class: 'rp-second', src: `assets/logo/second-${c}.svg`, alt: 'Second' }), h('img', { class: 'rp-nature', src: `assets/logo/nature-${c}.svg`, alt: 'Nature' })];
  }

  function frame({ dark, kicker, cls }, ...body) {
    const [second, nature] = bookends(dark);
    return h('section', { class: 'rp' + (dark ? ' rp-dark' : '') + (cls ? ' ' + cls : '') },
      h('header', { class: 'rp-top' }, second, kicker ? h('span', { class: 'rp-kicker' }, kicker) : h('span'), nature),
      h('div', { class: 'rp-body' }, body),
      h('footer', { class: 'rp-foot' },
        h('span', null, `Copyright © 2026 Second Nature · Social report, ${SN.state.period().label}`),
        h('span', { class: 'rp-num' })));
  }

  // Large serif title with an italic second line, as on the deck's cover
  function title(main, italic, cls) {
    return h('h2', { class: 'rp-title ' + (cls || '') }, main, italic ? h('em', null, ' ' + italic) : null);
  }
  function small(text) { return h('div', { class: 'rp-small' }, text); }

  // ---------------------------------------------------------------
  // Cover, summary + headline stats, closing
  // ---------------------------------------------------------------
  function cover() {
    const f = SN.state.filters;
    const scope = [f.platform === 'all' ? 'Instagram and TikTok' : f.platform === 'instagram' ? 'Instagram' : 'TikTok',
      f.property === 'all' ? 'All hometels' : f.property, f.excludePaid ? 'Organic only' : null].filter(Boolean).join(' · ');
    return frame({ dark: true, cls: 'rp-cover' },
      h('div', { class: 'rp-cover-text' },
        h('h1', null, 'Social report.', h('br'), h('em', null, SN.state.period().label + '.')),
        h('p', { class: 'rp-small' }, scope)));
  }

  function headlineStats() {
    const per = SN.state.period();
    const tiles = [];
    q.platforms().forEach(pl => {
      const v = q.account('followers', { platform: pl });
      const p = per.prev ? q.account('followers', { platform: pl, months: per.prev }) : null;
      tiles.push([(pl === 'instagram' ? 'Instagram' : 'TikTok') + ' followers', fmt.full(v), delta(v, p)]);
    });
    [['Views', 'views'], ['Interactions', 'interactions'], ['Engagement rate', 'engagementRate'], ['Shares', 'shares'], ['Saves', 'saves'], ['Profile visits', 'profileVisits'], ['Link taps', 'linkTaps']].forEach(([l, k]) => {
      const v = q.account(k);
      const p = per.prev ? q.account(k, { months: per.prev }) : null;
      tiles.push([l, k === 'engagementRate' ? fmt.pct(v, 2) : fmt.num(v), delta(v, p, { points: k === 'engagementRate' })]);
    });
    tiles.push(['Bookings from social', fmt.full(q.web('bookings')), per.prev ? delta(q.web('bookings'), q.web('bookings', { months: per.prev })) : null]);
    return h('div', { class: 'rp-stats' }, tiles.map(([l, v, d]) =>
      h('div', { class: 'rp-stat' }, h('div', { class: 'rp-small' }, l), h('div', { class: 'rp-num-big' }, v), h('div', { class: 'rp-delta' }, d))));
  }

  function summaryPage(includeStats) {
    const per = SN.state.period();
    const status = h('span', { class: 'muted small' }, SN.summary.isEdited() ? 'Edited · saved in this browser' : 'Written from this period\'s numbers');
    const ta = h('textarea', {
      class: 'summary-edit no-print', rows: 9, 'aria-label': 'Report summary',
      oninput: e => { SN.summary.save(e.target.value); status.textContent = 'Edited · saved in this browser'; printText.textContent = e.target.value; }
    }, SN.summary.get());
    const printText = h('p', { class: 'rp-intro summary-print' }, SN.summary.get());
    return frame({ kicker: 'In summary', cls: 'rp-summary' },
      h('div', { class: includeStats ? 'rp-cols rp-cols-summary' : '' },
        h('div', null,
          title('The month', 'in brief.'),
          h('div', { class: 'goal-top no-print', style: { margin: '6px 0' } }, status,
            h('button', { class: 'link-btn', onclick: () => { SN.summary.reset(); SN.app.rerender(); toast('Summary rewritten from the numbers'); } }, 'Rewrite')),
          ta, printText,
          per.prevLabel ? h('p', { class: 'rp-caption' }, `Changes compared with ${per.prevLabel}.`) : null),
        includeStats ? h('div', null, small('Headline stats'), headlineStats()) : null));
  }

  function closing() {
    return frame({ dark: true, cls: 'rp-cover rp-closing' },
      h('div', { class: 'rp-cover-text' },
        h('h1', null, 'Care is Second Nature.', h('br'), h('em', null, 'Hospitality people feel confident choosing.')),
        h('p', { class: 'rp-small' }, 'secondnature.com')));
  }

  // ---------------------------------------------------------------
  // Sections: each returns { title, italic, body }
  // ---------------------------------------------------------------
  function goals() {
    const list = SN.data.goals.filter(g => q.platforms().includes(g.platform));
    return { title: '2026 goals,', italic: 'where we stand.', body: h('div', { class: 'rp-goals' }, list.map(g => {
      const isPct = g.unit === 'pct';
      const done = g.current >= g.target;
      return h('div', { class: 'rp-goal' },
        h('div', { class: 'goal-top' }, h('span', null, g.label), h('b', null, isPct ? fmt.pct(g.current, 2) : fmt.num(g.current), h('span', { class: 'muted' }, ' / ' + (isPct ? g.target + '%' : fmt.num(g.target))))),
        SN.ui.progress(g.current, g.target, { cls: done ? 'done' : '' }));
    })) };
  }

  function top() {
    const list = q.posts().sort((a, b) => b.views - a.views).slice(0, 5);
    return { title: 'Top posts.', body: h('ol', { class: 'rp-top-posts' }, list.map((p, i) => h('li', null,
      h('span', { class: 'rp-rank' }, String(i + 1).padStart(2, '0')),
      h('div', null, h('div', { class: 'rp-post-title' }, p.title), h('div', { class: 'rp-caption' }, SN.ui.platformTag(p.platform), ' ', fmt.date(p.date), ' · ', p.property || 'All hometels')),
      h('div', { class: 'rp-post-stats' }, h('b', null, fmt.num(p.views)), ' views', h('br'), fmt.num(p.likes), ' likes · ', fmt.num(p.shares), ' shares')))) };
  }

  function insightsFor(m) {
    const d = SN.insights[m];
    return { title: `${SN.state.MONTH_NAMES[m]},`, italic: 'what worked and what\'s next.', body: h('div', null,
      h('p', { class: 'rp-caption', style: { marginTop: 0 } }, d.source),
      h('div', { class: 'rp-cols' },
        h('div', null, small('Key successes'), h('div', { class: 'tiles' }, d.successes.map(([t, x]) => SN.ui.tile('good', t, x)))),
        h('div', null, small('Areas for improvement'), h('div', { class: 'tiles' }, d.improvements.map(([t, x]) => SN.ui.tile('fix', t, x)))))) };
  }

  function fromCard(t, italic, el) { el.classList.add('in-report'); return { title: t, italic, body: el }; }

  function community() {
    const rs = SN.data.responseStats;
    const l = rs.avgHours.length - 1;
    const s = SN.data.sentiment;
    const open = SN.data.inbox.filter(m => !SN.store.get('handled', {})[m.id]).length;
    const mini = (label, v, d) => h('div', { class: 'rp-stat' }, h('div', { class: 'rp-small' }, label), h('div', { class: 'rp-num-big sm' }, v), h('div', { class: 'rp-delta' }, d));
    return { title: 'Community,', italic: 'how people are talking to us.', body: h('div', null,
      h('div', { class: 'rp-stats rp-stats-4' },
        mini('Unanswered', String(open)),
        mini('Avg response', rs.avgHours[l].toFixed(1) + 'h', delta(rs.avgHours[l], rs.avgHours[l - 1], { inverse: true })),
        mini('Within 24h', rs.within24[l] + '%', delta(rs.within24[l], rs.within24[l - 1], { points: true })),
        mini('Positive', s.positive[s.positive.length - 1] + '%', delta(s.positive[s.positive.length - 1], s.positive[s.positive.length - 2], { points: true }))),
      h('div', { class: 'rp-cols' },
        h('div', null, small('Sentiment by week'), SN.charts.stackedArea({ labels: s.weeks, chartId: 'sentiment', height: 150, series: [
          { name: 'Negative', color: 'var(--brick)', values: s.negative },
          { name: 'Neutral', color: 'var(--mid-grey)', values: s.neutral },
          { name: 'Positive', color: 'var(--lichen)', values: s.positive }] })),
        h('div', null, small('Recurring questions'), table([
          { label: 'Theme', key: 'theme' },
          { label: '4 weeks', num: true, render: t => t.counts.reduce((a, b) => a + b, 0) },
          { label: 'FAQ', render: t => SN.store.get('faq', []).some(f => f.theme === t.theme) ? chip('Sent', 'approved') : '' }
        ], SN.data.questions.slice().sort((a, b) => b.counts[3] - a.counts[3]).slice(0, 5))))) };
  }

  function agency() {
    const rows = [7, 8, 9].map(m => Object.assign({ m }, SN.partners.scoreFor(m)));
    const cur = rows[rows.length - 1];
    return { title: 'Stay the Night,', italic: 'agency scorecard.', body: h('div', null,
      table([
        { label: 'Month', render: r => SN.data.MONTHS[r.m] },
        { label: 'Delivered', num: true, render: r => `${r.delivered} / ${r.contracted}` },
        { label: 'On time', num: true, render: r => r.a.onTime + '%' },
        { label: 'Views vs account', num: true, render: r => fmt.pct(r.perf, 0) },
        { label: 'Score', num: true, render: r => h('b', null, r.score) }
      ], rows),
      cur.a.notes ? h('p', { class: 'rp-caption' }, h('b', null, 'Notes: '), cur.a.notes) : null) };
  }

  function notes() {
    const per = SN.state.period();
    const list = SN.notes.between(per.from, per.to);
    return { title: 'Team notes.', body: list.length
      ? h('ul', { class: 'rp-points' }, list.map(n => h('li', null, h('b', null, fmt.date(n.date) + ' · ' + n.author), h('span', null, n.text))))
      : h('p', { class: 'rp-caption' }, 'No notes pinned in this period.') };
  }

  function actions() {
    const done = SN.store.get('actions-done', {});
    const items = ['Repeat the lamp Reel format across Circular Christmas', 'Run two competitions to drive follower growth', 'Deliver the festive influencer campaign',
      'Roll out festive and York content', 'Decide on a Belfast food shoot', 'Grow proactive community management', 'Keep building search-led TikTok content', 'Organise stays for TikTok influencers'];
    return { title: 'Next,', italic: 'actions and plans.', body: h('ul', { class: 'rp-actions' }, items.map((t, i) => h('li', { class: done[i] ? 'done' : '' }, h('span', { class: 'rp-check' }, done[i] ? '✓' : ''), t))) };
  }

  const BUILDERS = {
    goals, top, community, agency, notes, actions,
    stay: () => fromCard('Social', 'to stay.', SN.cards.socialToStay()),
    fold: () => fromCard('The Fold,', 'sign-ups.', SN.cards.fold()),
    property: () => fromCard('Our hometels,', 'side by side.', SN.cards.properties()),
    campaigns: () => fromCard('Campaigns.', null, SN.cards.campaigns())
  };

  // Turn the chosen sections into units, then pack them onto pages in order
  function units(on) {
    const out = [];
    SECTIONS.forEach(s => {
      if (s.fixed || !on.includes(s.id)) return;
      if (s.id === 'insights') {
        SN.state.period().months.filter(m => SN.insights[m]).forEach(m => out.push({ id: 'insights-' + m, label: SN.state.MONTH_NAMES[m], size: 4, build: () => insightsFor(m) }));
      } else out.push({ id: s.id, label: s.label, size: s.size, build: BUILDERS[s.id] });
    });
    return out;
  }

  function pack(list) {
    const pages = [];
    let cur = [];
    let used = 0;
    list.forEach(u => {
      if (used + u.size > PAGE_UNITS && cur.length) { pages.push(cur); cur = []; used = 0; }
      cur.push(u);
      used += u.size;
    });
    if (cur.length) pages.push(cur);
    return pages;
  }

  function contentPage(group) {
    const built = group.map(u => Object.assign({ size: u.size, label: u.label }, u.build()));
    // Two halves sit side by side; otherwise sections stack
    const sideBySide = built.length === 2 && built.every(b => b.size <= 2);
    const kicker = group.map(u => u.label).join(' · ');
    return frame({ kicker },
      h('div', { class: sideBySide ? 'rp-cols rp-cols-sections' : 'rp-stack' }, built.map(b =>
        h('div', { class: 'rp-section' }, title(b.title, b.italic, b.size <= 1 ? 'sm' : ''), b.body))));
  }

  // ---------------------------------------------------------------
  // Export panel
  // ---------------------------------------------------------------
  function panel(pageCount) {
    const on = enabled();
    const set = list => { SN.store.set('reportSections', list); SN.app.rerender(); };
    const preset = JSON.stringify(on) === JSON.stringify(PRESETS.weekly) ? 'weekly' : JSON.stringify(on) === JSON.stringify(PRESETS.monthly) ? 'monthly' : 'custom';
    return h('aside', { class: 'card export-panel no-print' },
      h('header', { class: 'card-head' }, h('div', null, h('h2', null, 'Export'), h('p', { class: 'card-sub' }, 'Uses the header filters'))),
      h('div', { class: 'card-body' },
        SN.ui.segmented([['weekly', 'Quick weekly'], ['monthly', 'Full monthly']], preset, v => set(PRESETS[v].slice())),
        h('ul', { class: 'toggles' },
          h('li', null, h('label', null, h('input', { type: 'checkbox', checked: true, disabled: true }), 'Cover and summary')),
          SECTIONS.map(s => h('li', null, h('label', null,
            h('input', { type: 'checkbox', checked: on.includes(s.id) ? true : null, onchange: e => {
              const next = SECTIONS.map(x => x.id).filter(id => id === s.id ? e.target.checked : on.includes(id));
              set(next);
            } }), s.label)))),
        h('button', { class: 'btn primary', style: { width: '100%' }, onclick: () => window.print() }, 'Export PDF'),
        h('p', { class: 'small muted' }, `${pageCount} pages, A4 landscape. Choose "Save as PDF" in the print dialog.`)));
  }

  // Scale the fixed-size pages to fit the preview column
  function fit(preview) {
    const apply = () => {
      const w = preview.clientWidth;
      if (!w) return;
      preview.style.setProperty('--rp-scale', Math.min(1, w / 1123).toFixed(4));
    };
    requestAnimationFrame(apply);
    if (window.ResizeObserver) new ResizeObserver(apply).observe(preview);
  }

  SN.pages.reports = function () {
    const on = enabled();
    const pages = pack(units(on));
    const all = [cover(), summaryPage(on.includes('headline')), ...pages.map(contentPage), closing()];
    all.forEach((p, i) => { const n = p.querySelector('.rp-num'); if (n) n.textContent = String(i + 1).padStart(2, '0'); });
    const preview = h('div', { class: 'report-preview' }, all.map(p => h('div', { class: 'rp-shell' }, p)));
    fit(preview);
    return h('div', { class: 'report-layout' }, panel(all.length), preview);
  };
})();
