/*
 * Strategy · Instagram follower tracker for the financial year, growth
 * benchmarks, and content volume by format. Data from the follower growth
 * tracker sheet, with October from the monthly report.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, card, stat, table, chip } = SN.ui;

  const TIERS = [
    [0.5, 'Weak', 'Essentially flat'],
    [1, 'Below average', 'Slow for an account this size'],
    [2, 'Healthy', 'Industry standard for hospitality'],
    [3, 'Strong', 'Above the industry average'],
    [5, 'Excellent', 'Top quartile, usually needs hero content or paid'],
    [Infinity, 'Outlier', 'Almost always a giveaway or viral moment']
  ];
  const tier = rate => TIERS.find(t => rate < t[0]);

  SN.cards.fyTracker = function () {
    const fy = SN.data.fy;
    const n = fy.followers.length;
    const now = fy.followers[n - 1];
    const monthsLeft = fy.labels.length - n;
    const needed = Math.ceil((fy.goal - now) / monthsLeft);
    const avg = Math.round((now - fy.start) / n);
    const pace = fy.labels.map((_, i) => Math.round(fy.start + (fy.goal - fy.start) * (i + 1) / fy.labels.length));
    const fromHere = fy.labels.map((_, i) => i < n - 1 ? null : Math.round(now + (fy.goal - now) * (i - (n - 1)) / monthsLeft));
    return card({ title: 'Instagram follower tracker · financial year', span: 8, subtitle: `Goal ${fmt.full(fy.goal)} by ${fy.goalDate}, from ${fmt.full(fy.start)} on 1 Nov 2025. Click a month to pin a note.` },
      h('div', { class: 'stats' },
        stat('Followers now', fmt.full(now)),
        stat('Gap to goal', fmt.full(fy.goal - now)),
        stat('Needed per month', fmt.full(needed), null, `${monthsLeft} months left`),
        stat('Average so far', fmt.full(avg), null, 'net new per month')),
      SN.charts.line({
        labels: fy.labels, keys: fy.keys, chartId: 'fy-followers', height: 230, legend: true,
        series: [
          { name: 'Actual', color: 'var(--ig)', values: fy.labels.map((_, i) => i < n ? fy.followers[i] : null) },
          { name: 'Goal pace', color: 'var(--moss)', values: pace, dashed: true },
          { name: 'Needed from here', color: 'var(--sand)', values: fromHere, dashed: true }
        ]
      }),
      h('p', { class: 'small muted' }, `Reaching ${fmt.full(fy.goal)} needs about ${(needed / now * 100).toFixed(1)}% growth every month, which is outlier territory. A competition, creator partnerships or paid support would close more of the gap than organic content alone.`));
  };

  SN.cards.fyMonths = function () {
    const fy = SN.data.fy;
    const rows = fy.followers.map((f, i) => ({
      i, label: fy.labels[i], f,
      net: i === 0 ? f - fy.start : f - fy.followers[i - 1],
      reach: fy.reach[i], eng: fy.engagements[i], er: fy.erByReach[i]
    }));
    rows.forEach(r => { r.rate = r.net / (r.f - r.net) * 100; });
    return card({ title: 'Month by month', span: 12, subtitle: 'Net new followers, reach and engagement by reach, with each month\'s top post' },
      table([
        { label: 'Month', render: r => h('b', null, r.label) },
        { label: 'Followers', num: true, render: r => fmt.full(r.f) },
        { label: 'Net new', num: true, render: r => h('span', { class: r.net < 0 ? 'bad' : '' }, (r.net > 0 ? '+' : '') + fmt.full(r.net)) },
        { label: 'Growth', num: true, render: r => h('span', { title: tier(r.rate)[2] }, fmt.pct(r.rate, 2), ' ', chip(tier(r.rate)[1], r.rate >= 2 ? 'approved' : r.rate < 0.5 ? 'declined' : '')) },
        { label: 'Reach', num: true, render: r => r.reach === null ? h('span', { class: 'muted' }, '–') : fmt.num(r.reach) + (fy.partial[r.i] ? '*' : '') },
        { label: 'Engagements', num: true, render: r => fmt.num(r.eng) + (fy.partial[r.i] ? '*' : '') },
        { label: 'Eng. by reach', num: true, render: r => r.er === null ? h('span', { class: 'muted' }, '–') : fmt.pct(r.er, 2) },
        { label: 'Top post', render: r => h('span', { class: 'small' }, fy.giveaway[r.i] ? chip('Giveaway', 'requested') : null, ' ', fy.highlights[r.i]) }
      ], rows),
      h('p', { class: 'small muted' }, '* ', Object.values(fy.partial).join('. '), '. October reach is not in the tracker yet; October engagements are interactions from the monthly report.'));
  };

  SN.cards.benchmarks = function () {
    const fy = SN.data.fy;
    const n = fy.followers.length;
    const last = (fy.followers[n - 1] - fy.followers[n - 2]) / fy.followers[n - 2] * 100;
    const cur = tier(last);
    return card({ title: 'Growth benchmarks', span: 4, subtitle: 'Monthly follower growth rate for an account this size' },
      h('div', { class: 'stat', style: { marginBottom: '10px' } },
        h('div', { class: 'stat-label' }, 'October'),
        h('div', { class: 'stat-value' }, fmt.pct(last, 2), ' ', chip(cur[1], last >= 1 ? 'approved' : 'declined'))),
      table([
        { label: 'Rate', render: t => t.range },
        { label: 'Tier', render: t => h('b', null, t.name) },
        { label: 'What it means', render: t => h('span', { class: 'small muted' }, t.desc) }
      ], TIERS.map((t, i) => ({ range: i === 0 ? '< 0.5%' : t[0] === Infinity ? '5%+' : `${TIERS[i - 1][0]}–${t[0]}%`, name: t[1], desc: t[2] })),
      { rowClass: t => t.name === cur[1] ? 'flagged' : '' }));
  };

  SN.cards.contentVolume = function () {
    const v = SN.data.contentVolume;
    return card({ title: 'Content volume', span: 12, subtitle: 'Instagram pieces per month by format' },
      h('div', { class: 'sentiment-wrap' },
        h('div', null,
          SN.charts.bars({
            labels: v.labels, stacked: true, height: 240,
            series: [
              { name: 'Stories', color: 'var(--lime-ink)', values: v.stories },
              { name: 'Reels', color: 'var(--ig)', values: v.reels },
              { name: 'Video posts', color: 'var(--moss)', values: v.video },
              { name: 'Carousels', color: 'var(--sand)', values: v.carousel },
              { name: 'Images', color: 'var(--sea)', values: v.image }
            ]
          }),
          h('p', { class: 'small muted' }, v.caveat)),
        h('div', { class: 'tiles' }, v.observations.map(([t, d]) => SN.ui.tile('info', t, d)))));
  };
})();
