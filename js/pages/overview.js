/*
 * Overview: the month at a glance.
 * Row 1 headline stats · Row 2 views trend + goal snapshot · Row 3 platform
 * comparison + follower growth · Row 4 top posts · Row 5 search, formats,
 * cadence · Row 6 successes + improvements · Row 7 actions · Row 8 team notes
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, delta, card, stat, table, platformTag, progress } = SN.ui;
  const q = SN.q;

  const MONTH_KEYS = SN.data.MONTHS.slice(0, 10).map((m, i) => `2026-${String(i + 1).padStart(2, '0')}`);


  // Followers are never added across platforms: one tile per platform
  SN.followerStats = function (prev) {
    return q.platforms().map(pl => {
      const v = q.account('followers', { platform: pl });
      const p = prev ? q.account('followers', { platform: pl, months: prev.months }) : null;
      return stat((pl === 'instagram' ? 'Instagram' : 'TikTok') + ' followers', fmt.full(v), delta(v, p));
    });
  };

  function headline() {
    const per = SN.state.period();
    const prev = per.prev ? { months: per.prev } : null;
    const metrics = [
      ['Followers', 'followers'], ['Views', 'views'], ['Interactions', 'interactions'], ['Engagement rate', 'engagementRate'],
      ['Shares', 'shares'], ['Saves', 'saves'], ['Profile visits', 'profileVisits'], ['Link taps', 'linkTaps']
    ];
    return card({ title: 'This period', span: 12, subtitle: per.label + (per.prevLabel ? ` · compared with ${per.prevLabel}` : '') },
      h('div', { class: 'stats' }, SN.followerStats(prev), metrics.filter(([, key]) => key !== 'followers').map(([label, key]) => {
        const v = q.account(key);
        const p = prev ? q.account(key, prev) : null;
        const isRate = key === 'engagementRate';
        return stat(label, isRate ? fmt.pct(v, 2) : fmt.num(v), delta(v, p, { points: isRate }),
          (SN.state.filters.property !== 'all' || per.partial) && !['followers', 'engagementRate'].includes(key) ? 'est.' : null);
      })));
  }

  function viewsTrend() {
    const series = q.platforms().map(pl => ({
      name: pl === 'instagram' ? 'Instagram' : 'TikTok',
      color: pl === 'instagram' ? 'var(--ig)' : 'var(--tt)',
      values: SN.data.MONTHS.slice(0, 10).map((_, m) => q.account('views', { months: [m], platform: pl })),
      area: true
    }));
    return card({ title: 'Views over time', span: 8, subtitle: 'Monthly views, 2026. Click a month to pin a note.' },
      SN.charts.line({ labels: SN.data.MONTHS.slice(0, 10), keys: MONTH_KEYS, series, chartId: 'views-trend', height: 240, legend: true }));
  }

  function goalSnapshot() {
    const goals = SN.data.goals.filter(g => q.platforms().includes(g.platform)).slice(0, 5);
    return card({ title: '2026 goals', span: 4, subtitle: 'Progress to year-end target', actions: h('a', { href: '#/strategy', class: 'link-btn' }, 'All goals') },
      goals.map(g => {
        const done = g.current >= g.target;
        return h('div', { class: 'goal' },
          h('div', { class: 'goal-top' }, h('span', { class: 'small' }, g.label, done ? h('span', { class: 'chip live', style: { marginLeft: '6px' }, 'data-celebrate': 'goal-' + g.id, role: 'button', tabindex: 0 }, 'Reached ✓') : null),
            h('b', null, g.unit === 'pct' ? fmt.pct(g.current, 2) : fmt.num(g.current), h('span', { class: 'muted small' }, ' / ' + (g.unit === 'pct' ? g.target + '%' : fmt.num(g.target))))),
          progress(g.current, g.target, { cls: done ? 'done' : '' }));
      }));
  }

  function platformCompare() {
    const per = SN.state.period();
    const rows = SN.data.PLATFORMS.filter(pl => q.platforms().includes(pl)).map(pl => ({
      pl,
      followers: q.account('followers', { platform: pl }),
      views: q.account('views', { platform: pl }),
      interactions: q.account('interactions', { platform: pl }),
      er: q.account('engagementRate', { platform: pl }),
      erPrev: per.prev ? q.account('engagementRate', { platform: pl, months: per.prev }) : null,
      posts: q.posts({ platform: pl }).length,
      taps: q.account('linkTaps', { platform: pl })
    }));
    return card({ title: 'Platform comparison', span: 6, subtitle: per.label },
      table([
        { label: 'Platform', render: r => platformTag(r.pl) },
        { label: 'Posts', num: true, render: r => r.posts },
        { label: 'Followers', num: true, render: r => fmt.full(r.followers) },
        { label: 'Views', num: true, render: r => fmt.num(r.views) },
        { label: 'Interactions', num: true, render: r => fmt.num(r.interactions) },
        { label: 'Eng. rate', num: true, render: r => h('span', null, fmt.pct(r.er, 2), ' ', delta(r.er, r.erPrev, { points: true })) },
        { label: 'Link taps', num: true, render: r => fmt.num(r.taps) }
      ], rows));
  }

  function followerTrend() {
    const series = q.platforms().map(pl => ({
      name: pl === 'instagram' ? 'Instagram' : 'TikTok',
      color: pl === 'instagram' ? 'var(--ig)' : 'var(--tt)',
      values: SN.data.account[pl].followers.map((v, i) => i === 0 ? null : v - SN.data.account[pl].followers[i - 1])
    }));
    return card({ title: 'Follower growth', span: 6, subtitle: 'New followers per month. Instagram added 651 in October.' },
      SN.charts.line({ labels: SN.data.MONTHS.slice(0, 10), keys: MONTH_KEYS, series, chartId: 'followers-trend', height: 200, legend: true }));
  }

  function topPosts(platform) {
    const list = q.posts({ platform }).filter(p => q.platforms().includes(platform)).sort((a, b) => b.views - a.views).slice(0, 5);
    return card({ title: `Top posts · ${platform === 'instagram' ? 'Instagram' : 'TikTok'}`, span: 6, subtitle: 'By views' },
      table([
        { label: 'Post', render: p => h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
          h('span', { class: 'thumb ' + p.platform }, p.format.slice(0, 4)),
          h('div', null, h('div', null, p.title), h('div', { class: 'muted small' }, fmt.date(p.date) + ' · ' + (p.property || 'Brand-wide') + (p.source !== 'In-house' ? ' · ' + p.source : '')))) },
        { label: 'Views', num: true, render: p => fmt.num(p.views) },
        { label: 'Likes', num: true, render: p => fmt.num(p.likes) },
        { label: 'Shares', num: true, render: p => fmt.num(p.shares) },
        { label: 'Saves', num: true, render: p => fmt.num(p.saves) }
      ], list, { empty: 'No posts for this platform and filter.' }));
  }

  function searchShare() {
    const v = SN.data.account.tiktok.searchShare;
    return card({ title: 'TikTok traffic from search', span: 4, subtitle: 'Share of TikTok views that came from search' },
      h('div', { class: 'stat-value' }, fmt.pct(v[9]), ' ', delta(v[9], v[8], { points: true })),
      SN.charts.line({ labels: SN.data.MONTHS.slice(0, 10), keys: MONTH_KEYS, series: [{ name: 'Search share', color: 'var(--tt)', values: v, area: true }], chartId: 'tt-search', height: 140, yFormat: n => n.toFixed(0) + '%' }),
      h('p', { class: 'small muted' }, 'Third month of growth in a row. Keyword-led hooks and city guides are working.'));
  }

  function formats() {
    const list = q.posts();
    const byFormat = {};
    list.forEach(p => { (byFormat[p.format] = byFormat[p.format] || []).push(p); });
    const labels = Object.keys(byFormat);
    return card({ title: 'Format performance', span: 4, subtitle: 'Median views per post' },
      SN.charts.bars({
        labels, horizontal: true, height: Math.max(120, labels.length * 34), labelWidth: 80,
        series: [{ name: 'Median views', color: 'var(--moss)', values: labels.map(l => median(byFormat[l].map(p => p.views))) }]
      }));
  }

  function cadence() {
    const per = SN.state.period();
    const posts = q.posts();
    const prevPosts = per.prev ? q.posts({ months: per.prev }) : null;
    const weeks = Math.max(1, (new Date(per.to) - new Date(per.from)) / 864e5 + 1) / 7;
    return card({ title: 'Posting cadence', span: 4, subtitle: per.label },
      h('div', { class: 'stats' },
        stat('Posts', fmt.num(posts.length), prevPosts ? delta(posts.length, prevPosts.length) : null),
        stat('Per week', (posts.length / weeks).toFixed(1)),
        stat('Creator & guest', fmt.num(posts.filter(p => p.source === 'Creator' || p.source === 'Guest').length)),
        stat('Agency-made', fmt.num(posts.filter(p => p.source === 'Agency').length))));
  }

  // Which month's insights to show: the chosen one if it's in the range, otherwise the last month
  function insightMonth() {
    const months = SN.state.period().months.filter(m => SN.insights[m]);
    const saved = SN.store.get('insightMonth', null);
    return months.includes(saved) ? saved : months[months.length - 1];
  }

  function monthChooser(m) {
    const months = SN.state.period().months.filter(x => SN.insights[x]);
    if (months.length < 2) return null;
    return h('select', {
      class: 'inline', 'aria-label': 'Month',
      onchange: e => { SN.store.set('insightMonth', Number(e.target.value)); SN.app.rerender(); }
    }, months.map(x => h('option', { value: x, selected: x === m ? true : null }, SN.state.MONTH_NAMES[x])));
  }

  function insightCard(kind) {
    const m = insightMonth();
    const data = SN.insights[m];
    const title = kind === 'successes' ? 'Key successes' : 'Areas for improvement';
    const tileKind = kind === 'successes' ? 'good' : 'fix';
    return card({ title, span: 6, subtitle: `${SN.state.MONTH_NAMES[m]} 2026 · ${data.source}`, actions: monthChooser(m) },
      h('div', { class: 'tiles' }, data[kind].map(([t, d]) => SN.ui.tile(tileKind, t, d))));
  }

  const successes = () => insightCard('successes');
  const improvements = () => insightCard('improvements');

  function actions() {
    const key = 'actions-done';
    const done = SN.store.get(key, {});
    const items = [
      ['Repeat the lamp Reel format across Circular Christmas', 'Soaps and Christmas ornaments'],
      ['Run two competitions to drive follower growth', 'Grand Opera House Belfast w/c 23rd Nov, brand-wide bundle early December'],
      ['Deliver the festive influencer campaign', 'Smaller, niche creators on gifted stays, mid-Nov to Dec'],
      ['Roll out festive and York content', 'Festive Chiswick shoot, York teaser end of Nov, York visit 8th Dec'],
      ['Decide on a Belfast food shoot', 'Or work with @belfastblondefoodie again on the Christmas menu'],
      ['Grow proactive community management', 'Morgan is building the watchlist across Instagram and TikTok'],
      ['Keep building search-led TikTok content', 'City guides per property, real search phrases'],
      ['Organise stays for TikTok influencers', 'Remaining spots outside the festive campaign']
    ];
    return card({ title: 'Actions and plans', span: 12, subtitle: 'Current plan, from the October report. Tick off as they land; saved in this browser.' },
      h('ul', { class: 'list', style: { columns: '2 340px', columnGap: '28px' } }, items.map(([t, d], i) => h('li', { style: { breakInside: 'avoid' } },
        h('input', { type: 'checkbox', id: 'act' + i, checked: done[i] ? true : null, onchange: e => { done[i] = e.target.checked; SN.store.set(key, done); } }),
        h('label', { for: 'act' + i }, h('div', { style: { fontWeight: 500 } }, t), h('div', { class: 'muted small' }, d))))));
  }

  function teamNotes() {
    const notes = SN.notes.all().slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6);
    return card({ title: 'Team notes', span: 12, subtitle: 'Pinned to charts across the dashboard. They also show on the calendar and in reports.' },
      table([
        { label: 'Date', render: n => n.date ? fmt.date(n.date) : '–' },
        { label: 'Chart', render: n => SN.notes.CHART_NAMES[n.chart] || n.chart },
        { label: 'Note', key: 'text' },
        { label: 'By', key: 'author' }
      ], notes, { empty: 'No notes yet. Click any point on a trend chart to pin one.' }));
  }

  function median(arr) {
    if (!arr.length) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  SN.pages.overview = function () {
    return h('div', { class: 'grid' },
      headline(),
      viewsTrend(), goalSnapshot(),
      platformCompare(), followerTrend(),
      SN.state.filters.platform !== 'tiktok' ? topPosts('instagram') : null,
      SN.state.filters.platform !== 'instagram' ? topPosts('tiktok') : null,
      searchShare(), formats(), cadence(),
      successes(), improvements(),
      actions(),
      teamNotes());
  };
  SN.util = Object.assign(SN.util || {}, { median });
})();
