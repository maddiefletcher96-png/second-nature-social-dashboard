/*
 * Lightweight SVG charts: line, stacked area, bars, sparkline.
 * No library needed, so the dashboard opens straight from index.html.
 * Charts with a chartId show team notes as dots and let anyone pin a new one.
 */
window.SN = window.SN || {};

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const { h, fmt } = SN.ui;

  function s(tag, attrs, ...children) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    children.flat().forEach(c => c && el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  }

  // Shared tooltip
  let tip;
  function showTip(evt, html) {
    if (!tip) { tip = h('div', { class: 'chart-tip', role: 'tooltip' }); document.body.appendChild(tip); }
    tip.innerHTML = html;
    tip.style.display = 'block';
    const pad = 14;
    const w = tip.offsetWidth;
    let x = evt.clientX + pad;
    if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
    tip.style.left = x + 'px';
    tip.style.top = Math.max(8, evt.clientY - tip.offsetHeight - 10) + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  // Draws into a wrapper and redraws when its width changes
  function mount(height, draw, cls) {
    const wrap = h('div', { class: 'chart ' + (cls || ''), style: { height: height + 'px' } });
    let lastW = 0;
    const render = () => {
      const w = Math.floor(wrap.clientWidth);
      if (!w || w === lastW) return;
      // Build-in animation on the first draw only, not on every resize
      if (!lastW && !(SN.motion && SN.motion.reduced())) {
        wrap.classList.add('chart-anim');
        setTimeout(() => wrap.classList.remove('chart-anim'), 2000);
      }
      lastW = w;
      wrap.innerHTML = '';
      wrap.appendChild(draw(w, height));
    };
    if (window.ResizeObserver) new ResizeObserver(render).observe(wrap);
    requestAnimationFrame(render);
    return wrap;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * p;
  }

  function legend(series) {
    return h('div', { class: 'legend' }, series.map(sr =>
      h('span', { class: 'lg' }, h('i', { style: { background: sr.color } }), sr.name)));
  }

  // Note dots + click-to-pin along the x axis
  function noteLayer(g, opts, xs, top, bottom, bandW) {
    if (!opts.chartId || !SN.notes) return;
    const notes = SN.notes.forChart(opts.chartId);
    opts.keys.forEach((key, i) => {
      const x = xs[i];
      g.appendChild(s('rect', {
        x: x - bandW / 2, y: top, width: bandW, height: bottom - top, class: 'note-hit',
        onclick: () => SN.notes.prompt({ chart: opts.chartId, key, label: opts.labels[i], date: opts.dates ? opts.dates[i] : null })
      }));
      const these = notes.filter(n => n.key === key);
      if (these.length) {
        const dot = s('circle', { cx: x, cy: top + 4, r: 5, class: 'note-dot', tabindex: 0 });
        const html = these.map(n => `<b>${n.author}</b> ${escapeHtml(n.text)}`).join('<br>');
        dot.addEventListener('mousemove', e => showTip(e, '<div class="tip-note">' + html + '</div>'));
        dot.addEventListener('mouseleave', hideTip);
        dot.addEventListener('focus', e => { const r = dot.getBoundingClientRect(); showTip({ clientX: r.right, clientY: r.top }, html); });
        dot.addEventListener('blur', hideTip);
        g.appendChild(s('line', { x1: x, x2: x, y1: top + 9, y2: bottom, class: 'note-line' }));
        g.appendChild(dot);
      }
    });
  }

  function escapeHtml(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // ---------------------------------------------------------------
  // Line chart
  // opts: labels, keys, series [{name,color,values}], height, yFormat, chartId
  // ---------------------------------------------------------------
  function line(opts) {
    const height = opts.height || 220;
    const yFormat = opts.yFormat || fmt.num;
    opts.keys = opts.keys || opts.labels;
    const chart = mount(height, (W, H) => {
      const m = { t: 16, r: 12, b: 26, l: 44 };
      const iw = W - m.l - m.r;
      const ih = H - m.t - m.b;
      const max = niceMax(Math.max(...opts.series.flatMap(sr => sr.values.filter(v => v !== null))) * 1.05);
      const n = opts.labels.length;
      const xs = opts.labels.map((_, i) => m.l + (n === 1 ? iw / 2 : i * iw / (n - 1)));
      const y = v => m.t + ih - v / max * ih;
      const svg = s('svg', { width: W, height: H, role: 'img', 'aria-label': opts.aria || 'Line chart' });
      const g = s('g');
      for (let i = 0; i <= 4; i++) {
        const v = max * i / 4;
        g.appendChild(s('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'grid' }));
        g.appendChild(s('text', { x: m.l - 8, y: y(v) + 4, class: 'axis', 'text-anchor': 'end' }, yFormat(v)));
      }
      const step = Math.ceil(n / Math.max(2, Math.floor(iw / 56)));
      opts.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) g.appendChild(s('text', { x: xs[i], y: H - 8, class: 'axis', 'text-anchor': 'middle' }, l)); });
      noteLayer(g, opts, xs, m.t, m.t + ih, n > 1 ? iw / (n - 1) : iw);
      opts.series.forEach(sr => {
        const pts = sr.values.map((v, i) => v === null ? null : [xs[i], y(v)]).filter(Boolean);
        if (sr.area) {
          g.appendChild(s('path', { d: `M${pts[0][0]},${m.t + ih} ` + pts.map(p => `L${p[0]},${p[1]}`).join(' ') + ` L${pts[pts.length - 1][0]},${m.t + ih} Z`, style: `fill:${sr.color};opacity:.12`, class: 'fill-area' }));
        }
        g.appendChild(s('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' '), class: 'line' + (sr.dashed ? ' dashed' : ''), style: `stroke:${sr.color}`, pathLength: sr.dashed ? null : 1 }));
        pts.forEach((p, i) => g.appendChild(s('circle', { cx: p[0], cy: p[1], r: 2.5, style: `fill:${sr.color};animation-delay:${Math.round(i / pts.length * 900)}ms`, class: 'pt' })));
      });
      // hover guide
      const guide = s('line', { y1: m.t, y2: m.t + ih, class: 'guide', style: 'display:none' });
      g.appendChild(guide);
      svg.appendChild(g);
      svg.addEventListener('mousemove', e => {
        const r = svg.getBoundingClientRect();
        const x = e.clientX - r.left;
        let idx = 0;
        xs.forEach((xx, i) => { if (Math.abs(xx - x) < Math.abs(xs[idx] - x)) idx = i; });
        guide.setAttribute('x1', xs[idx]); guide.setAttribute('x2', xs[idx]); guide.style.display = '';
        if (e.target.classList && e.target.classList.contains('note-dot')) return;
        showTip(e, `<div class="tip-h">${opts.labels[idx]}</div>` + opts.series.map(sr =>
          `<div><i style="background:${sr.color}"></i>${sr.name}<b>${sr.values[idx] === null ? '–' : yFormat(sr.values[idx])}</b></div>`).join('') +
          (opts.chartId ? '<div class="tip-hint">Click to pin a note</div>' : ''));
      });
      svg.addEventListener('mouseleave', () => { guide.style.display = 'none'; hideTip(); });
      return svg;
    });
    return h('div', null, opts.series.length > 1 || opts.legend ? legend(opts.series) : null, chart);
  }

  // ---------------------------------------------------------------
  // Stacked area (percent) - used for sentiment
  // ---------------------------------------------------------------
  function stackedArea(opts) {
    const height = opts.height || 220;
    opts.keys = opts.keys || opts.labels;
    const chart = mount(height, (W, H) => {
      const m = { t: 16, r: 12, b: 26, l: 40 };
      const iw = W - m.l - m.r;
      const ih = H - m.t - m.b;
      const n = opts.labels.length;
      const xs = opts.labels.map((_, i) => m.l + i * iw / (n - 1));
      const y = v => m.t + ih - v / 100 * ih;
      const svg = s('svg', { width: W, height: H, role: 'img', 'aria-label': opts.aria || 'Stacked area chart', class: 'sweep' });
      const g = s('g');
      let base = opts.labels.map(() => 0);
      opts.series.forEach(sr => {
        const top = base.map((b, i) => b + sr.values[i]);
        const d = 'M' + xs.map((x, i) => `${x},${y(top[i])}`).join(' L') + ' L' + xs.slice().reverse().map((x, i) => `${x},${y(base[n - 1 - i])}`).join(' L') + ' Z';
        g.appendChild(s('path', { d, style: `fill:${sr.color}`, class: 'area' }));
        base = top;
      });
      [0, 25, 50, 75, 100].forEach(v => {
        g.appendChild(s('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'grid light' }));
        g.appendChild(s('text', { x: m.l - 8, y: y(v) + 4, class: 'axis', 'text-anchor': 'end' }, v + '%'));
      });
      const step = Math.ceil(n / Math.max(2, Math.floor(iw / 56)));
      opts.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) g.appendChild(s('text', { x: xs[i], y: H - 8, class: 'axis', 'text-anchor': 'middle' }, l)); });
      noteLayer(g, opts, xs, m.t, m.t + ih, iw / (n - 1));
      svg.appendChild(g);
      svg.addEventListener('mousemove', e => {
        if (e.target.classList && e.target.classList.contains('note-dot')) return;
        const r = svg.getBoundingClientRect();
        const x = e.clientX - r.left;
        let idx = 0;
        xs.forEach((xx, i) => { if (Math.abs(xx - x) < Math.abs(xs[idx] - x)) idx = i; });
        showTip(e, `<div class="tip-h">Week ending ${opts.labels[idx]}</div>` + opts.series.slice().reverse().map(sr =>
          `<div><i style="background:${sr.color}"></i>${sr.name}<b>${sr.values[idx]}%</b></div>`).join('') +
          (opts.chartId ? '<div class="tip-hint">Click to pin a note</div>' : ''));
      });
      svg.addEventListener('mouseleave', hideTip);
      return svg;
    });
    return h('div', null, legend(opts.series), chart);
  }

  // ---------------------------------------------------------------
  // Bars. opts: labels, series, stacked, horizontal, yFormat, percent
  // ---------------------------------------------------------------
  function bars(opts) {
    const height = opts.height || 200;
    const yFormat = opts.yFormat || fmt.num;
    const chart = mount(height, (W, H) => {
      const svg = s('svg', { width: W, height: H, role: 'img', 'aria-label': opts.aria || 'Bar chart' });
      const g = s('g');
      const n = opts.labels.length;
      const totals = opts.labels.map((_, i) => opts.series.reduce((a, sr) => a + (sr.values[i] || 0), 0));
      const max = opts.percent ? 100 : niceMax(opts.stacked ? Math.max(...totals) : Math.max(...opts.series.flatMap(sr => sr.values)));
      const tipFor = i => `<div class="tip-h">${opts.labels[i]}</div>` + opts.series.map(sr =>
        `<div><i style="background:${sr.color}"></i>${sr.name}<b>${opts.percent ? (totals[i] ? (sr.values[i] / totals[i] * 100).toFixed(0) + '%' : '–') : yFormat(sr.values[i])}</b></div>`).join('');
      if (opts.horizontal) {
        const m = { t: 4, r: 40, b: 4, l: opts.labelWidth || 110 };
        const rowH = (H - m.t - m.b) / n;
        const bh = Math.min(22, rowH * 0.62);
        opts.labels.forEach((l, i) => {
          const yy = m.t + i * rowH + (rowH - bh) / 2;
          g.appendChild(s('text', { x: m.l - 10, y: yy + bh / 2 + 4, class: 'axis strong', 'text-anchor': 'end' }, l));
          let x = m.l;
          opts.series.forEach(sr => {
            const v = opts.percent ? (totals[i] ? sr.values[i] / totals[i] * 100 : 0) : sr.values[i];
            const w = v / max * (W - m.l - m.r);
            const rect = s('rect', { x, y: yy, width: Math.max(0, w), height: bh, rx: 2, style: `fill:${sr.color};animation-delay:${i * 60}ms`, class: 'bar bar-h' });
            rect.addEventListener('mousemove', e => showTip(e, tipFor(i)));
            rect.addEventListener('mouseleave', hideTip);
            g.appendChild(rect);
            x += opts.stacked || opts.percent ? w : 0;
          });
          if (!opts.percent && opts.endLabels !== false) g.appendChild(s('text', { x: x + 6, y: yy + bh / 2 + 4, class: 'axis' }, yFormat(totals[i])));
        });
      } else {
        const m = { t: 10, r: 8, b: 26, l: 40 };
        const iw = W - m.l - m.r;
        const ih = H - m.t - m.b;
        const colW = iw / n;
        const groups = opts.stacked ? 1 : opts.series.length;
        const bw = Math.min(34, colW * 0.6 / groups);
        for (let k = 0; k <= 4; k++) {
          const v = max * k / 4;
          const yy = m.t + ih - v / max * ih;
          g.appendChild(s('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy, class: 'grid' }));
          g.appendChild(s('text', { x: m.l - 8, y: yy + 4, class: 'axis', 'text-anchor': 'end' }, opts.percent ? v + '%' : yFormat(v)));
        }
        opts.labels.forEach((l, i) => {
          const cx = m.l + colW * i + colW / 2;
          g.appendChild(s('text', { x: cx, y: H - 8, class: 'axis', 'text-anchor': 'middle' }, l));
          let base = 0;
          opts.series.forEach((sr, j) => {
            const v = opts.percent ? (totals[i] ? sr.values[i] / totals[i] * 100 : 0) : sr.values[i];
            const bhh = v / max * ih;
            const x = opts.stacked || opts.percent ? cx - bw / 2 : cx - groups * bw / 2 + j * bw;
            const yy = m.t + ih - bhh - (opts.stacked || opts.percent ? base : 0);
            const rect = s('rect', { x: x + 0.5, y: yy, width: bw - 1, height: Math.max(0, bhh), rx: 2, style: `fill:${sr.color};animation-delay:${i * 50 + j * 25}ms`, class: 'bar bar-v' });
            rect.addEventListener('mousemove', e => showTip(e, tipFor(i)));
            rect.addEventListener('mouseleave', hideTip);
            g.appendChild(rect);
            if (opts.stacked || opts.percent) base += bhh;
          });
        });
      }
      svg.appendChild(g);
      return svg;
    });
    return h('div', null, opts.series.length > 1 && opts.legend !== false ? legend(opts.series) : null, chart);
  }

  // ---------------------------------------------------------------
  // Sparkline
  // ---------------------------------------------------------------
  function spark(values, color, height = 40) {
    return mount(height, (W, H) => {
      const max = Math.max(...values);
      const min = Math.min(...values);
      const x = i => 2 + i * (W - 4) / (values.length - 1);
      const y = v => H - 3 - (v - min) / (max - min || 1) * (H - 6);
      const d = values.map((v, i) => (i ? 'L' : 'M') + x(i) + ',' + y(v)).join(' ');
      const svg = s('svg', { width: W, height: H, 'aria-hidden': 'true', class: 'sweep' },
        s('path', { d: d + ` L${x(values.length - 1)},${H} L${x(0)},${H} Z`, style: `fill:${color};opacity:.12` }),
        s('path', { d, class: 'line', style: `stroke:${color}` }),
        s('circle', { cx: x(values.length - 1), cy: y(values[values.length - 1]), r: 3, style: `fill:${color}` }));
      return svg;
    }, 'spark');
  }

  SN.charts = { line, stackedArea, bars, spark, legend, showTip, hideTip, escapeHtml };
})();
