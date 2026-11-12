/*
 * Chart notes. Anyone can pin a note to a point on a chart. Notes show as
 * dots on that chart, appear on the calendar and carry into the report.
 * Saved in this browser until a shared backend is connected.
 */
window.SN = window.SN || {};

(function () {
  const { h, modal, toast } = SN.ui;

  const CHART_NAMES = {
    'views-trend': 'Views over time',
    'fy-followers': 'FY follower tracker',
    'followers-trend': 'Follower growth',
    'sentiment': 'Sentiment',
    'tt-search': 'TikTok search share',
    'response-time': 'Response time'
  };

  function all() {
    const saved = SN.store.get('notes', null);
    return saved === null ? SN.data.defaultNotes.slice() : saved;
  }
  function save(list) { SN.store.set('notes', list); SN.state.emit(); }

  function forChart(chart) { return all().filter(n => n.chart === chart); }

  // Notes with a date inside the given ISO range, for the calendar and report
  function between(from, to) {
    return all().filter(n => n.date && n.date >= from && n.date <= to);
  }

  function remove(id) { save(all().filter(n => n.id !== id)); }

  function prompt({ chart, key, label, date }) {
    const author = h('input', { type: 'text', value: SN.store.get('author', ''), placeholder: 'Your name', 'aria-label': 'Your name', required: true });
    const text = h('textarea', { rows: 3, placeholder: 'e.g. Belfast Christmas market reel', 'aria-label': 'Note' });
    const dateIn = h('input', { type: 'date', value: date || defaultDate(key), 'aria-label': 'Date for the calendar' });
    const existing = forChart(chart).filter(n => n.key === key);
    const close = modal(`Pin a note: ${CHART_NAMES[chart] || chart}, ${label}`, h('form', {
      class: 'form', onsubmit: e => {
        e.preventDefault();
        if (!text.value.trim()) return;
        SN.store.set('author', author.value.trim());
        const list = all();
        list.push({ id: 'n' + Date.now(), chart, key, label, text: text.value.trim(), author: author.value.trim() || 'Team', created: SN.ui.today(), date: dateIn.value || null });
        save(list);
        close();
        toast('Note pinned');
      }
    },
      existing.length ? h('ul', { class: 'note-list' }, existing.map(n => h('li', null,
        h('b', null, n.author), ' ', n.text,
        h('button', { type: 'button', class: 'link-btn', onclick: () => { remove(n.id); close(); toast('Note removed'); } }, 'Remove')))) : null,
      h('label', null, 'Name', author),
      h('label', null, 'Note', text),
      h('label', null, 'Show on calendar', dateIn),
      h('div', { class: 'form-actions' }, h('button', { class: 'btn primary', type: 'submit' }, 'Pin note'))));
  }

  // Keys are either YYYY-MM or a sentiment week label like "26 Oct"
  function defaultDate(key) {
    if (/^\d{4}-\d{2}$/.test(key)) return key + '-01';
    const m = /^(\d+) (\w{3})$/.exec(key || '');
    if (m) {
      const idx = SN.data.MONTHS.indexOf(m[2]);
      return `2026-${String(idx + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return SN.ui.today();
  }

  SN.notes = { all, forChart, between, prompt, remove, CHART_NAMES };
})();
