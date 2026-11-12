/*
 * Business · Five Cares mix
 * Posts tagged by Care (People, Place, Planet, Progress, Purpose), an optional
 * tag that sits alongside the strategy pillars.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, card, table } = SN.ui;
  const q = SN.q;
  const COLORS = { People: 'var(--sea)', Place: 'var(--sand)', Planet: 'var(--lichen)', Progress: 'var(--clay)', Purpose: 'var(--brick)' };
  const icon = care => h('img', { class: 'care-icon', src: `assets/cares/${care.toLowerCase()}.svg`, alt: '' });

  SN.cards.cares = function () {
    const posts = q.posts();
    const plats = q.platforms();
    const labels = plats.map(p => p === 'instagram' ? 'Instagram' : 'TikTok');
    const rows = SN.data.CARES.map(c => {
      const list = posts.filter(p => p.care === c);
      return { care: c, posts: list.length, reach: q.sum(list, 'reach'), er: q.engagementRate(list) };
    });
    const best = rows.slice().sort((a, b) => b.er - a.er)[0];
    return card({ title: 'Five Cares mix', span: 4, subtitle: 'Share of posts by Care, ' + SN.state.period().label },
      SN.charts.bars({
        labels, horizontal: true, percent: true, height: 34 + plats.length * 36, labelWidth: 74,
        series: SN.data.CARES.map(c => ({ name: c, color: COLORS[c], values: plats.map(pl => posts.filter(p => p.platform === pl && p.care === c).length) }))
      }),
      table([
        { label: 'Care', render: r => h('span', { class: 'care-cell' }, h('i', { class: 'dot', style: { background: COLORS[r.care] } }), icon(r.care), r.care) },
        { label: 'Posts', num: true, render: r => r.posts },
        { label: 'Reach', num: true, render: r => fmt.num(r.reach) },
        { label: 'Eng.', num: true, render: r => fmt.pct(r.er) }
      ], rows),
      best && best.posts ? h('p', { class: 'small muted' }, `Care for ${best.care} posts had the highest engagement rate this period.`) : null);
  };
  SN.cards.CARE_COLORS = COLORS;
  SN.cards.careIcon = icon;
})();
