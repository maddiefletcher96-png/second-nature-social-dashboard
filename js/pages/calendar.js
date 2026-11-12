/*
 * Calendar: published and planned posts by day, campaigns as bands across
 * the weeks, and chart notes on the day they refer to.
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, card, modal, chip, stat } = SN.ui;
  const q = SN.q;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function postDetail(p) {
    modal(p.title, h('div', null,
      h('p', { class: 'muted', style: { marginTop: 0 } }, SN.ui.platformTag(p.platform), ' ', p.format, ' · ', fmt.dateLong(p.date), ' · ', p.property || 'Brand-wide'),
      p.planned ? h('p', null, chip('Planned', 'planned'), ' ', p.pillar) : h('div', { class: 'stats' },
        stat('Views', fmt.num(p.views)), stat('Reach', fmt.num(p.reach)), stat('Interactions', fmt.num(p.interactions)),
        stat('Shares', fmt.num(p.shares)), stat('Saves', fmt.num(p.saves)), stat('Link clicks', fmt.num(p.clicks))),
      !p.planned ? h('dl', { class: 'kv', style: { marginTop: '12px' } },
        h('dt', null, 'Pillar'), h('dd', null, p.pillar),
        h('dt', null, 'Care'), h('dd', null, p.care),
        h('dt', null, 'Persona'), h('dd', null, p.persona),
        h('dt', null, 'Series'), h('dd', null, p.series || '–'),
        h('dt', null, 'Made by'), h('dd', null, p.source + (p.paid ? ' · boosted' : ''))) : null));
  }

  function month(year, m) {
    const plats = q.platforms();
    const prop = SN.state.filters.property;
    const keep = p => plats.includes(p.platform) && (prop === 'all' || p.property === prop) && !(SN.state.filters.excludePaid && p.paid);
    const posts = SN.data.posts.concat(SN.data.planned).filter(keep);
    const first = new Date(year, m, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    const last = new Date(year, m + 1, 0);
    const weeks = [];
    const d = new Date(start);
    do {
      const week = [];
      for (let i = 0; i < 7; i++) { week.push(new Date(d)); d.setDate(d.getDate() + 1); }
      weeks.push(week);
    } while (d <= last);
    const notes = SN.notes.between(iso(start), iso(d));
    const today = SN.ui.today();

    return h('div', { class: 'cal' },
      h('div', { class: 'cal-head' }, DAYS.map(x => h('div', null, x))),
      weeks.map(week => {
        const ws = iso(week[0]);
        const we = iso(week[6]);
        const bands = SN.data.campaigns.filter(c => c.start <= we && c.end >= ws);
        return h('div', { class: 'cal-week' },
          bands.length ? h('div', { class: 'cal-bands' }, bands.map(c => {
            const s = Math.max(0, week.findIndex(x => iso(x) >= c.start));
            let e = 6;
            for (let i = 6; i >= 0; i--) { if (iso(week[i]) <= c.end) { e = i; break; } }
            return h('button', {
              class: 'band ' + c.color + (c.start >= ws ? ' starts' : '') + (c.end <= we ? ' ends' : ''),
              style: { gridColumn: `${s + 1} / ${e + 2}` },
              onclick: () => SN.cards.campaignDetail(c), title: c.name
            }, c.start >= ws || s === 0 ? c.name : '');
          })) : null,
          h('div', { class: 'cal-days' }, week.map(day => {
            const key = iso(day);
            const dayPosts = posts.filter(p => p.date === key);
            const dayNotes = notes.filter(n => n.date === key);
            return h('div', { class: 'cal-day' + (day.getMonth() !== m ? ' out' : '') + (key === today ? ' today' : '') },
              h('div', { class: 'cal-num' }, day.getDate()),
              dayNotes.map(n => h('div', { class: 'cal-note', title: `${n.author}: ${n.text}` }, h('i'), n.text)),
              dayPosts.slice(0, 4).map(p => h('button', { class: 'cal-post ' + p.platform + (p.planned ? ' planned' : ''), onclick: () => postDetail(p), title: p.title },
                h('i'), p.title)),
              dayPosts.length > 4 ? h('div', { class: 'muted small' }, `+${dayPosts.length - 4} more`) : null);
          })));
      }));
  }

  SN.pages.calendar = function () {
    const cur = SN.store.get('calMonth', 10);
    const go = n => { SN.store.set('calMonth', Math.max(0, Math.min(11, n))); SN.app.rerender(); };
    const monthPosts = SN.data.posts.concat(SN.data.planned).filter(p => q.monthOf(p.date) === cur && q.platforms().includes(p.platform));
    return h('div', { class: 'grid' },
      card({
        title: `${SN.data.MONTHS[cur]} 2026`, span: 12,
        subtitle: `${monthPosts.filter(p => !p.planned).length} published · ${monthPosts.filter(p => p.planned).length} planned · campaigns as bands · notes in brick`,
        actions: [
          h('button', { class: 'btn small', onclick: () => go(cur - 1), 'aria-label': 'Previous month', disabled: cur === 0 ? true : null }, '‹'),
          h('button', { class: 'btn small', onclick: () => go(10) }, 'This month'),
          h('button', { class: 'btn small', onclick: () => go(cur + 1), 'aria-label': 'Next month', disabled: cur === 11 ? true : null }, '›')
        ]
      },
        h('div', { class: 'legend' },
          h('span', { class: 'lg' }, h('i', { style: { background: 'var(--ig)' } }), 'Instagram'),
          h('span', { class: 'lg' }, h('i', { style: { background: 'var(--tt)' } }), 'TikTok'),
          h('span', { class: 'lg' }, h('i', { style: { border: '1.5px dashed var(--muted)' } }), 'Planned'),
          h('span', { class: 'lg' }, h('i', { style: { background: 'var(--brick)', borderRadius: '50%' } }), 'Chart note')),
        month(2026, cur)));
  };
})();
