/*
 * Shared state: header filters, saved team inputs (notes, targets, statuses)
 * and the query helpers every page uses so the filters carry across.
 */
window.SN = window.SN || {};

(function () {
  const PREFIX = 'sn-dash:';

  // localStorage can be blocked (private windows), so every call is guarded
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  // Data covers 1 Jan to 31 Oct 2026. Any range inside it can be picked.
  const DATA_START = '2026-01-01';
  const DATA_END = '2026-10-31';
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Quick picks in the date dropdown
  const PRESETS = {
    oct: { label: 'This month', from: '2026-10-01', to: '2026-10-31' },
    last3: { label: 'Last 3 months', from: '2026-08-01', to: '2026-10-31' },
    relaunch: { label: 'Since the relaunch', from: '2026-07-01', to: '2026-10-31' },
    ytd: { label: 'Year to date', from: '2026-01-01', to: '2026-10-31' }
  };
  const LEGACY = { oct: ['2026-10-01', '2026-10-31'], sep: ['2026-09-01', '2026-09-30'], aug: ['2026-08-01', '2026-08-31'], jul: ['2026-07-01', '2026-07-31'], last3: ['2026-08-01', '2026-10-31'], ytd: ['2026-01-01', '2026-10-31'] };

  const filters = Object.assign({ platform: 'all', property: 'all', from: '2026-10-01', to: '2026-10-31', excludePaid: false }, store.get('filters', {}));
  if (filters.period && LEGACY[filters.period]) { [filters.from, filters.to] = LEGACY[filters.period]; }
  delete filters.period;

  const listeners = [];
  function emit() { listeners.forEach(fn => fn()); }

  function setFilter(key, value) {
    if (key === 'period' && LEGACY[value]) { [filters.from, filters.to] = LEGACY[value]; store.set('filters', filters); emit(); return; }
    filters[key] = value;
    store.set('filters', filters);
    emit();
  }

  // ---------------------------------------------------------------
  // Date ranges
  // ---------------------------------------------------------------
  const toDate = iso => new Date(iso + 'T12:00');
  const toIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  const addDays = (iso, n) => { const d = toDate(iso); d.setDate(d.getDate() + n); return toIso(d); };
  const clamp = iso => iso < DATA_START ? DATA_START : iso > DATA_END ? DATA_END : iso;

  // Months a range touches, with the share of each month it covers (for monthly account figures)
  function monthsFor(from, to) {
    const out = [];
    out.frac = {};
    out.range = { from, to };
    const f = toDate(from);
    const t = toDate(to);
    for (let y = f.getFullYear(), m = f.getMonth(); y < t.getFullYear() || (y === t.getFullYear() && m <= t.getMonth()); m++) {
      if (m > 11) { m = 0; y++; }
      if (y !== 2026) continue;
      const first = new Date(y, m, 1, 12);
      const last = new Date(y, m, daysIn(y, m), 12);
      const a = f > first ? f : first;
      const b = t < last ? t : last;
      const days = Math.round((b - a) / 864e5) + 1;
      out.push(m);
      out.frac[m] = days / daysIn(y, m);
    }
    return out;
  }

  const isMonthStart = iso => iso.slice(8) === '01';
  const isMonthEnd = iso => { const d = toDate(iso); return d.getDate() === daysIn(d.getFullYear(), d.getMonth()); };

  function labelFor(from, to) {
    const f = toDate(from);
    const t = toDate(to);
    if (isMonthStart(from) && isMonthEnd(to)) {
      if (f.getMonth() === t.getMonth()) return `${MONTH_NAMES[f.getMonth()]} ${f.getFullYear()}`;
      return `${MONTH_NAMES[f.getMonth()].slice(0, 3)} to ${MONTH_NAMES[t.getMonth()].slice(0, 3)} ${t.getFullYear()}`;
    }
    const fmtD = d => `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
    return from === to ? `${fmtD(f)} ${f.getFullYear()}` : `${fmtD(f)} to ${fmtD(t)} ${t.getFullYear()}`;
  }

  // Previous period: same number of whole months, or the same number of days, just before
  function prevFor(from, to) {
    let pf;
    let pt;
    if (isMonthStart(from) && isMonthEnd(to)) {
      const f = toDate(from);
      const t = toDate(to);
      const n = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
      const ps = new Date(f.getFullYear(), f.getMonth() - n, 1, 12);
      pf = toIso(ps);
      pt = addDays(from, -1);
    } else {
      const days = Math.round((toDate(to) - toDate(from)) / 864e5) + 1;
      pt = addDays(from, -1);
      pf = addDays(from, -days);
    }
    if (pf < DATA_START) return null;
    return { from: pf, to: pt };
  }

  let cache = null;
  function period() {
    const key = filters.from + filters.to;
    if (cache && cache.key === key) return cache.value;
    const prev = prevFor(filters.from, filters.to);
    const value = {
      from: filters.from, to: filters.to,
      label: labelFor(filters.from, filters.to),
      months: monthsFor(filters.from, filters.to),
      prev: prev ? monthsFor(prev.from, prev.to) : null,
      prevLabel: prev ? labelFor(prev.from, prev.to).replace(/ 2026$/, '') : null,
      partial: !(isMonthStart(filters.from) && isMonthEnd(filters.to))
    };
    cache = { key, value };
    return value;
  }

  function setRange(from, to) {
    if (to < from) [from, to] = [to, from];
    filters.from = clamp(from);
    filters.to = clamp(to);
    store.set('filters', filters);
    emit();
  }

  // ---------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------
  const D = () => SN.data;
  const monthOf = date => Number(date.slice(5, 7)) - 1;

  function platforms(override) {
    const p = override || filters.platform;
    return p === 'all' ? D().PLATFORMS : [p];
  }

  function posts(opts = {}) {
    const months = opts.months || period().months;
    const plats = platforms(opts.platform);
    const property = opts.property || filters.property;
    const excludePaid = opts.includePaid ? false : filters.excludePaid;
    const inRange = months.range ? p => p.date >= months.range.from && p.date <= months.range.to : p => months.includes(monthOf(p.date));
    return D().posts.filter(p =>
      inRange(p) &&
      plats.includes(p.platform) &&
      (property === 'all' || p.property === property) &&
      !(excludePaid && p.paid)
    );
  }

  // Share of views a property had on a platform in the given months.
  // Used to estimate account-level figures when a property is selected.
  function propertyShare(platform, months, property) {
    property = property || filters.property;
    if (property === 'all') return 1;
    const all = D().posts.filter(p => p.platform === platform && months.includes(monthOf(p.date)));
    const total = all.reduce((a, p) => a + p.views, 0) || 1;
    const prop = all.filter(p => p.property === property).reduce((a, p) => a + p.views, 0);
    return prop / total;
  }

  // Share of a month's activity that falls inside a partial range: weighted by the views of
  // posts published in the range, falling back to the share of days when a month has no posts
  function rangeShare(platform, m, months) {
    const dayFrac = months.frac && months.frac[m] !== undefined ? months.frac[m] : 1;
    if (dayFrac >= 1 || !months.range) return dayFrac;
    const inMonth = D().posts.filter(p => p.platform === platform && monthOf(p.date) === m);
    const total = inMonth.reduce((a, p) => a + p.views, 0);
    if (!total) return dayFrac;
    const { from, to } = months.range;
    return inMonth.filter(p => p.date >= from && p.date <= to).reduce((a, p) => a + p.views, 0) / total;
  }

  // Share of views from organic (not paid or boosted) posts
  function organicShare(platform, months) {
    const all = D().posts.filter(p => p.platform === platform && months.includes(monthOf(p.date)));
    const total = all.reduce((a, p) => a + p.views, 0) || 1;
    return all.filter(p => !p.paid).reduce((a, p) => a + p.views, 0) / total;
  }

  // Account metric for the current filters. followers = last month, rates = average, others = sum
  function account(metric, opts = {}) {
    const months = opts.months || period().months;
    if (!months) return null;
    const plats = platforms(opts.platform);
    let total = 0;
    let count = 0;
    plats.forEach(pl => {
      const series = D().account[pl][metric];
      if (!series) return;
      const share = metric === 'followers' || metric === 'engagementRate' || metric === 'searchShare' ? 1
        : propertyShare(pl, months, opts.property) * (filters.excludePaid && !opts.includePaid ? organicShare(pl, months) : 1);
      if (metric === 'followers') total += series[months[months.length - 1]];
      else if (metric === 'engagementRate' || metric === 'searchShare') {
        // Weight rates by views so a small platform doesn't pull the combined rate around
        months.forEach(m => { const w = D().account[pl].views[m] * rangeShare(pl, m, months); total += series[m] * w; count += w; });
      } else months.forEach(m => { total += (series[m] || 0) * share * rangeShare(pl, m, months); });
    });
    if (metric === 'engagementRate' || metric === 'searchShare') return count ? total / count : null;
    return Math.round(total);
  }

  // Website / booking metric for the current filters
  function web(field, opts = {}) {
    const months = opts.months || period().months;
    if (!months) return null;
    const property = opts.property || filters.property;
    let total = 0;
    platforms(opts.platform).forEach(pl => months.forEach(m => {
      // Same property share as the account figures, so each funnel step splits consistently
      const w = property === 'all' ? 1 : propertyShare(pl, [m], property);
      const organic = filters.excludePaid && !opts.includePaid ? organicShare(pl, [m]) : 1;
      total += D().web[pl][m][field] * w * organic * rangeShare(pl, m, months);
    }));
    return Math.round(total);
  }

  function sum(list, field) { return list.reduce((a, p) => a + (p[field] || 0), 0); }

  function engagementRate(list) {
    const reach = sum(list, 'reach');
    return reach ? sum(list, 'interactions') / reach * 100 : 0;
  }


  SN.store = store;
  SN.state = {
    filters, PRESETS, DATA_START, DATA_END, MONTH_NAMES, setFilter, setRange, period, labelFor, monthsFor,
    onChange(fn) { listeners.push(fn); },
    emit
  };
  SN.q = { posts, account, web, sum, engagementRate, propertyShare, monthOf, platforms };
})();
