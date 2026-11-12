/*
 * DOM, formatting and small UI helpers shared by every page.
 */
window.SN = window.SN || {};

(function () {
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    children.flat(Infinity).forEach(c => {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return el;
  }

  const fmt = {
    num(n) {
      if (n === null || n === undefined || isNaN(n)) return '–';
      const abs = Math.abs(n);
      if (abs >= 1e6) return (n / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
      if (abs >= 1e4) return (n / 1e3).toFixed(abs >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
      return Math.round(n).toLocaleString('en-GB');
    },
    full(n) { return n === null || n === undefined ? '–' : Math.round(n).toLocaleString('en-GB'); },
    pct(n, dp = 1) { return n === null || n === undefined || isNaN(n) ? '–' : n.toFixed(dp) + '%'; },
    gbp(n) { return n === null || n === undefined ? '–' : '£' + fmt.num(n); },
    gbpFull(n) { return '£' + Math.round(n).toLocaleString('en-GB'); },
    date(iso) {
      const d = new Date(iso + (iso.length === 10 ? 'T12:00' : ''));
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    },
    dateLong(iso) {
      const d = new Date(iso + 'T12:00');
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    },
    ago(iso) {
      const now = new Date(SN.data.reportDate + 'T15:00');
      const hrs = Math.max(0, (now - new Date(iso)) / 36e5);
      if (hrs < 1) return 'under 1h';
      if (hrs < 48) return Math.round(hrs) + 'h';
      return Math.round(hrs / 24) + 'd';
    }
  };

  // Change vs previous period. inverse = lower is better
  function delta(curr, prev, opts = {}) {
    if (prev === null || prev === undefined || curr === null || curr === undefined) return null;
    let text;
    let diff;
    if (opts.points) {
      diff = curr - prev;
      text = (diff >= 0 ? '+' : '') + diff.toFixed(1) + 'pt';
    } else {
      if (!prev) return h('span', { class: 'delta flat' }, 'new');
      diff = (curr - prev) / prev * 100;
      const v = Math.abs(diff) >= 1000 ? fmt.num(diff) : Math.abs(diff) >= 100 ? diff.toFixed(0) : diff.toFixed(1);
      text = (diff >= 0 ? '+' : '') + v + '%';
    }
    const good = opts.inverse ? diff < 0 : diff > 0;
    const cls = Math.abs(diff) < 0.05 ? 'flat' : good ? 'up' : 'down';
    return h('span', { class: 'delta ' + cls, title: opts.title || 'vs previous period' }, text);
  }

  // A dashboard card. span = grid columns out of 12
  function card({ title, span = 6, subtitle, actions, id, cls }, ...body) {
    return h('section', { class: 'card span-' + span + (cls ? ' ' + cls : ''), id },
      h('header', { class: 'card-head' },
        h('div', null, h('h2', null, title), subtitle ? h('p', { class: 'card-sub' }, subtitle) : null),
        actions ? h('div', { class: 'card-actions' }, actions) : null),
      h('div', { class: 'card-body' }, body));
  }

  function stat(label, value, deltaEl, hint) {
    return h('div', { class: 'stat' },
      h('div', { class: 'stat-label' }, label),
      h('div', { class: 'stat-value' }, value),
      h('div', { class: 'stat-foot' }, deltaEl, hint ? h('span', { class: 'muted' }, hint) : null));
  }

  function chip(text, kind) { return h('span', { class: 'chip ' + (kind || '') }, text); }

  function platformTag(p) {
    return h('span', { class: 'ptag ' + p }, p === 'instagram' ? 'Instagram' : 'TikTok');
  }

  function segmented(options, value, onChange, cls) {
    return h('div', { class: 'seg ' + (cls || ''), role: 'group' },
      options.map(([val, label]) => h('button', {
        type: 'button', class: val === value ? 'on' : '', 'aria-pressed': String(val === value),
        onclick: () => onChange(val)
      }, label)));
  }

  function table(columns, rows, opts = {}) {
    return h('div', { class: 'table-wrap' },
      h('table', { class: 'tbl ' + (opts.cls || '') },
        h('thead', null, h('tr', null, columns.map(c => h('th', { class: c.num ? 'num' : '' }, c.label)))),
        h('tbody', null, rows.length ? rows.map(r => h('tr', { class: opts.rowClass ? opts.rowClass(r) : '', onclick: opts.onRow ? () => opts.onRow(r) : null },
          columns.map(c => h('td', { class: c.num ? 'num' : '' }, c.render ? c.render(r) : r[c.key]))))
          : h('tr', null, h('td', { colspan: columns.length, class: 'empty' }, opts.empty || 'Nothing in this period.')))));
  }

  function progress(value, max, opts = {}) {
    const pct = Math.max(0, Math.min(100, value / max * 100));
    const marker = opts.pace !== undefined ? h('span', { class: 'pace-mark', style: { left: Math.min(100, opts.pace) + '%' }, title: 'Expected by now' }) : null;
    return h('div', { class: 'progress ' + (opts.cls || '') },
      h('span', { class: 'fill', style: { width: pct + '%' } }), marker);
  }

  // Modal dialog. Returns a close function
  function modal(title, content, opts = {}) {
    const close = () => { back.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    const back = h('div', { class: 'modal-back', onclick: e => { if (e.target === back) close(); } },
      h('div', { class: 'modal ' + (opts.wide ? 'wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('header', null, h('h3', null, title), h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: close }, '×')),
        h('div', { class: 'modal-body' }, content)));
    document.body.appendChild(back);
    document.addEventListener('keydown', esc);
    const first = back.querySelector('input, textarea, select, button');
    if (first) setTimeout(() => first.focus(), 30);
    return close;
  }

  let toastTimer;
  function toast(text) {
    let el = document.getElementById('toast');
    if (!el) { el = h('div', { id: 'toast', role: 'status' }); document.body.appendChild(el); }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function download(filename, text, type = 'text/csv') {
    const blob = new Blob([text], { type });
    const a = h('a', { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function csv(rows) {
    return rows.map(r => r.map(v => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',')).join('\n');
  }

  // Highlight tile: kind = 'good' (tick), 'fix' (arrow) or 'info'
  const TILE_ICON = { good: '✓', fix: '↗', info: 'i' };
  function tile(kind, title, text) {
    return h('div', { class: 'tile ' + kind }, h('span', { class: 'tile-icon', 'aria-hidden': 'true' }, TILE_ICON[kind]), h('div', null, h('h4', null, title), h('p', null, text)));
  }

  const today = () => SN.data.reportDate;

  SN.ui = { h, fmt, delta, card, stat, chip, platformTag, segmented, table, progress, modal, toast, download, csv, tile, today };
})();
