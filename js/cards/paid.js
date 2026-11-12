/*
 * Business · Paid vs organic
 * The toggle excludes paid and boosted posts from every other card, so the
 * organic picture stays clean.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, card, table } = SN.ui;
  const q = SN.q;

  SN.cards.paid = function () {
    const posts = q.posts({ includePaid: true });
    const rows = [];
    q.platforms().forEach(pl => {
      [false, true].forEach(paid => {
        const list = posts.filter(p => p.platform === pl && p.paid === paid);
        rows.push({ pl, paid, posts: list.length, reach: q.sum(list, 'reach'), eng: q.sum(list, 'interactions'), clicks: q.sum(list, 'clicks') });
      });
    });
    const totalReach = q.sum(posts, 'reach') || 1;
    const paidReach = q.sum(posts.filter(p => p.paid), 'reach');
    const on = SN.state.filters.excludePaid;
    return card({ title: 'Paid vs organic', span: 4, subtitle: SN.state.period().label },
      SN.charts.bars({
        labels: ['Reach', 'Engagement', 'Clicks'], horizontal: true, percent: true, height: 120, labelWidth: 80,
        series: [
          { name: 'Organic', color: 'var(--moss)', values: ['reach', 'eng', 'clicks'].map(k => rows.filter(r => !r.paid).reduce((a, r) => a + r[k], 0)) },
          { name: 'Paid / boosted', color: 'var(--sand)', values: ['reach', 'eng', 'clicks'].map(k => rows.filter(r => r.paid).reduce((a, r) => a + r[k], 0)) }
        ]
      }),
      table([
        { label: '', render: r => h('span', null, SN.ui.platformTag(r.pl), ' ', h('span', { class: 'small' }, r.paid ? 'Paid' : 'Organic')) },
        { label: 'Posts', num: true, key: 'posts' },
        { label: 'Reach', num: true, render: r => fmt.num(r.reach) },
        { label: 'Eng.', num: true, render: r => fmt.num(r.eng) },
        { label: 'Clicks', num: true, render: r => fmt.num(r.clicks) }
      ], rows),
      h('label', { class: 'toggle' },
        h('input', { type: 'checkbox', checked: on ? true : null, onchange: e => SN.state.setFilter('excludePaid', e.target.checked) }),
        h('span', null, h('b', null, 'Exclude paid from all other cards'), h('br'), h('span', { class: 'muted small' }, `Paid is ${(paidReach / totalReach * 100).toFixed(1)}% of reach this period`))));
  };
})();
