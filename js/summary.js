/*
 * Auto-written report summary in the Second Nature voice:
 * calm, direct, no superlatives, no em dashes. Built from the numbers for the
 * current filters and fully editable before export.
 */
window.SN = window.SN || {};

(function () {
  const { fmt } = SN.ui;
  const q = SN.q;

  function change(curr, prev) {
    if (!prev) return '';
    const pct = (curr - prev) / prev * 100;
    if (Math.abs(pct) < 3) return 'level with';
    return pct > 0 ? 'up from' : 'down from';
  }

  function generate() {
    const per = SN.state.period();
    const f = SN.state.filters;
    const plats = q.platforms();
    const prevM = per.prev;
    const parts = [];
    const where = f.property === 'all' ? '' : ` for ${f.property}`;

    const posts = q.posts();
    const top = posts.slice().sort((a, b) => b.views - a.views)[0];
    const views = q.account('views');
    const share = top && views ? top.views / views : 0;

    // Opening: lead with what shaped the period
    if (top && share > 0.5) {
      parts.push(`${per.label}${where} was shaped by one post. ${top.short || top.title} reached ${fmt.num(top.views)} views${top.paid ? '' : ' with no ad spend'}.`);
    } else if (top) {
      parts.push(`${per.label}${where} came from steady, spread-out content. ${top.title} led with ${fmt.num(top.views)} views.`);
    }

    if (plats.includes('instagram')) {
      const v = q.account('views', { platform: 'instagram' });
      const pv = prevM ? q.account('views', { platform: 'instagram', months: prevM }) : null;
      const fol = SN.data.account.instagram.followers;
      const lastM = per.months[per.months.length - 1];
      const gained = fol[lastM] - fol[Math.max(0, per.months[0] - 1)];
      let s = `Instagram views came to ${fmt.num(v)}`;
      if (pv) s += `, ${change(v, pv)} ${fmt.num(pv)} in ${per.prevLabel}`;
      s += gained >= 0
        ? `, and the account gained ${fmt.full(gained)} followers to reach ${fmt.full(fol[lastM])}.`
        : `, and the account lost ${fmt.full(-gained)} followers to ${fmt.full(fol[lastM])}.`;
      parts.push(s);
      const sh = q.account('shares', { platform: 'instagram' });
      const sv = q.account('saves', { platform: 'instagram' });
      const psh = prevM ? q.account('shares', { platform: 'instagram', months: prevM }) : null;
      if (psh && sh > psh * 3) parts.push(`Shares rose to ${fmt.num(sh)} and saves to ${fmt.num(sv)}. People found the content worth passing on.`);
    }

    const taps = q.account('linkTaps');
    const bookings = q.web('bookings');
    const revenue = q.web('revenue');
    const signups = q.web('fold');
    parts.push(`${fmt.full(taps)} people tapped through from social, which led to ${fmt.full(bookings)} bookings worth ${fmt.gbp(revenue)} and ${fmt.full(signups)} sign-ups to The Fold.`);

    if (plats.includes('tiktok')) {
      const tv = q.account('views', { platform: 'tiktok' });
      const ptv = prevM ? q.account('views', { platform: 'tiktok', months: prevM }) : null;
      const er = q.account('engagementRate', { platform: 'tiktok' });
      const search = q.account('searchShare', { platform: 'tiktok' });
      if (ptv && tv < ptv) parts.push(`TikTok was quieter. Views fell to ${fmt.num(tv)} and engagement to ${fmt.pct(er, 2)}, though search now brings in ${fmt.pct(search)} of traffic.`);
      else parts.push(`TikTok views came to ${fmt.num(tv)} at ${fmt.pct(er, 2)} engagement, with search bringing in ${fmt.pct(search)} of traffic.`);
    }

    const least = SN.cards.propertyRows(per.months).sort((a, b) => a.posts - b.posts)[0];
    if (f.property === 'all' && least) parts.push(`${least.name} had the least content support and is the place to focus next.`);

    if (top && share > 0.5) parts.push('The work now is making that format repeatable, so reach doesn\'t rest on a single post.');

    return parts.join(' ')
      .replace(/—|–/g, ',')     // no em or en dashes
      .replace(/\s+,/g, ',');
  }

  function key() {
    const f = SN.state.filters;
    return `summary:${f.from}:${f.to}:${f.platform}:${f.property}`;
  }

  SN.summary = {
    generate,
    get() { return SN.store.get(key(), null) || generate(); },
    isEdited() { return SN.store.get(key(), null) !== null; },
    save(text) { SN.store.set(key(), text); },
    reset() { SN.store.set(key(), null); }
  };
})();
