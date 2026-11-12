/*
 * Business · Property breakdown
 * Chiswick, Belfast and Southampton side by side, with a gentle flag on the
 * property that had the least content support this period.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, card } = SN.ui;
  const q = SN.q;

  function rows(months) {
    return SN.data.PROPERTIES.map(p => {
      const list = q.posts({ property: p, months });
      return {
        name: p,
        posts: list.length,
        reach: q.sum(list, 'reach'),
        er: q.engagementRate(list),
        clicks: q.sum(list, 'clicks'),
        bookings: q.web('bookings', { property: p, months })
      };
    });
  }

  SN.cards.properties = function () {
    const per = SN.state.period();
    const data = rows(per.months);
    const least = data.slice().sort((a, b) => a.posts - b.posts || a.reach - b.reach)[0];
    const share = least.posts / (data.reduce((a, r) => a + r.posts, 0) || 1) * 100;
    return card({ title: 'Property breakdown', span: 6, subtitle: per.label + ' · all platforms selected in the header' },
      h('div', { class: 'prop-grid' }, data.map(r => h('div', { class: 'prop' + (r === least ? ' flagged' : '') },
        h('h3', null, r.name),
        h('dl', { class: 'kv' },
          h('dt', null, 'Posts'), h('dd', null, r.posts),
          h('dt', null, 'Reach'), h('dd', null, fmt.num(r.reach)),
          h('dt', null, 'Eng. rate'), h('dd', null, fmt.pct(r.er)),
          h('dt', null, 'Link clicks'), h('dd', null, fmt.num(r.clicks)),
          h('dt', null, 'Bookings'), h('dd', null, fmt.num(r.bookings)))))),
      h('p', { class: 'callout', style: { marginTop: '12px' } },
        `${least.name} had the least content this period, ${least.posts} posts (${share.toFixed(0)}% of property posts). `,
        'Worth a city guide or room tour in the next plan.'));
  };
  SN.cards.propertyRows = rows;
})();
