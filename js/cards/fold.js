/*
 * Business · The Fold sign-ups from social
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, fmt, delta, card, stat } = SN.ui;
  const q = SN.q;

  SN.cards.fold = function () {
    const per = SN.state.period();
    const total = q.web('fold');
    const prev = per.prev ? q.web('fold', { months: per.prev }) : null;
    const clicks = q.account('linkTaps');
    const prevClicks = per.prev ? q.account('linkTaps', { months: per.prev }) : null;
    const rate = clicks ? total / clicks * 100 : 0;
    const prevRate = prevClicks ? prev / prevClicks * 100 : null;
    const plats = q.platforms();
    return card({ title: 'The Fold sign-ups', span: 4, subtitle: 'Membership sign-ups from social, ' + per.label },
      h('div', { class: 'stats' },
        stat('Sign-ups', fmt.num(total), delta(total, prev)),
        stat('Click to sign-up', fmt.pct(rate), prevRate !== null ? delta(rate, prevRate, { points: true }) : null)),
      h('div', { style: { marginTop: '12px' } },
        plats.map(pl => {
          const v = q.web('fold', { platform: pl });
          return h('div', { class: 'goal-top', style: { padding: '4px 0' } }, SN.ui.platformTag(pl), h('b', null, fmt.num(v)));
        })),
      h('div', { class: 'muted small', style: { marginTop: '10px' } }, 'Weekly sign-ups, last 14 weeks (relaunch from mid-September)'),
      SN.charts.spark(SN.data.foldWeekly, 'var(--moss)', 48));
  };
})();
