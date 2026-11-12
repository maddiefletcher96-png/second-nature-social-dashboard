/*
 * Business · Social to stay
 * Impressions → Link clicks → Website visits → Booking starts → Bookings → Revenue,
 * split by platform (or property), with step conversion and change vs previous period.
 * Sources: platform insights, UTM-tagged links, website analytics, booking engine.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, delta, card, table, segmented } = SN.ui;
  const q = SN.q;

  const STEPS = [
    { key: 'impressions', label: 'Impressions' },
    { key: 'clicks', label: 'Link clicks' },
    { key: 'visits', label: 'Website visits' },
    { key: 'starts', label: 'Booking starts' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'revenue', label: 'Revenue (£)', money: true }
  ];
  const PROP_COLORS = { Chiswick: 'var(--moss)', Belfast: 'var(--clay)', Southampton: 'var(--sand)' };

  function stepValue(step, opts) {
    if (step === 'impressions') return q.account('views', opts);
    if (step === 'clicks') return q.account('linkTaps', opts);
    return q.web(step, opts);
  }

  // One segment per platform or property for the current filters
  function segments(split, months) {
    if (split === 'property') {
      const props = SN.state.filters.property === 'all' ? SN.data.PROPERTIES : [SN.state.filters.property];
      return props.map(p => ({ name: p, color: PROP_COLORS[p], opts: { property: p, months } }));
    }
    return q.platforms().map(pl => ({ name: pl === 'instagram' ? 'Instagram' : 'TikTok', color: pl === 'instagram' ? 'var(--ig)' : 'var(--tt)', opts: { platform: pl, months } }));
  }

  function attributed(months) {
    const list = q.posts({ months }).filter(p => p.clicks > 0);
    const totalClicks = q.sum(list, 'clicks') || 1;
    const bookings = q.web('bookings', { months });
    const revenue = q.web('revenue', { months });
    const signups = q.web('fold', { months });
    return list.map(p => Object.assign({}, p, {
      bookings: bookings * p.clicks / totalClicks,
      revenue: revenue * p.clicks / totalClicks,
      signups: signups * p.clicks / totalClicks
    }));
  }

  function socialToStay() {
    const split = SN.store.get('funnelSplit', 'platform');
    const per = SN.state.period();
    const segs = segments(split, per.months);
    const values = STEPS.map(s => segs.map(sg => stepValue(s.key, sg.opts)));
    const totals = values.map(v => v.reduce((a, b) => a + b, 0));
    const prevTotals = per.prev ? STEPS.map(s => stepValue(s.key, { months: per.prev })) : null;
    const prevSame = per.prev ? STEPS.map(s => stepValue(s.key, { months: per.prev })) : null;

    // Log scale so bookings are still visible next to hundreds of thousands of impressions
    const maxLog = Math.log10(Math.max(...totals.slice(0, 5), 10));
    const barH = v => 18 + Math.max(0, Math.log10(Math.max(v, 1)) / maxLog) * 132;

    const convRow = h('div', { class: 'funnel-convs' }, STEPS.map((s, i) => {
      if (i === 0) return h('div');
      const conv = s.key === 'revenue' ? (totals[4] ? totals[5] / totals[4] : 0) : (totals[i - 1] ? totals[i] / totals[i - 1] * 100 : 0);
      const prevConv = prevSame ? (s.key === 'revenue' ? (prevSame[4] ? prevSame[5] / prevSame[4] : null) : (prevSame[i - 1] ? prevSame[i] / prevSame[i - 1] * 100 : null)) : null;
      return h('div', null, s.key === 'revenue' ? 'per booking' : 'conversion', h('b', { style: { display: 'block' } },
        s.key === 'revenue' ? fmt.gbpFull(conv) : fmt.pct(conv, conv < 1 ? 2 : 1)),
        prevConv !== null ? delta(conv, prevConv, s.key === 'revenue' ? {} : { points: true }) : null);
    }));

    const funnel = h('div', { class: 'funnel' }, STEPS.map((s, i) => {
      const total = totals[i];
      return h('div', { class: 'fstep' },
        h('div', {
          class: 'fbar', style: { height: barH(i === 5 ? totals[4] * 1.4 : total) + 'px' },
          onmousemove: e => SN.charts.showTip(e, `<div class="tip-h">${s.label}</div>` + segs.map((sg, j) =>
            `<div><i style="background:${sg.color}"></i>${sg.name}<b>${s.money ? fmt.gbpFull(values[i][j]) : fmt.full(values[i][j])}</b></div>`).join('')),
          onmouseleave: SN.charts.hideTip
        }, segs.map((sg, j) => h('span', { style: { background: sg.color, height: (total ? values[i][j] / total * 100 : 0) + '%' } }))),
        h('div', { class: 'flabel' }, s.label),
        h('div', { class: 'fval' }, s.money ? fmt.gbp(total) : fmt.num(total)),
        prevTotals ? delta(total, prevTotals[i]) : null);
    }));

    const top = attributed(per.months).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    return card({
      title: 'Social to stay', span: 8,
      subtitle: `From impression to booking, ${per.label}. Bar heights use a log scale.`,
      actions: [
        segmented([['platform', 'By platform'], ['property', 'By property']], split, v => { SN.store.set('funnelSplit', v); SN.app.rerender(); }),
        h('button', { class: 'btn small', onclick: SN.cards.utmBuilder }, 'UTM builder')
      ]
    },
      SN.charts.legend(segs),
      convRow,
      funnel,
      h('h3', { class: 'sub-h' }, 'Posts and links that drove the most bookings'),
      table([
        { label: 'Post', render: p => h('div', null, h('div', null, p.title), h('div', { class: 'muted small' }, SN.ui.platformTag(p.platform), ' ', fmt.date(p.date))) },
        { label: 'UTM campaign', render: p => h('code', { class: 'small' }, SN.cards.utmSlug(p.campaign ? SN.data.campaigns.find(c => c.id === p.campaign).name : 'always-on')) },
        { label: 'Clicks', num: true, render: p => fmt.num(p.clicks) },
        { label: 'Bookings', num: true, render: p => p.bookings.toFixed(1) },
        { label: 'Revenue', num: true, render: p => fmt.gbpFull(p.revenue) }
      ], top),
      h('p', { class: 'small muted' }, 'Bookings are attributed by UTM-tagged link clicks. Fractions appear where a booking is shared across posts.'));
  }

  SN.cards.socialToStay = socialToStay;
  SN.cards.attributed = attributed;
})();
