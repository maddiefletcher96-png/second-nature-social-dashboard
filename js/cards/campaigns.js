/*
 * Business · Campaign tracker, plus the campaign detail view.
 * Campaigns also show as bands on the calendar.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, card, table, chip, modal, stat } = SN.ui;
  const q = SN.q;
  const ALL_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Status follows the dates unless someone has set it by hand
  function status(c) {
    const override = SN.store.get('campaignStatus', {})[c.id];
    if (override) return override;
    const today = SN.ui.today();
    return today < c.start ? 'Planned' : today > c.end ? 'Complete' : 'Live';
  }

  function stats(c) {
    const posts = q.posts({ months: ALL_MONTHS }).filter(p => p.campaign === c.id);
    const attributed = SN.cards.attributed(ALL_MONTHS).filter(p => p.campaign === c.id);
    const planned = SN.data.planned.filter(p => p.campaign === c.id && q.platforms().includes(p.platform));
    return {
      posts, planned,
      reach: q.sum(posts, 'reach'),
      er: q.engagementRate(posts),
      clicks: q.sum(posts, 'clicks'),
      bookings: attributed.reduce((a, p) => a + p.bookings, 0),
      signups: attributed.reduce((a, p) => a + p.signups, 0)
    };
  }

  function detail(c) {
    const s = stats(c);
    const statusSel = h('select', { class: 'inline', 'aria-label': 'Status', onchange: e => {
      const all = SN.store.get('campaignStatus', {});
      all[c.id] = e.target.value; SN.store.set('campaignStatus', all); SN.app.rerender();
    } }, ['Planned', 'Live', 'Complete'].map(v => h('option', { value: v, selected: status(c) === v ? true : null }, v)));
    modal(c.name, h('div', null,
      h('p', { class: 'muted', style: { marginTop: 0 } }, `${SN.ui.fmt.dateLong(c.start)} to ${SN.ui.fmt.dateLong(c.end)} · Care for ${c.care}`),
      h('p', null, c.summary),
      h('div', { class: 'goal-top', style: { marginBottom: '12px' } }, h('span', { class: 'small' }, 'Status'), statusSel),
      h('div', { class: 'stats' },
        stat('Posts', s.posts.length + (s.planned.length ? ` + ${s.planned.length} planned` : '')),
        stat('Reach', fmt.num(s.reach)),
        stat('Eng. rate', fmt.pct(s.er)),
        stat('Link clicks', fmt.num(s.clicks)),
        stat('Bookings', s.bookings.toFixed(1)),
        stat('Fold sign-ups', s.signups.toFixed(1))),
      h('h3', { class: 'sub-h' }, 'Posts'),
      table([
        { label: 'Date', render: p => fmt.date(p.date) },
        { label: 'Post', render: p => h('span', null, SN.ui.platformTag(p.platform), ' ', p.title) },
        { label: 'Views', num: true, render: p => p.planned ? chip('Planned', 'planned') : fmt.num(p.views) },
        { label: 'Eng.', num: true, render: p => p.planned ? '' : fmt.num(p.interactions) }
      ], s.posts.concat(s.planned).sort((a, b) => a.date.localeCompare(b.date)), { empty: 'No posts yet.' }),
      h('p', { class: 'small muted' }, 'UTM campaign: ', h('code', null, SN.cards.utmSlug(c.name)))), { wide: true });
  }

  SN.cards.campaigns = function () {
    const rows = SN.data.campaigns.map(c => Object.assign({ c }, stats(c)));
    return card({ title: 'Campaign tracker', span: 6, subtitle: 'Click a campaign for the detail view · also shown as bands on the calendar' },
      table([
        { label: 'Campaign', render: r => h('div', null, h('div', { style: { fontWeight: 500 } }, r.c.name), h('div', { class: 'muted small' }, fmt.date(r.c.start) + ' to ' + fmt.date(r.c.end))) },
        { label: 'Status', render: r => chip(status(r.c), status(r.c).toLowerCase()) },
        { label: 'Posts', num: true, render: r => r.posts.length || (r.planned.length ? h('span', { class: 'muted' }, r.planned.length + 'p') : 0) },
        { label: 'Reach', num: true, render: r => fmt.num(r.reach) },
        { label: 'Eng.', num: true, render: r => r.posts.length ? fmt.pct(r.er) : '–' },
        { label: 'Clicks', num: true, render: r => fmt.num(r.clicks) },
        { label: 'Book.', num: true, render: r => r.bookings ? r.bookings.toFixed(1) : '–' },
        { label: 'Sign-ups', num: true, render: r => r.signups ? r.signups.toFixed(1) : '–' }
      ], rows, { rowClass: () => 'clickable', onRow: r => detail(r.c) }),
      h('p', { class: 'small muted' }, '"p" = planned posts not yet live.'));
  };
  SN.cards.campaignStats = stats;
  SN.cards.campaignStatus = status;
  SN.cards.campaignDetail = detail;
})();
