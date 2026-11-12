/*
 * Community page
 * Row 1: Inbox (8) · Recurring questions (4)
 * Row 2: Sentiment (12)
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

(function () {
  const { h, fmt, card, stat, delta, modal, toast, chip } = SN.ui;
  const q = SN.q;

  function handled() { return SN.store.get('handled', {}); }

  function inbox() {
    const done = handled();
    const plats = q.platforms();
    const all = SN.data.inbox.filter(m => plats.includes(m.platform));
    const open = all.filter(m => !done[m.id]).sort((a, b) => a.received.localeCompare(b.received));
    const rs = SN.data.responseStats;
    const last = rs.avgHours.length - 1;
    return card({ title: 'Inbox', span: 8, subtitle: 'Unanswered comments and messages, oldest first' },
      h('div', { class: 'stats' },
        stat('Unanswered', String(open.length), null, `of ${all.length} this week`),
        stat('Avg response time', rs.avgHours[last].toFixed(1) + 'h', delta(rs.avgHours[last], rs.avgHours[last - 1], { inverse: true, title: 'vs last week' })),
        stat('Answered within 24h', rs.within24[last] + '%', delta(rs.within24[last], rs.within24[last - 1], { points: true, title: 'vs last week' }))),
      h('ul', { class: 'list inbox' }, open.length ? open.map(m => {
        const post = m.post ? SN.data.posts.find(p => p.id === m.post) : null;
        const hrs = (new Date(SN.data.reportDate + 'T15:00') - new Date(m.received)) / 36e5;
        return h('li', null,
          h('span', { class: 'thumb ' + (post ? post.platform : 'none'), title: post ? post.title : 'Direct message' }, post ? post.format.slice(0, 4) : 'DM'),
          h('div', { style: { flex: 1, minWidth: 0 } },
            h('div', { class: 'inbox-meta' }, SN.ui.platformTag(m.platform), h('span', { class: 'small muted' }, m.type + ' · ' + m.who),
              post ? h('span', { class: 'small muted ellipsis' }, 'on ' + post.title) : null),
            h('div', null, m.text)),
          h('div', { class: 'inbox-side' },
            h('span', { class: 'waiting ' + (hrs > 24 ? 'late' : '') }, fmt.ago(m.received)),
            h('button', { class: 'btn small', onclick: () => { const d = handled(); d[m.id] = SN.ui.today(); SN.store.set('handled', d); SN.app.rerender(); toast('Marked as handled'); } }, 'Mark as handled')));
      }) : h('li', { class: 'muted' }, 'Inbox clear.')),
      Object.keys(done).length ? h('button', { class: 'link-btn', onclick: () => { SN.store.set('handled', {}); SN.app.rerender(); } }, `Restore ${Object.keys(done).length} handled`) : null);
  }

  function faq() { return SN.store.get('faq', []); }

  function questions() {
    const list = faq();
    const qs = SN.data.questions.slice().sort((a, b) => b.counts[3] - a.counts[3]);
    return card({
      title: 'Recurring questions', span: 4, subtitle: 'Grouped themes, last 4 weeks',
      actions: h('button', { class: 'btn small', onclick: showFaq }, `FAQ list (${list.length})`)
    },
      h('ul', { class: 'list' }, qs.map(t => {
        const total = t.counts.reduce((a, b) => a + b, 0);
        const inFaq = list.some(f => f.theme === t.theme);
        return h('li', { style: { alignItems: 'center' } },
          h('div', { style: { flex: 1 } },
            h('div', null, h('b', null, t.theme), ' ', h('span', { class: 'muted small' }, total + ' asks')),
            h('div', { class: 'muted small' }, t.example)),
          h('div', { style: { width: '54px' } }, SN.charts.spark(t.counts, t.counts[3] > t.counts[2] ? 'var(--clay)' : 'var(--mid-grey)', 26)),
          inFaq ? chip('In FAQ', 'approved') : h('button', {
            class: 'btn small', onclick: () => {
              const l = faq(); l.push({ theme: t.theme, question: t.example, count: total, added: SN.ui.today() });
              SN.store.set('faq', l); SN.app.rerender(); toast('Sent to FAQ list');
            }
          }, 'Send to FAQ'));
      })));
  }

  function showFaq() {
    const list = faq();
    const text = list.map(f => `${f.theme}\nQ: ${f.question}\nA: \n`).join('\n');
    modal('FAQ list for the website', h('div', null,
      list.length ? h('ol', null, list.map(f => h('li', null, h('b', null, f.theme), ': ', f.question, h('span', { class: 'muted small' }, ` (${f.count} asks)`)))) : h('p', { class: 'muted' }, 'Nothing collected yet.'),
      h('div', { class: 'form-actions' },
        list.length ? h('button', { class: 'btn', onclick: () => { SN.store.set('faq', []); SN.app.rerender(); document.querySelector('.modal-back').remove(); } }, 'Clear') : null,
        list.length ? h('button', { class: 'btn primary', onclick: () => SN.ui.download('second-nature-faq.txt', text, 'text/plain') }, 'Download for web team') : null)));
  }

  // Flags the week with the largest swing in positive share
  function sharpChange() {
    const p = SN.data.sentiment.positive;
    let best = null;
    for (let i = 1; i < p.length; i++) {
      const d = p[i] - p[i - 1];
      if (Math.abs(d) >= 10 && (!best || Math.abs(d) > Math.abs(best.d))) best = { i, d };
    }
    return best;
  }

  function sentiment() {
    const s = SN.data.sentiment;
    const change = sharpChange();
    const ex = s.examples;
    return card({ title: 'Sentiment', span: 12, subtitle: 'Share of comments by tone, by week. Click a week to pin a note.' },
      h('div', { class: 'sentiment-wrap' },
        h('div', null, SN.charts.stackedArea({
          labels: s.weeks, chartId: 'sentiment', height: 230,
          series: [
            { name: 'Negative', color: 'var(--brick)', values: s.negative },
            { name: 'Neutral', color: 'var(--mid-grey)', values: s.neutral },
            { name: 'Positive', color: 'var(--lichen)', values: s.positive }
          ]
        }),
        change ? h('p', { class: 'callout', style: { marginTop: '10px' } },
          h('b', null, `Sharp change, week ending ${s.weeks[change.i]}: `),
          `positive share ${change.d > 0 ? 'rose' : 'fell'} ${Math.abs(change.d)} points to ${s.positive[change.i]}%. `,
          SN.notes.forChart('sentiment').some(n => n.key === s.weeks[change.i]) ? 'A team note is pinned to this week.' :
            h('button', { class: 'link-btn', onclick: () => SN.notes.prompt({ chart: 'sentiment', key: s.weeks[change.i], label: s.weeks[change.i] }) }, 'Pin a note')) : null),
        h('div', { class: 'examples' },
          [['Positive', 'lichen', ex.positive], ['Neutral', 'mid-grey', ex.neutral], ['Negative', 'brick', ex.negative]].map(([label, color, items]) =>
            h('div', null,
              h('h3', { class: 'sub-h' }, h('i', { class: 'dot', style: { background: `var(--${color})` } }), label, ' ',
                h('span', { class: 'muted small' }, s[label.toLowerCase()][s.weeks.length - 1] + '% this week')),
              h('ul', { class: 'quotes' }, items.map(t => h('li', null, t))))))));
  }

  SN.pages.community = function () {
    return h('div', { class: 'grid' }, inbox(), questions(), sentiment());
  };
})();
