/*
 * Partners page
 * Row 1: Agency scorecard, Stay the Night (6) · Creator, PR & guest content (6)
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, card, table, stat, chip, toast, segmented, progress } = SN.ui;
  const q = SN.q;
  const KINDS = ['posts', 'reels', 'stories', 'reports'];

  // Saved edits layered over the sample agency months
  function agencyMonth(m) {
    const base = SN.data.agency.months.find(x => x.month === m) ||
      { month: m, contracted: { posts: 8, reels: 4, stories: 12, reports: 1 }, delivered: { posts: 0, reels: 0, stories: 0, reports: 0 }, onTime: 0 };
    const edits = SN.store.get('agency', {})[m] || {};
    return {
      month: m,
      contracted: Object.assign({}, base.contracted, edits.contracted),
      delivered: Object.assign({}, base.delivered, edits.delivered),
      onTime: edits.onTime !== undefined ? edits.onTime : base.onTime,
      notes: edits.notes || ''
    };
  }
  function saveAgency(m, patch) {
    const all = SN.store.get('agency', {});
    const cur = all[m] || {};
    Object.keys(patch).forEach(k => {
      cur[k] = typeof patch[k] === 'object' ? Object.assign({}, cur[k], patch[k]) : patch[k];
    });
    all[m] = cur;
    SN.store.set('agency', all);
  }

  function scoreFor(m) {
    const a = agencyMonth(m);
    const contracted = KINDS.reduce((s, k) => s + Number(a.contracted[k] || 0), 0);
    const delivered = KINDS.reduce((s, k) => s + Math.min(Number(a.delivered[k] || 0), Number(a.contracted[k] || 0)), 0);
    const delivery = contracted ? delivered / contracted * 100 : 0;
    const posts = q.posts({ months: [m] });
    const agencyPosts = posts.filter(p => p.source === 'Agency');
    const avg = list => list.length ? q.sum(list, 'views') / list.length : 0;
    // Median-style comparison: drop the single largest post so one viral Reel doesn't skew the account average
    const trimmed = posts.slice().sort((x, y) => y.views - x.views).slice(1);
    const perf = avg(trimmed) ? avg(agencyPosts) / avg(trimmed) * 100 : 0;
    const erAgency = q.engagementRate(agencyPosts);
    const erAll = q.engagementRate(trimmed);
    const score = Math.round(delivery * 0.5 + a.onTime * 0.25 + Math.min(perf, 120) / 120 * 100 * 0.25);
    return { a, contracted, delivered, delivery, perf, erAgency, erAll, agencyPosts, score };
  }

  function exportScorecard() {
    const rows = [['Month', 'Contracted', 'Delivered', 'Delivery %', 'On time %', 'Agency avg views vs account', 'Agency eng. rate', 'Account eng. rate', 'Score', 'Notes']];
    [7, 8, 9].forEach(m => {
      const s = scoreFor(m);
      rows.push([SN.data.MONTHS[m] + ' 2026', s.contracted, s.delivered, s.delivery.toFixed(0), s.a.onTime, s.perf.toFixed(0) + '%', s.erAgency.toFixed(2), s.erAll.toFixed(2), s.score, s.a.notes]);
    });
    SN.ui.download('stay-the-night-scorecard.csv', SN.ui.csv(rows));
    toast('Scorecard exported');
  }

  function agency() {
    const m = SN.store.get('agencyMonth', 9);
    const s = scoreFor(m);
    const numIn = (kind, field) => h('input', {
      type: 'number', min: 0, class: 'inline num-in', value: s.a[field][kind], 'aria-label': `${field} ${kind}`,
      onchange: e => { saveAgency(m, { [field]: { [kind]: Number(e.target.value) } }); SN.app.rerender(); }
    });
    return card({
      title: 'Agency scorecard · Stay the Night', span: 6, subtitle: 'Contracted vs delivered, entered by the team each month',
      actions: [
        segmented([[7, 'Aug'], [8, 'Sep'], [9, 'Oct']], m, v => { SN.store.set('agencyMonth', v); SN.app.rerender(); }),
        h('button', { class: 'btn small', onclick: exportScorecard }, 'Export')
      ]
    },
      h('div', { class: 'stats' },
        stat('Monthly score', h('span', null, s.score, h('span', { class: 'muted small' }, ' / 100'))),
        stat('Delivered', `${s.delivered} of ${s.contracted}`),
        stat('On time', h('span', null, h('input', {
          type: 'number', min: 0, max: 100, class: 'inline num-in', value: s.a.onTime, 'aria-label': 'On time percent',
          onchange: e => { saveAgency(m, { onTime: Number(e.target.value) }); SN.app.rerender(); }
        }), '%')),
        stat('Avg views vs account', fmt.pct(s.perf, 0), null, s.agencyPosts.length + ' agency posts')),
      table([
        { label: 'Deliverable', render: r => r[0].toUpperCase() + r.slice(1) },
        { label: 'Contracted', num: true, render: r => numIn(r, 'contracted') },
        { label: 'Delivered', num: true, render: r => numIn(r, 'delivered') },
        { label: '', render: r => progress(Number(s.a.delivered[r]), Math.max(1, Number(s.a.contracted[r])), { cls: Number(s.a.delivered[r]) >= Number(s.a.contracted[r]) ? 'done' : 'behind' }) }
      ], KINDS),
      h('p', { class: 'small muted' }, `Engagement rate on agency posts ${fmt.pct(s.erAgency, 2)} vs ${fmt.pct(s.erAll, 2)} account average (largest post excluded so one viral Reel doesn't skew it). Score = 50% delivery, 25% on time, 25% performance.`),
      h('label', { class: 'form', style: { marginTop: '8px' } }, h('span', { class: 'small' }, 'Notes for the agency review'),
        h('textarea', { rows: 3, placeholder: 'What went well, what to change next month', onchange: e => { saveAgency(m, { notes: e.target.value }); toast('Notes saved'); } }, s.a.notes)));
  }

  // ---------------------------------------------------------------
  function creatorsTab() {
    const list = SN.data.creators.filter(c => q.platforms().includes(c.platform));
    const done = SN.data.creatorsCompleteEarlier + SN.data.creators.filter(c => c.status === 'Complete' && c.date >= '2026-01-01').length;
    const confirmed = SN.data.creators.filter(c => c.status === 'Confirmed').length;
    const total = SN.data.goals.find(g => g.id === 'collabs').current;
    return h('div', null,
      h('div', { class: 'goal' },
        h('div', { class: 'goal-top' }, h('span', null, 'Collaborations against the 2026 target'), h('b', null, total, h('span', { class: 'muted small' }, ' / 25'))),
        progress(total, 25, { pace: 25 * 10 / 12 / 25 * 100, cls: total < 25 * 10 / 12 ? 'behind' : '' }),
        h('div', { class: 'muted small' }, `${done} complete, ${confirmed} confirmed for the festive campaign`)),
      table([
        { label: 'Creator', render: c => h('div', null, h('div', null, c.name), h('div', { class: 'muted small' }, c.handle + ' · ' + c.type)) },
        { label: 'Date', render: c => fmt.date(c.date) },
        { label: 'Status', render: c => chip(c.status, c.status === 'Complete' ? 'complete' : 'live') },
        { label: 'Reach', num: true, render: c => c.reach === null ? '–' : fmt.num(c.reach) },
        { label: 'Saves / shares', num: true, render: c => c.saves === null ? '–' : `${fmt.num(c.saves)} / ${fmt.num(c.shares)}` },
        { label: 'Cost', num: true, render: c => c.cost ? fmt.gbpFull(c.cost) : 'Gifted' }
      ], list));
  }

  function prTab() {
    return h('div', null,
      h('div', { class: 'stats', style: { marginBottom: '12px' } },
        stat('Pieces of content', fmt.num(SN.data.prStays.reduce((a, p) => a + p.pieces, 0))),
        stat('Reach', fmt.num(SN.data.prStays.reduce((a, p) => a + p.reach, 0))),
        stat('Engagement', fmt.num(SN.data.prStays.reduce((a, p) => a + p.engagement, 0)))),
      table([
        { label: 'Stay or activity', key: 'outlet' },
        { label: 'Date', render: p => fmt.date(p.date) },
        { label: 'Pieces', num: true, key: 'pieces' },
        { label: 'Reach', num: true, render: p => fmt.num(p.reach) },
        { label: 'Eng.', num: true, render: p => fmt.num(p.engagement) }
      ], SN.data.prStays));
  }

  function guestTab() {
    const statuses = SN.store.get('reshare', {});
    const prop = SN.state.filters.property;
    const list = SN.data.guestContent.filter(g => prop === 'all' || g.property === prop);
    const STATUS = ['Requested', 'Approved', 'Declined', 'Reshared'];
    return h('div', null,
      h('p', { class: 'small muted', style: { marginTop: 0 } }, 'Posts where guests tagged the account. Only reshare once permission is Approved.'),
      table([
        { label: 'Guest', render: g => h('div', null, h('div', null, g.handle), h('div', { class: 'muted small' }, g.desc)) },
        { label: 'Property', key: 'property' },
        { label: 'Date', render: g => fmt.date(g.date) },
        { label: 'Permission', render: g => {
          const v = statuses[g.id] || g.status;
          return h('select', {
            class: 'inline chip-select ' + v.toLowerCase(), 'aria-label': 'Reshare permission for ' + g.handle,
            onchange: e => { statuses[g.id] = e.target.value; SN.store.set('reshare', statuses); SN.app.rerender(); }
          }, STATUS.map(s => h('option', { value: s, selected: s === v ? true : null }, s)));
        } }
      ], list));
  }

  function creatorContent() {
    const tab = SN.store.get('partnerTab', 'creators');
    const tabs = [['creators', 'Creators'], ['pr', 'PR stays'], ['guest', 'Guest content']];
    return card({ title: 'Creator, PR & guest content', span: 6 },
      h('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, l]) => h('button', {
        role: 'tab', 'aria-selected': String(tab === k), class: tab === k ? 'on' : '',
        onclick: () => { SN.store.set('partnerTab', k); SN.app.rerender(); }
      }, l))),
      tab === 'creators' ? creatorsTab() : tab === 'pr' ? prTab() : guestTab());
  }

  SN.pages.partners = function () {
    return h('div', { class: 'grid' }, agency(), creatorContent());
  };
  SN.partners = { scoreFor };
})();
