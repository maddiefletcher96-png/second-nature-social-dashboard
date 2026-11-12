/*
 * Header date picker: pick one month, a run of months (click a first and
 * last month), a quick range, or exact dates on the calendar.
 * Nothing changes until Apply, so the dashboard doesn't re-render mid-pick.
 */
window.SN = window.SN || {};

(function () {
  const { h } = SN.ui;
  const S = () => SN.state;
  const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();

  let open = false;
  let draft = null;     // { from, to }
  let anchor = null;    // first click of a two-click range (month or day)
  let view = null;      // month shown in the calendar
  let root = null;

  function close() {
    open = false;
    anchor = null;
    document.removeEventListener('mousedown', outside);
    document.removeEventListener('keydown', esc);
    render();
  }
  function outside(e) { if (root && !root.contains(e.target)) close(); }
  function esc(e) { if (e.key === 'Escape') close(); }

  function toggle() {
    if (open) return close();
    open = true;
    draft = { from: S().filters.from, to: S().filters.to };
    anchor = null;
    view = Number(draft.to.slice(5, 7)) - 1;
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', esc);
    render();
  }

  function pickMonth(m) {
    const from = iso(2026, m, 1);
    const to = iso(2026, m, lastDay(2026, m));
    if (anchor && anchor.type === 'month') {
      const a = anchor.m;
      draft = a <= m ? { from: iso(2026, a, 1), to } : { from, to: iso(2026, a, lastDay(2026, a)) };
      anchor = null;
    } else {
      draft = { from, to };
      anchor = { type: 'month', m };
    }
    view = m;
    render();
  }

  function pickDay(day) {
    if (day < S().DATA_START || day > S().DATA_END) return;
    if (anchor && anchor.type === 'day') {
      draft = anchor.day <= day ? { from: anchor.day, to: day } : { from: day, to: anchor.day };
      anchor = null;
    } else {
      draft = { from: day, to: day };
      anchor = { type: 'day', day };
    }
    render();
  }

  function monthGrid() {
    const sel = m => {
      const f = iso(2026, m, 1);
      const t = iso(2026, m, lastDay(2026, m));
      return draft.from <= f && draft.to >= t ? 'on' : draft.from <= t && draft.to >= f ? 'part' : '';
    };
    return h('div', { class: 'dp-months' }, S().MONTH_NAMES.map((name, m) => {
      const disabled = m > 9;
      return h('button', {
        type: 'button', class: 'dp-month ' + sel(m), disabled: disabled ? true : null,
        title: disabled ? 'No data yet' : null, onclick: () => pickMonth(m)
      }, name.slice(0, 3));
    }));
  }

  function calendar() {
    const y = 2026;
    const m = view;
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(h('span'));
    for (let d = 1; d <= lastDay(y, m); d++) {
      const day = iso(y, m, d);
      const outOfData = day < S().DATA_START || day > S().DATA_END;
      const inRange = day >= draft.from && day <= draft.to;
      const edge = day === draft.from || day === draft.to;
      cells.push(h('button', {
        type: 'button', class: 'dp-day' + (inRange ? ' in' : '') + (edge ? ' edge' : '') + (outOfData ? ' off' : ''),
        disabled: outOfData ? true : null, onclick: () => pickDay(day), 'aria-label': day
      }, d));
    }
    return h('div', { class: 'dp-cal' },
      h('div', { class: 'dp-cal-head' },
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Previous month', disabled: m === 0 ? true : null, onclick: () => { view = m - 1; render(); } }, '‹'),
        h('b', null, `${S().MONTH_NAMES[m]} ${y}`),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Next month', disabled: m === 11 ? true : null, onclick: () => { view = m + 1; render(); } }, '›')),
      h('div', { class: 'dp-grid' }, DOW.map(d => h('span', { class: 'dp-dow' }, d)), cells));
  }

  function panel() {
    const from = h('input', { type: 'date', value: draft.from, min: S().DATA_START, max: S().DATA_END, 'aria-label': 'From',
      onchange: e => { if (e.target.value) { draft.from = e.target.value; if (draft.to < draft.from) draft.to = draft.from; anchor = null; render(); } } });
    const to = h('input', { type: 'date', value: draft.to, min: S().DATA_START, max: S().DATA_END, 'aria-label': 'To',
      onchange: e => { if (e.target.value) { draft.to = e.target.value; if (draft.to < draft.from) draft.from = draft.to; anchor = null; render(); } } });
    return h('div', { class: 'dp-panel', role: 'dialog', 'aria-label': 'Choose dates' },
      h('div', { class: 'dp-section' },
        h('div', { class: 'dp-title' }, 'Months', h('span', { class: 'muted small' }, anchor && anchor.type === 'month' ? ' · now click the last month' : ' · click one, or a first and last month')),
        monthGrid()),
      h('div', { class: 'dp-presets' }, Object.values(S().PRESETS).map(p => h('button', {
        type: 'button', class: 'chip' + (draft.from === p.from && draft.to === p.to ? ' live' : ''),
        onclick: () => { draft = { from: p.from, to: p.to }; anchor = null; view = Number(p.to.slice(5, 7)) - 1; render(); }
      }, p.label))),
      h('div', { class: 'dp-section' },
        h('div', { class: 'dp-title' }, 'Dates', h('span', { class: 'muted small' }, anchor && anchor.type === 'day' ? ' · now click the end date' : ' · click a start and end date')),
        calendar(),
        h('div', { class: 'dp-inputs' }, h('label', null, 'From', from), h('label', null, 'To', to))),
      h('div', { class: 'dp-foot' },
        h('span', { class: 'small muted' }, S().labelFor(draft.from, draft.to)),
        h('button', { type: 'button', class: 'btn small', onclick: close }, 'Cancel'),
        h('button', { type: 'button', class: 'btn small primary', onclick: () => { const d = draft; close(); S().setRange(d.from, d.to); } }, 'Apply')));
  }

  function render() {
    if (!root) return;
    root.innerHTML = '';
    const per = S().period();
    root.appendChild(h('button', {
      type: 'button', class: 'dp-trigger' + (open ? ' open' : ''), 'aria-haspopup': 'dialog', 'aria-expanded': String(open), onclick: toggle
    },
      h('span', { class: 'dp-icon', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>' }),
      per.label, h('span', { class: 'dp-caret', 'aria-hidden': 'true' }, '▾')));
    if (open) root.appendChild(panel());
  }

  SN.datePicker = function () {
    root = h('div', { class: 'dp' });
    render();
    // A div, not a label: clicks inside a label would re-trigger the button
    return h('div', { class: 'dp-wrap' }, h('span', null, 'Dates'), root);
  };
})();
