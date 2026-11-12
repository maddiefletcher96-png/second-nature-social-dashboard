/*
 * Business page
 * Row 1: Social to stay (8) · The Fold sign-ups (4)
 * Row 2: Property breakdown (6) · Campaign tracker (6)
 * Row 3: Five Cares mix (4) · Paid vs organic (4) · Monthly targets (4)
 */
window.SN = window.SN || {};
SN.pages = SN.pages || {};

SN.pages.business = function () {
  const { h } = SN.ui;
  const c = SN.cards;
  return h('div', { class: 'grid' },
    c.socialToStay(), c.fold(),
    c.properties(), c.campaigns(),
    c.cares(), c.paid(), c.targets());
};
