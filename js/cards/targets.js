/*
 * Business · Monthly targets
 * Editable monthly goals for any metric, with progress and pace. They sit
 * under the 2026 goals on the Strategy page.
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, card, progress, modal, toast } = SN.ui;
  const q = SN.q;

  const METRICS = {
    views: { label: 'Views', get: m => q.account('views', { months: [m] }) },
    interactions: { label: 'Interactions', get: m => q.account('interactions', { months: [m] }) },
    followersGained: { label: 'Followers gained', get: m => q.platforms().reduce((a, pl) => a + SN.data.account[pl].followers[m] - SN.data.account[pl].followers[m - 1], 0) },
    linkTaps: { label: 'Link taps', get: m => q.account('linkTaps', { months: [m] }) },
    posts: { label: 'Posts published', get: m => q.posts({ months: [m] }).length },
    bookings: { label: 'Bookings from social', get: m => q.web('bookings', { months: [m] }) },
    revenue: { label: 'Revenue from social', get: m => q.web('revenue', { months: [m] }), money: true },
    fold: { label: 'The Fold sign-ups', get: m => q.web('fold', { months: [m] }) }
  };

  const DEFAULTS = [
    { id: 't1', metric: 'followersGained', target: 500, goal: 'Instagram followers' },
    { id: 't2', metric: 'linkTaps', target: 600, goal: null },
    { id: 't3', metric: 'bookings', target: 20, goal: null },
    { id: 't4', metric: 'fold', target: 50, goal: null }
  ];

  function targets() { return SN.store.get('targets', DEFAULTS); }
  function save(list) { SN.store.set('targets', list); SN.app.rerender(); }

  function editor(existing) {
    const metric = h('select', null, Object.entries(METRICS).map(([k, v]) => h('option', { value: k, selected: existing && existing.metric === k ? true : null }, v.label)));
    const target = h('input', { type: 'number', min: 0, value: existing ? existing.target : '', required: true });
    const goal = h('select', null, h('option', { value: '' }, 'None'), SN.data.goals.map(g => h('option', { value: g.label, selected: existing && existing.goal === g.label ? true : null }, g.label)));
    const close = modal(existing ? 'Edit monthly target' : 'Add a monthly target', h('form', {
      class: 'form', onsubmit: e => {
        e.preventDefault();
        const list = targets().filter(t => !existing || t.id !== existing.id);
        list.push({ id: existing ? existing.id : 't' + Date.now(), metric: metric.value, target: Number(target.value), goal: goal.value || null });
        save(list); close(); toast('Target saved');
      }
    },
      h('label', null, 'Metric', metric),
      h('label', null, 'Monthly target', target),
      h('label', null, 'Rolls up to 2026 goal', goal),
      h('div', { class: 'form-actions' },
        existing ? h('button', { type: 'button', class: 'btn', onclick: () => { save(targets().filter(t => t.id !== existing.id)); close(); } }, 'Delete') : null,
        h('button', { type: 'submit', class: 'btn primary' }, 'Save'))));
  }

  SN.cards.targets = function () {
    const months = SN.state.period().months;
    const m = months[months.length - 1];
    const monthName = SN.data.MONTHS[m];
    // Pace: share of the month elapsed by the report date (past months are complete)
    const today = new Date(SN.ui.today() + 'T12:00');
    const isCurrent = today.getMonth() === m;
    const elapsed = isCurrent ? today.getDate() / new Date(2026, m + 1, 0).getDate() * 100 : 100;
    return card({ title: 'Monthly targets', span: 4, subtitle: `${monthName} 2026 · rolls up to the 2026 goals`, actions: h('button', { class: 'btn small', onclick: () => editor(null) }, 'Add') },
      targets().map(t => {
        const def = METRICS[t.metric];
        const v = def.get(m);
        const hit = v >= t.target;
        const behind = !hit && v / t.target * 100 < elapsed;
        return h('div', { class: 'goal' },
          h('div', { class: 'goal-top' },
            h('span', { class: 'small' }, def.label, t.goal ? h('span', { class: 'muted' }, ' · ' + t.goal) : null),
            h('button', { class: 'link-btn', onclick: () => editor(t), 'aria-label': 'Edit ' + def.label }, 'Edit')),
          h('div', { class: 'goal-top' },
            h('b', null, def.money ? fmt.gbpFull(v) : fmt.full(v), h('span', { class: 'muted small' }, ' / ' + (def.money ? fmt.gbpFull(t.target) : fmt.full(t.target)))),
            h('span', { class: 'small ' + (hit ? 'good chip live' : behind ? 'bad' : 'muted'), 'data-celebrate': hit ? `target-${t.id}-${m}-${t.target}` : null, role: hit ? 'button' : null, tabindex: hit ? 0 : null }, hit ? 'Hit ✓' : elapsed >= 100 ? `Missed by ${fmt.full(t.target - v)}` : behind ? 'Behind pace' : 'On pace')),
          progress(v, t.target, { pace: elapsed < 100 ? elapsed : undefined, cls: hit ? 'done' : behind ? 'behind' : '' }));
      }));
  };
  SN.cards.targetMetrics = METRICS;
})();
