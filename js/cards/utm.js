/*
 * UTM builder. Keeps every link in one format:
 * utm_source = platform, utm_medium = organic | paid | creator, utm_campaign = campaign slug
 */
window.SN = window.SN || {};
SN.cards = SN.cards || {};

(function () {
  const { h, modal, toast, table } = SN.ui;

  const BASE_URLS = {
    'Second Nature (all)': 'https://www.secondnature.com/',
    Chiswick: 'https://www.secondnature.com/chiswick',
    Belfast: 'https://www.secondnature.com/belfast',
    Southampton: 'https://www.secondnature.com/southampton',
    'The Fold': 'https://www.secondnature.com/the-fold'
  };

  function slug(text) {
    return String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  function build({ url, source, medium, campaign, content }) {
    let u;
    try { u = new URL(url); } catch (e) { return null; }
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', slug(campaign));
    if (content) u.searchParams.set('utm_content', slug(content));
    return u.toString();
  }

  function open() {
    const dest = h('select', null, Object.entries(BASE_URLS).map(([k, v]) => h('option', { value: v }, k)), h('option', { value: '' }, 'Other URL…'));
    const custom = h('input', { type: 'url', placeholder: 'https://', style: { display: 'none' } });
    const source = h('select', null, [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn']].map(([v, l]) => h('option', { value: v }, l)));
    const medium = h('select', null, ['organic', 'paid', 'creator'].map(v => h('option', { value: v }, v)));
    const campaign = h('select', null,
      SN.data.campaigns.map(c => h('option', { value: c.name }, c.name)),
      h('option', { value: 'always-on' }, 'Always-on'), h('option', { value: '__new' }, 'New campaign…'));
    const newCampaign = h('input', { type: 'text', placeholder: 'Campaign name', style: { display: 'none' } });
    const content = h('input', { type: 'text', placeholder: 'Optional, e.g. lamp-reel or bio-link' });
    const out = h('div', { class: 'code-out', 'aria-live': 'polite' });

    const values = () => ({
      url: dest.value || custom.value,
      source: source.value, medium: medium.value,
      campaign: campaign.value === '__new' ? newCampaign.value : campaign.value,
      content: content.value
    });
    const update = () => {
      custom.style.display = dest.value ? 'none' : '';
      newCampaign.style.display = campaign.value === '__new' ? '' : 'none';
      const link = build(values());
      out.textContent = link || 'Enter a full URL starting with https://';
      return link;
    };
    [dest, custom, source, medium, campaign, newCampaign, content].forEach(el => el.addEventListener('input', update));

    const list = h('div');
    const renderList = () => {
      list.innerHTML = '';
      const items = SN.store.get('utmLinks', []);
      if (!items.length) return;
      list.appendChild(h('h3', { class: 'sub-h' }, 'Saved links'));
      list.appendChild(table([
        { label: 'Source', key: 'source' }, { label: 'Medium', key: 'medium' }, { label: 'Campaign', key: 'campaign' },
        { label: '', render: r => h('button', { class: 'link-btn', onclick: () => copy(r.link) }, 'Copy') }
      ], items.slice().reverse().slice(0, 8)));
    };

    function copy(text) {
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Link copied'), () => {
        const t = h('textarea', null, text); document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); toast('Link copied'); } catch (e) { toast('Copy failed, select the link manually'); }
        t.remove();
      });
    }

    modal('UTM builder', h('div', { class: 'form' },
      h('p', { class: 'small muted', style: { margin: 0 } }, 'Source is the platform, medium is organic, paid or creator, campaign is the campaign name. Every link in the same format keeps the Social to stay funnel accurate.'),
      h('label', null, 'Destination', dest, custom),
      h('div', { class: 'form-row' }, h('label', null, 'Source', source), h('label', null, 'Medium', medium)),
      h('label', null, 'Campaign', campaign, newCampaign),
      h('label', null, 'Content (optional)', content),
      out,
      h('div', { class: 'form-actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => { const l = update(); if (l) copy(l); } }, 'Copy'),
        h('button', {
          class: 'btn primary', type: 'button', onclick: () => {
            const l = update(); if (!l) return;
            const v = values();
            const items = SN.store.get('utmLinks', []);
            items.push({ link: l, source: v.source, medium: v.medium, campaign: slug(v.campaign), created: SN.ui.today() });
            SN.store.set('utmLinks', items);
            copy(l); renderList();
          }
        }, 'Save and copy')),
      list), { wide: false });
    update();
    renderList();
  }

  SN.cards.utmBuilder = open;
  SN.cards.utmSlug = slug;
  SN.cards.utmBuild = build;
})();
