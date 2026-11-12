/*
 * Strategy: 2026 goals, FY follower tracker, content volume, pillar performance, content goal mix,
 * persona reach and signature series. (Creators & UGC now lives on Partners.)
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, card, table, progress, chip } = SN.ui;
  const q = SN.q;
  const ELAPSED = 10 / 12; // through end of October

  // A reached goal: glows, bursts confetti on first view, click to celebrate again
  function reached(id) {
    const el = chip('Reached ✓', 'live');
    el.dataset.celebrate = 'goal-' + id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    return el;
  }

  function goals() {
    const list = SN.data.goals.filter(g => q.platforms().includes(g.platform));
    return card({ title: '2026 goals', span: 12, subtitle: 'Marker shows where each goal should be by the end of October to land on time' },
      h('div', { class: 'goal-grid' }, list.map(g => {
        const isPct = g.unit === 'pct';
        const expected = g.start + (g.target - g.start) * (g.elapsed || ELAPSED);
        const done = g.current >= g.target;
        const behind = !done && g.current < expected;
        const pacePct = isPct ? null : expected / g.target * 100;
        const status = done ? reached(g.id) : behind ? chip('Behind pace', 'declined') : chip('On pace', 'approved');
        const val = v => isPct ? fmt.pct(v, 2) : fmt.full(v);
        return h('div', { class: 'goal' },
          h('div', { class: 'goal-top' }, h('span', null, h('b', null, g.label), ' ', SN.ui.platformTag(g.platform)), status),
          h('div', { class: 'goal-top' }, h('span', { class: 'stat-value' }, val(g.current)), h('span', { class: 'muted small' }, 'Target ' + val(g.target))),
          progress(g.current, g.target, { pace: pacePct === null ? undefined : pacePct, cls: done ? 'done' : behind ? 'behind' : '' }),
          h('div', { class: 'muted small' }, g.note, !done && !isPct ? ` · ${fmt.full(Math.max(0, g.target - g.current))} to go` : ''));
      })));
  }


  const KPI_LABELS = { saves: 'Saves', shares: 'Shares', profileVisits: 'Profile visits', linkTaps: 'Website clicks', views: 'Views', engagementRate: 'Engagement rate', searchShare: 'Search share' };

  function channels() {
    const per = SN.state.period();
    return card({ title: 'Channel roles', span: 12, subtitle: 'From the social media strategy. KPIs for ' + per.label },
      h('div', { class: 'split' }, q.platforms().map(pl => {
        const c = SN.data.channels[pl];
        return h('div', { class: 'channel' },
          h('div', { class: 'goal-top' }, h('h3', { class: 'channel-role' }, c.role), SN.ui.platformTag(pl)),
          h('p', { class: 'small', style: { margin: '2px 0 10px' } }, h('i', null, '"' + c.takeaway + '"')),
          h('dl', { class: 'kv' },
            h('dt', null, 'Content goal'), h('dd', null, c.goal),
            h('dt', null, 'Tone'), h('dd', null, c.tone),
            h('dt', null, 'Objective'), h('dd', null, c.objective)),
          h('div', { class: 'stats', style: { marginTop: '12px' } }, c.kpis.map(k => {
            const isRate = k === 'engagementRate' || k === 'searchShare';
            const v = q.account(k, { platform: pl });
            const p = per.prev ? q.account(k, { platform: pl, months: per.prev }) : null;
            return SN.ui.stat(KPI_LABELS[k], isRate ? fmt.pct(v, isRate && k === 'engagementRate' ? 2 : 1) : fmt.num(v), SN.ui.delta(v, p, { points: isRate }));
          })));
      })));
  }

  function groupBy(list, key) {
    const out = {};
    list.forEach(p => { const k = p[key]; if (!k) return; (out[k] = out[k] || []).push(p); });
    return out;
  }

  function pillars() {
    const per = SN.state.period();
    const groups = groupBy(q.posts(), 'pillar');
    const prev = per.prev ? groupBy(q.posts({ months: per.prev }), 'pillar') : {};
    const rows = SN.data.PILLARS.map(name => {
      const list = groups[name] || [];
      const pl = prev[name] || [];
      return {
        name, posts: list.length, reach: q.sum(list, 'reach'), er: q.engagementRate(list),
        avgViews: list.length ? q.sum(list, 'views') / list.length : 0, saves: q.sum(list, 'saves') + q.sum(list, 'shares'),
        prevEr: pl.length ? q.engagementRate(pl) : null
      };
    });
    return card({ title: 'Pillar performance', span: 8, subtitle: per.label },
      table([
        { label: 'Pillar', key: 'name' },
        { label: 'Posts', num: true, render: r => r.posts },
        { label: 'Reach', num: true, render: r => fmt.num(r.reach) },
        { label: 'Avg views', num: true, render: r => fmt.num(r.avgViews) },
        { label: 'Saves + shares', num: true, render: r => fmt.num(r.saves) },
        { label: 'Eng. rate', num: true, render: r => h('span', null, fmt.pct(r.er), ' ', SN.ui.delta(r.er, r.prevEr, { points: true })) }
      ], rows));
  }

  function goalMix() {
    const groups = groupBy(q.posts(), 'goal');
    const planned = { Inspire: 35, Connect: 25, Promote: 15, Inform: 25 };
    const total = q.posts().length || 1;
    return card({ title: 'Content goal mix', span: 4, subtitle: 'Share of posts, actual vs planned mix' },
      SN.charts.bars({
        labels: SN.data.GOALS, horizontal: true, height: 170, labelWidth: 96, yFormat: v => v.toFixed(0) + '%',
        series: [
          { name: 'Actual', color: 'var(--moss)', values: SN.data.GOALS.map(g => (groups[g] || []).length / total * 100) },
          { name: 'Planned', color: 'var(--sand)', values: SN.data.GOALS.map(g => planned[g]) }
        ]
      }));
  }

  function personas() {
    const groups = groupBy(q.posts(), 'persona');
    const plats = q.platforms();
    return card({ title: 'Persona reach', span: 12, subtitle: 'Reach of posts aimed at each persona, by platform' },
      SN.charts.bars({
        labels: SN.data.PERSONAS, horizontal: true, stacked: true, height: 200, labelWidth: 170,
        series: plats.map(pl => ({
          name: pl === 'instagram' ? 'Instagram' : 'TikTok', color: pl === 'instagram' ? 'var(--ig)' : 'var(--tt)',
          values: SN.data.PERSONAS.map(p => q.sum((groups[p] || []).filter(x => x.platform === pl), 'reach'))
        }))
      }));
  }

  function series() {
    const all = q.posts({ months: SN.state.period().months });
    const groups = groupBy(all, 'series');
    const acctAvg = all.length ? q.sum(all, 'views') / all.length : 0;
    const rows = SN.data.SERIES.map(name => {
      const list = groups[name] || [];
      const best = list.slice().sort((a, b) => b.views - a.views)[0];
      return {
        name, posts: list.length, views: q.sum(list, 'views'), avg: list.length ? q.sum(list, 'views') / list.length : 0,
        er: q.engagementRate(list), best
      };
    });
    return card({ title: 'Signature series', span: 12, subtitle: 'Recurring formats compared with the account average of ' + fmt.num(acctAvg) + ' views per post' },
      table([
        { label: 'Series', render: r => h('b', null, r.name) },
        { label: 'Posts', num: true, render: r => r.posts },
        { label: 'Total views', num: true, render: r => fmt.num(r.views) },
        { label: 'Avg views', num: true, render: r => fmt.num(r.avg) },
        { label: 'vs account avg', num: true, render: r => r.posts ? h('span', { class: 'delta ' + (r.avg >= acctAvg ? 'up' : 'down') }, (r.avg / (acctAvg || 1)).toFixed(1) + '×') : '–' },
        { label: 'Eng. rate', num: true, render: r => fmt.pct(r.er) },
        { label: 'Top post', render: r => r.best ? h('span', { class: 'small' }, r.best.title) : h('span', { class: 'muted' }, '–') }
      ], rows),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, 'Creators and guest content now sit on the Partners page.'));
  }

  SN.pages.strategy = function () {
    return h('div', { class: 'grid' },
      goals(),
      channels(),
      SN.cards.fyTracker(), SN.cards.benchmarks(),
      SN.cards.fyMonths(),
      SN.cards.contentVolume(),
      pillars(), goalMix(),
      personas(),
      series());
  };
})();
