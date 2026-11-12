/*
 * Second Nature social dashboard - sample data
 *
 * Account-level Instagram and TikTok figures for September and October 2026
 * come from the Second Nature Monthly Report (October 2026). Everything else
 * (earlier months, website, booking engine, inbox, agency and creator data)
 * is illustrative, shaped around that report, until the live connectors are
 * switched on. See docs/DATA.md for the mapping.
 */
window.SN = window.SN || {};

(function () {
  // Small seeded random so the sample data is the same on every load
  let seed = 20261031;
  function rand() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
  function pick(list, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weights[i];
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PLATFORMS = ['instagram', 'tiktok'];
  const PROPERTIES = ['Chiswick', 'Belfast', 'Southampton'];
  const PROPERTY_WEIGHTS = [0.46, 0.34, 0.2];
  // Pillars, goals, personas and series from the Second Nature Social Media Strategy (Stay the Night)
  const PILLARS = ['Relaxed', 'Free', 'Connected', 'Inspired', 'Understood'];
  const CARES = ['People', 'Place', 'Planet', 'Progress', 'Purpose'];
  const GOALS = ['Inspire', 'Connect', 'Promote', 'Inform'];
  const PERSONAS = ['Hannah · The Rhythm Keeper', 'Ben · The Soft Explorer', 'Sarah · The Considered Comfort Seeker', 'Tom · The Connector', 'Maya · The Conscious Curator'];
  const SERIES = ['This used to be…', 'Guest Diaries', 'Around The Corner', 'We Thought Of That', 'POV: You just checked in', 'The 2pm Checkout'];

  // ---------------------------------------------------------------
  // Account-level monthly figures (index 0 = January 2026)
  // Instagram: real from the follower growth tracker + October report (see docs/DATA.md)
  // TikTok Jan-Aug: illustrative
  // ---------------------------------------------------------------
  const account = {
    instagram: {
      // followers, reach, interactions and engagement rate Jan-Sep: Instagram follower growth tracker (sheet)
      // July followers, reach, views, profile visits, link taps, ER: July 2026 report (views = 79,683 organic + 52,419 boosted).
      // August and September: September 2026 report (Aug views 168.4K, interactions 2,034, ER 4.46%; Sep views 66,640, ER 3.5%).
      // October: October report. Other views Jan-Jun estimated from reach. Aug link taps = 12.9% of profile visits.
      followers:     [38507, 40701, 40729, 40933, 42038, 41993, 41908, 42062, 42101, 42752],
      reach:         [35176, 46013, 19367, 21989, 35409, 24605, 27298, 17943, 9605, null],
      views:         [47500, 62100, 26100, 29700, 47800, 33200, 132102, 168400, 66600, 379600],
      interactions:  [877, 8164, 687, 1728, 872, 434, 644, 2034, 715, 26420],
      likes:         [675, 653, 529, 1330, 672, 334, 495, 1560, 495, 19000],
      comments:      [53, 6123, 41, 104, 52, 26, 39, 240, 57, 103],
      shares:        [79, 735, 62, 156, 78, 39, 58, 130, 46, 5200],
      saves:         [70, 653, 55, 138, 70, 35, 52, 104, 51, 2400],
      profileVisits: [1500, 1420, 1610, 1580, 1720, 1690, 1931, 2010, 1853, 4900],
      linkTaps:      [170, 160, 190, 180, 205, 198, 195, 259, 214, 892],
      engagementRate:[2.49, 17.74, 3.55, 7.86, 2.46, 1.76, 2.5, 4.46, 3.5, 10.17]
    },
    tiktok: {
      // July from the July report; Aug ER/search and all of Sep from the September report; Oct from the October report; rest illustrative
      followers:     [760, 790, 830, 880, 930, 995, 1035, 1110, 1185, 1200],
      views:         [2100, 2400, 2900, 3100, 3600, 3900, 5200, 5400, 7100, 6200],
      interactions:  [61, 70, 84, 92, 104, 112, 150, 168, 216, 168],
      likes:         [48, 55, 66, 72, 82, 88, 118, 131, 193, 130],
      comments:      [2, 2, 3, 3, 4, 4, 5, 5, 0, 2],
      shares:        [6, 7, 8, 9, 10, 11, 15, 18, 23, 27],
      saves:         [5, 6, 7, 8, 8, 9, 12, 14, 18, 9],
      profileVisits: [140, 160, 190, 210, 240, 260, 330, 360, 578, 444],
      linkTaps:      [9, 10, 13, 14, 16, 17, 24, 28, 44, 41],
      engagementRate:[2.9, 2.9, 2.9, 3.0, 2.9, 2.9, 2.48, 2.6, 3.04, 2.71],
      searchShare:   [9.8, 10.4, 11.1, 11.6, 12.0, 11.0, 19.3, 14.2, 29.9, 34.8]
    }
  };

  // 2026 goals - from the report's goal tracking page
  const goals = [
    { id: 'ig-followers', platform: 'instagram', label: 'Instagram followers (2026)', target: 45000, current: 42752, start: 38481, unit: 'count', note: 'Grow to 45,000 by the end of 2026' },
    { id: 'ig-fy', platform: 'instagram', label: 'Instagram followers (FY)', target: 60000, current: 42752, start: 37635, unit: 'count', elapsed: 12 / 17, note: '60,000 by the end of the financial year, 31 Mar 2027' },
    { id: 'ig-views', platform: 'instagram', label: 'Instagram reach (cumulative views)', target: 200000, current: 702452, start: 0, unit: 'count', note: '200,000+ accounts by the end of 2026. The October report tracks this as cumulative views' },
    { id: 'ig-er', platform: 'instagram', label: 'Instagram engagement rate', target: 5, current: 10.17, start: 3.9, unit: 'pct', note: 'Within or higher than 5% by the end of the year' },
    { id: 'ig-profile', platform: 'instagram', label: 'Instagram profile visits', target: 10000, sinceJuly: 'profileVisits', start: 0, elapsed: 4 / 6, unit: 'count', note: '10,000 by the end of 2026, counted from the July relaunch' },
    { id: 'ig-clicks', platform: 'instagram', label: 'Website clicks from Instagram', target: 1800, sinceJuly: 'linkTaps', start: 0, elapsed: 4 / 6, unit: 'count', note: '1,800 by the end of 2026, counted from the July relaunch' },
    { id: 'ig-shares', platform: 'instagram', label: 'Instagram shares', target: 800, sinceJuly: 'shares', start: 0, elapsed: 4 / 6, unit: 'count', note: '800 by the end of 2026, counted from the July relaunch' },
    { id: 'ig-saves', platform: 'instagram', label: 'Instagram saves', target: 300, sinceJuly: 'saves', start: 0, elapsed: 4 / 6, unit: 'count', note: '300 by the end of 2026, counted from the July relaunch' },
    { id: 'collabs', platform: 'instagram', label: 'Creator collaborations', target: 25, current: 13, start: 0, unit: 'count', note: 'Confirmed or completed collabs so far' },
    { id: 'tt-followers', platform: 'tiktok', label: 'TikTok followers', target: 2000, current: 1200, start: 580, unit: 'count', note: 'Grow to 2,000 by the end of 2026' },
    { id: 'tt-views', platform: 'tiktok', label: 'TikTok monthly video views', target: 15000, current: 6200, start: 2100, unit: 'count', note: '15,000 monthly average by the end of 2026' },
    { id: 'tt-er', platform: 'tiktok', label: 'TikTok engagement rate', target: 6.5, current: 2.71, start: 2.9, unit: 'pct', note: 'Within or higher than 6.5% by the end of 2026' },
    { id: 'tt-collabs', platform: 'tiktok', label: 'TikTok influencer collaborations', target: 8, current: 2, start: 0, unit: 'count', note: 'Influencer collaborations on TikTok' }
  ];

  goals.forEach(g => {
    if (g.sinceJuly) g.current = account.instagram[g.sinceJuly].slice(6).reduce((a, b) => a + b, 0);
  });

  // Channel roles from the strategy
  const channels = {
    instagram: { role: 'The Editorial Home', mindset: 'Curated inspiration and aspirational moments', goal: 'Inspire & Inform', tone: 'Elevated, aspirational, crafted',
      objective: 'Drive brand affinity, inspire bookings, reinforce premium positioning', kpis: ['saves', 'shares', 'profileVisits', 'linkTaps'], takeaway: 'I want my life to feel a little more like this.' },
    tiktok: { role: 'The Playground', mindset: 'Cultural connection and playful entertainment', goal: 'Entertain & Inspire', tone: 'Playful, witty, culturally plugged-in',
      objective: 'Build cultural relevance, grow reach with younger audiences, nurture brand personality', kpis: ['views', 'engagementRate', 'shares', 'searchShare'], takeaway: "I didn't know hotels could be like this." }
  };

  // ---------------------------------------------------------------
  // Campaigns
  // ---------------------------------------------------------------
  const campaigns = [
    { id: 'fold', name: 'The Fold membership relaunch', start: '2026-09-15', end: '2026-10-31', status: 'Complete', care: 'People', color: 'moss',
      summary: 'Relaunch of The Fold membership with a new sign-up flow linked from bio and stories.' },
    { id: 'wsd', name: 'World Sustainability Day x MadeBy', start: '2026-10-20', end: '2026-10-31', status: 'Complete', care: 'Planet', color: 'lichen',
      summary: 'The lamp Reel. "This lamp used to be a flat white". 347K views with no ad spend.' },
    { id: 'xmas', name: 'Circular Christmas', start: '2026-11-02', end: '2026-12-31', status: 'Live', care: 'Planet', color: 'brick',
      summary: 'Festive Chiswick shoot, soaps and ornaments in the "this used to be…" format, festive creator stays.' },
    { id: 'opera', name: 'Grand Opera House Belfast competition', start: '2026-11-23', end: '2026-11-30', status: 'Planned', care: 'Place', color: 'clay',
      summary: 'Belfast competition with the Grand Opera House, live w/c 23rd November.' },
    { id: 'tree', name: 'Kids Out Giving Tree', start: '2026-11-25', end: '2026-12-19', status: 'Planned', care: 'Purpose', color: 'sand',
      summary: 'Giving tree in each lobby collecting gifts for Kids Out.' },
    { id: 'bundle', name: 'Brand-wide gift bundle competition', start: '2026-12-01', end: '2026-12-14', status: 'Planned', care: 'People', color: 'moss',
      summary: 'Gift bundle with partner brands. Toast Brewing, Exhale Coffee and St Eval in conversation.' }
  ];

  function campaignFor(date) {
    const hits = campaigns.filter(c => date >= c.start && date <= c.end);
    return hits.length ? hits[hits.length - 1].id : null;
  }

  // ---------------------------------------------------------------
  // Posts. A handful are the real October top posts; the rest are
  // generated and scaled so each month adds up to the account views.
  // ---------------------------------------------------------------
  const realPosts = [
    { id: 'ig-lamp', platform: 'instagram', date: '2026-10-21', format: 'Reel', title: '"This lamp used to be a flat white" (MadeBy)', short: 'The lamp Reel with MadeBy', property: null,
      pillar: 'Inspired', care: 'Planet', goal: 'Inspire', persona: 'Maya · The Conscious Curator', series: 'This used to be…', source: 'Brand x partner',
      views: 347000, likes: 24000, comments: 103, shares: 6600, saves: 2100, reposts: 275, paid: false },
    { id: 'ig-yourstay', platform: 'instagram', date: '2026-10-09', format: 'Carousel', title: '"Your stay" through @damian.smigalski\'s lens', property: 'Chiswick',
      pillar: 'Understood', care: 'People', goal: 'Inform', persona: 'Ben · The Soft Explorer', series: 'Guest Diaries', source: 'Creator',
      views: 3100, likes: 39, comments: 0, shares: 4, saves: 12, reposts: 1, paid: false },
    { id: 'ig-keleeci', platform: 'instagram', date: '2026-10-15', format: 'Reel', title: 'Keleeci\'s Chiswick Reel (coffee-waste lampshade)', property: 'Chiswick',
      pillar: 'Understood', care: 'Planet', goal: 'Inform', persona: 'Ben · The Soft Explorer', series: 'Guest Diaries', source: 'Guest',
      views: 2621, likes: 36, comments: 0, shares: 3, saves: 9, reposts: 6, paid: false },
    { id: 'tt-soton', platform: 'tiktok', date: '2026-10-07', format: 'Carousel', title: 'Southampton city guide', property: 'Southampton',
      pillar: 'Connected', care: 'Place', goal: 'Inspire', persona: 'Ben · The Soft Explorer', series: 'Around The Corner', source: 'In-house',
      views: 1041, likes: 10, comments: 0, shares: 2, saves: 0, reposts: 0, paid: false },
    { id: 'tt-belfast', platform: 'tiktok', date: '2026-10-13', format: 'Video', title: 'Quick Belfast room tour', property: 'Belfast',
      pillar: 'Understood', care: 'Place', goal: 'Inform', persona: 'Tom · The Connector', series: 'POV: You just checked in', source: 'In-house',
      views: 920, likes: 37, comments: 1, shares: 1, saves: 1, reposts: 0, paid: false },
    { id: 'tt-lamp', platform: 'tiktok', date: '2026-10-28', format: 'Video', title: 'Lamp video (cross-post test)', property: null,
      pillar: 'Inspired', care: 'Planet', goal: 'Inspire', persona: 'Maya · The Conscious Curator', series: 'This used to be…', source: 'In-house',
      views: 484, likes: 19, comments: 0, shares: 0, saves: 2, reposts: 0, paid: false }
  ];

  // Monthly top posts and reels, Jan-Sep 2026, from the follower growth tracker sheet.
  // Where the sheet gives reach but not views, views are estimated at 1.3x reach.
  const R = (id, date, format, title, o) => Object.assign({
    id, platform: 'instagram', date, format, title, property: null, pillar: 'Understood', care: 'People', goal: 'Inspire',
    persona: 'Ben · The Soft Explorer', series: null, source: 'In-house', likes: 0, comments: 0, shares: 0, saves: 0, reposts: 0, paid: false, fromSheet: true
  }, o, { views: o.views || Math.round(o.reach * 1.3) });
  const sheetPosts = [
    R('s-jan-crochet', '2026-01-06', 'Video', 'Crochet a milk bottle holder', { reach: 3216, likes: 80, comments: 4, shares: 6, saves: 5, pillar: 'Inspired', care: 'Planet', persona: 'Maya · The Conscious Curator' }),
    R('s-jan-crochet-r', '2026-01-06', 'Reel', 'Crochet a milk bottle holder (Reel)', { views: 4562, reach: 3300, likes: 84, comments: 4, shares: 6, saves: 6, pillar: 'Inspired', care: 'Planet', persona: 'Maya · The Conscious Curator' }),
    R('s-feb-win', '2026-02-02', 'Carousel', 'WIN: The ultimate night (with Islands Chocolate)', { reach: 27001, likes: 1100, comments: 6100, shares: 280, saves: 187, pillar: 'Connected', goal: 'Connect', campaign: null }),
    R('s-feb-chiswick', '2026-02-08', 'Reel', 'Romanticising Chiswick', { reach: 1940, likes: 54, comments: 2, shares: 6, saves: 4, property: 'Chiswick', pillar: 'Connected', care: 'Place' }),
    R('s-mar-mirrors', '2026-03-27', 'Video', 'Meet the maker behind the mirrors', { reach: 1799, likes: 84, comments: 3, shares: 8, saves: 7, pillar: 'Inspired', care: 'Progress', persona: 'Maya · The Conscious Curator' }),
    R('s-mar-mirrors-r', '2026-03-27', 'Reel', 'Meet the maker behind the mirrors (Reel)', { views: 2555, reach: 1800, likes: 88, comments: 3, shares: 9, saves: 8, pillar: 'Inspired', care: 'Progress', persona: 'Maya · The Conscious Curator' }),
    R('s-apr-yoto', '2026-04-07', 'Image', 'WIN: Two Yoto Players', { reach: 3880, likes: 260, comments: 760, shares: 40, saves: 28, pillar: 'Connected', goal: 'Connect', persona: 'Sarah · The Considered Comfort Seeker' }),
    R('s-apr-pets', '2026-04-11', 'Reel', 'National Pet Month', { reach: 1116, likes: 40, comments: 2, shares: 3, saves: 3, care: 'People' }),
    R('s-may-winnies', '2026-05-11', 'Video', "Did you hear this also? Winnie's Cafe", { reach: 5475, likes: 116, comments: 2, shares: 80, saves: 26, pillar: 'Relaxed', property: 'Belfast' }),
    R('s-may-winnies-r', '2026-05-11', 'Reel', "Winnie's Cafe (Reel)", { views: 9141, reach: 6265, likes: 210, comments: 4, shares: 30, saves: 20, pillar: 'Relaxed', property: 'Belfast' }),
    R('s-jun-checkin', '2026-06-23', 'Video', "A version of check-in that feels like admin. And then there's this", { reach: 3126, likes: 69, comments: 0, shares: 0, saves: 2 }),
    R('s-jul-launch', '2026-07-07', 'Video', 'Welcome to Second Nature (launch)', { reach: 2559, likes: 71, comments: 6, shares: 22, saves: 0, pillar: 'Connected', care: 'Purpose' }),
    R('s-jul-launch-r', '2026-07-07', 'Reel', 'Welcome to Second Nature (Reel)', { views: 4298, reach: 2559, likes: 80, comments: 6, shares: 15, saves: 0, pillar: 'Connected', care: 'Purpose' }),
    R('s-aug-win', '2026-08-14', 'Carousel', 'WIN: Fancy making a night of it?', { reach: 6434, likes: 225, comments: 419, shares: 142, saves: 18, pillar: 'Connected', goal: 'Connect' }),
    R('s-aug-reallife', '2026-08-20', 'Reel', 'A stay designed around real life', { views: 1565, reach: 1331, likes: 46, comments: 2, shares: 4, saves: 6, goal: 'Inform' }),
    R('s-sep-winnies', '2026-09-10', 'Video', "Winnie's, the heart of Second Nature", { views: 2097, reach: 1117, likes: 46, comments: 0, shares: 2, saves: 3, pillar: 'Relaxed', property: 'Belfast' }),
    R('r-sep-sage-reel', '2026-09-12', 'Reel', '@_sageandoats Belfast stay (Reel)', { views: 9378, reach: 2171, likes: 289, comments: 13, shares: 12, saves: 18, property: 'Belfast', source: 'Creator', pillar: 'Inspired', series: 'Guest Diaries', persona: 'Ben · The Soft Explorer' }),
    R('r-sep-sage-post', '2026-09-12', 'Carousel', '@_sageandoats Belfast stay (carousel)', { views: 4095, reach: 1591, likes: 171, comments: 19, shares: 6, saves: 11, property: 'Belfast', source: 'Creator', pillar: 'Inspired', series: 'Guest Diaries', persona: 'Ben · The Soft Explorer' }),
    R('r-sep-tt-locals', '2026-09-09', 'Video', 'The best travel recommendations come from locals (Belfast team)', { platform: 'tiktok', views: 1224, reach: 990, likes: 46, comments: 0, shares: 5, saves: 9, property: 'Belfast', pillar: 'Connected', series: 'Around The Corner', goal: 'Inform' }),
    R('r-sep-tt-2', '2026-09-18', 'Video', 'Slow Sunday in Chiswick', { platform: 'tiktok', views: 1149, reach: 930, likes: 63, comments: 0, shares: 1, saves: 2, property: 'Chiswick', pillar: 'Relaxed' }),
    R('r-sep-tt-3', '2026-09-24', 'Video', 'We thought of that: late checkout', { platform: 'tiktok', views: 602, reach: 490, likes: 22, comments: 0, shares: 1, saves: 3, pillar: 'Understood', series: 'The 2pm Checkout' }),
    R('s-sep-pets', '2026-09-17', 'Carousel', 'Pets carousel', { views: 1640, reach: 1269, likes: 41, comments: 0, shares: 6, saves: 3 })
  ];
  // July 2026 report: launch Reel boost, dog carousel and the top TikToks
  sheetPosts.push(
    R('r-jul-launch-boost', '2026-07-08', 'Reel', 'Welcome to Second Nature (boosted)', { views: 52419, reach: 30200, likes: 34, comments: 4, shares: 3, saves: 2, paid: true, clicksReal: 338, purchases: 12, pillar: 'Connected', care: 'Purpose', goal: 'Promote' }),
    R('r-jul-dogs', '2026-07-22', 'Carousel', 'Dog-friendly stays carousel', { series: 'We Thought Of That', views: 1338, reach: 568, likes: 38, comments: 1, shares: 2, saves: 3, care: 'People', persona: 'Sarah · The Considered Comfort Seeker' }),
    R('r-jul-tt-checkout', '2026-07-16', 'Video', '2pm checkout, a genuine guest benefit', { platform: 'tiktok', series: 'The 2pm Checkout', pillar: 'Free', views: 1243, reach: 1010, likes: 29, comments: 0, shares: 1, saves: 2, goal: 'Inform' }),
    R('r-jul-tt-2', '2026-07-23', 'Video', 'Room tour, lived-in edit', { platform: 'tiktok', views: 879, reach: 712, likes: 37, comments: 0, shares: 0, saves: 4 }),
    R('r-jul-tt-3', '2026-07-29', 'Video', 'We thought of that: kitchen details', { platform: 'tiktok', views: 828, reach: 670, likes: 23, comments: 0, shares: 0, saves: 2 })
  );
  realPosts.push(...sheetPosts);

  // Instagram feed posts + reels per month by format, Jan-Sep from the Content Volume tab.
  // October estimated (not in the sheet yet).
  const igFormats = {
    Video:    [8, 5, 5, 7, 7, 5, 4, 2, 2, 4],
    Carousel: [1, 2, 5, 5, 3, 1, 6, 11, 7, 6],
    Image:    [0, 2, 1, 1, 1, 0, 1, 0, 0, 2],
    Reel:     [8, 5, 5, 7, 7, 7, 4, 2, 2, 3]
  };

  const titleBank = {
    Relaxed: ['The Slow-Mo Edit: first coffee', 'Room to Breathe', '60 seconds of doing nothing', 'ASMR hotel morning', 'No alarm. No plan. Just this.'],
    Free: ['The Anti-Itinerary', 'One hotel, three different Tuesdays', 'Unpack With Me', 'Early checkout or 2pm lie-in?', 'A day that changed plan'],
    Connected: ['Borrowed From Locals', 'Around The Corner', 'Morning with the bakery regular', 'Our barista vs a tourist guide', 'Things locals are tired of explaining'],
    Inspired: ['Guest Diaries', 'Made By: the ceramics', 'One thing I\'m stealing from this stay', 'The Object Series: the rug', 'Made By: the lampshade'],
    Understood: ['We Thought Of That: the dog bowl', 'Designed Around You: the kitchen window', 'POV: You just checked in', 'We Thought Of That: USB by the bed', 'Checkout\'s at 2. No, really.']
  };
  const formats = { tiktok: ['Video', 'Carousel'] };
  const sources = ['In-house', 'In-house', 'In-house', 'Agency', 'Agency', 'Creator', 'Guest'];

  const posts = [];
  let counter = 0;
  for (let m = 0; m < 10; m++) {
    PLATFORMS.forEach(platform => {
      const real = realPosts.filter(p => p.platform === platform && Number(p.date.slice(5, 7)) - 1 === m);
      // Instagram: match the real monthly count of each format, less the real posts already listed
      const igSlots = [];
      if (platform === 'instagram') {
        Object.entries(igFormats).forEach(([f, counts]) => {
          const left = counts[m] - real.filter(p => p.format === f).length;
          for (let k = 0; k < left; k++) igSlots.push(f);
        });
      }
      const n = platform === 'instagram' ? igSlots.length : (m === 6 ? 5 - real.length : 6 + Math.floor(rand() * 4));
      const realViews = real.reduce((a, p) => a + p.views, 0);
      const remaining = Math.max(account[platform].views[m] - realViews, n * 200);
      const weights = [];
      const batch = [];
      for (let i = 0; i < n; i++) {
        const day = 1 + Math.floor(rand() * 28);
        const date = `2026-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const pillar = pick(PILLARS, [0.22, 0.2, 0.26, 0.16, 0.16]);
        const property = rand() < 0.12 ? null : pick(PROPERTIES, PROPERTY_WEIGHTS);
        const titles = titleBank[pillar];
        weights.push(Math.pow(rand(), 2) + 0.15);
        batch.push({
          id: `p${++counter}`,
          platform, date,
          format: platform === 'instagram' ? igSlots[i] : pick(formats[platform], [0.75, 0.25]),
          title: titles[Math.floor(rand() * titles.length)] + (property ? ` · ${property}` : ''),
          property, pillar,
          care: pick(CARES, [0.24, 0.24, 0.24, 0.14, 0.14]),
          goal: pick(GOALS, [0.35, 0.25, 0.15, 0.25]),
          persona: pick(PERSONAS, [0.22, 0.28, 0.14, 0.22, 0.14]),
          series: rand() < 0.45 ? pick(SERIES, [0.1, 0.2, 0.25, 0.2, 0.15, 0.1]) : null,
          source: sources[Math.floor(rand() * sources.length)],
          paid: rand() < 0.08
        });
      }
      const wSum = weights.reduce((a, b) => a + b, 0);
      const acc = account[platform];
      const realInt = real.reduce((a, p) => a + p.likes + p.comments + p.shares + p.saves, 0);
      const intRate = Math.max((acc.interactions[m] - realInt) / remaining, 0.02);
      batch.forEach((p, i) => {
        p.views = Math.round(remaining * weights[i] / wSum);
        // Real top posts from the reports stay on top: generated posts sit below the smallest one
        if (real.length) {
          const cap = Math.min(...real.map(r => r.views)) * 0.9;
          if (p.views > cap) p.views = Math.round(cap * (0.4 + 0.6 * rand()));
        }
        const inter = p.views * intRate * (0.7 + rand() * 0.6);
        p.likes = Math.round(inter * 0.78);
        p.comments = Math.round(inter * 0.04);
        p.shares = Math.round(inter * 0.08);
        p.saves = Math.round(inter * 0.1);
        p.reposts = Math.round(inter * 0.01);
        posts.push(p);
      });
      real.forEach(p => posts.push(Object.assign({}, p)));
    });
  }

  // Planned posts for November and December (calendar only)
  const planned = [
    ['2026-11-03', 'instagram', 'Reel', 'These soaps used to be… (Circular Christmas)', 'Chiswick', 'Inspired', 'xmas'],
    ['2026-11-05', 'tiktok', 'Video', 'Chiswick in 30 seconds: what to do nearby', 'Chiswick', 'Connected', null],
    ['2026-11-10', 'instagram', 'Carousel', 'Festive Chiswick shoot, part one', 'Chiswick', 'Understood', 'xmas'],
    ['2026-11-12', 'tiktok', 'Video', 'Belfast Christmas market guide', 'Belfast', 'Connected', null],
    ['2026-11-17', 'instagram', 'Reel', 'This ornament used to be…', null, 'Inspired', 'xmas'],
    ['2026-11-19', 'tiktok', 'Carousel', 'Southampton winter weekend', 'Southampton', 'Connected', null],
    ['2026-11-23', 'instagram', 'Image', 'Grand Opera House Belfast competition', 'Belfast', 'Connected', 'opera'],
    ['2026-11-25', 'instagram', 'Story', 'Kids Out Giving Tree is up', null, 'Connected', 'tree'],
    ['2026-11-28', 'instagram', 'Reel', 'York teaser', null, 'Understood', null],
    ['2026-12-01', 'instagram', 'Carousel', 'Gift bundle competition with partner brands', null, 'Connected', 'bundle'],
    ['2026-12-04', 'tiktok', 'Video', 'Winnie\'s Christmas menu, Belfast', 'Belfast', 'Relaxed', 'xmas'],
    ['2026-12-08', 'instagram', 'Reel', 'York visit', null, 'Understood', null],
    ['2026-12-15', 'instagram', 'Reel', 'Guest clips from festive stays', 'Chiswick', 'Understood', 'xmas']
  ].map((r, i) => ({ id: `plan${i}`, date: r[0], platform: r[1], format: r[2], title: r[3], property: r[4], pillar: r[5], campaign: r[6], planned: true }));

  posts.forEach(p => { p.campaign = campaignFor(p.date); });
  posts.sort((a, b) => a.date.localeCompare(b.date));

  // Derived per-post fields: reach, interactions, link clicks and attributed bookings
  posts.forEach(p => {
    p.reach = p.reach || Math.round(p.views * (p.platform === 'instagram' ? 0.72 : 0.81));
    p.interactions = p.likes + p.comments + p.shares + p.saves;
    const ctr = p.goal === 'Promote' ? 0.006 : p.goal === 'Inform' ? 0.0035 : 0.0018;
    p.clicks = p.clicksReal !== undefined ? p.clicksReal : Math.round(p.views * ctr * (p.id === 'ig-lamp' ? 0.9 : 1) + (rand() < 0.5 ? 1 : 0));
  });

  // ---------------------------------------------------------------
  // Website + booking engine per month and platform (illustrative)
  // ---------------------------------------------------------------
  const web = {};
  PLATFORMS.forEach(platform => {
    web[platform] = account[platform].linkTaps.map((clicks, m) => {
      const visits = Math.round(clicks * (0.86 + rand() * 0.06));
      const starts = Math.round(visits * (platform === 'instagram' ? 0.11 : 0.08) * (0.9 + rand() * 0.2));
      const bookings = Math.round(starts * (0.22 + rand() * 0.06));
      const revenue = Math.round(bookings * (310 + rand() * 60));
      const fold = Math.round(clicks * (m === 8 || m === 9 ? 0.07 : 0.03) * (0.9 + rand() * 0.2));
      return { clicks, visits, starts, bookings, revenue, fold };
    });
  });
  // Fold sign-ups by week across the relaunch (sparkline)
  const foldWeekly = [6, 5, 7, 6, 8, 7, 9, 12, 14, 19, 22, 24, 31, 27];

  // ---------------------------------------------------------------
  // Community (illustrative)
  // ---------------------------------------------------------------
  const inbox = [
    { id: 'm1', platform: 'instagram', type: 'Comment', post: 'ig-lamp', who: '@hannah.makes', text: 'Where can I buy one of these lamps?', received: '2026-11-08T09:12', theme: 'Shop & products' },
    { id: 'm2', platform: 'instagram', type: 'DM', post: null, who: '@tomandkit', text: 'Is there parking at Chiswick? Coming down for a week in December.', received: '2026-11-08T17:40', theme: 'Parking' },
    { id: 'm3', platform: 'tiktok', type: 'Comment', post: 'tt-belfast', who: '@ciaran.ni', text: 'do the rooms have a proper oven or just a hob?', received: '2026-11-09T08:05', theme: 'Kitchens' },
    { id: 'm4', platform: 'instagram', type: 'Comment', post: 'ig-yourstay', who: '@lucyontour', text: 'Can I bring my dog?', received: '2026-11-09T12:31', theme: 'Pets' },
    { id: 'm5', platform: 'instagram', type: 'DM', post: null, who: '@r.okafor', text: 'What time is check-out on Sundays?', received: '2026-11-09T20:02', theme: 'Check-out time' },
    { id: 'm6', platform: 'tiktok', type: 'Comment', post: 'tt-soton', who: '@solentsam', text: 'the market tip was spot on, thank you', received: '2026-11-10T10:16', theme: 'Praise' },
    { id: 'm7', platform: 'instagram', type: 'Comment', post: 'ig-lamp', who: '@greenhomes.uk', text: 'Would love to feature this, who made it?', received: '2026-11-10T14:48', theme: 'Shop & products' },
    { id: 'm8', platform: 'instagram', type: 'DM', post: null, who: '@jess_travels', text: 'Is the Belfast car park on site or nearby?', received: '2026-11-10T19:55', theme: 'Parking' },
    { id: 'm9', platform: 'tiktok', type: 'Comment', post: 'tt-lamp', who: '@miri.w', text: 'how long can you stay for? monthly rates?', received: '2026-11-11T07:30', theme: 'Long stays' },
    { id: 'm10', platform: 'instagram', type: 'Comment', post: 'ig-keleeci', who: '@kel.eeci', text: 'Had the best week here', received: '2026-11-11T09:02', theme: 'Praise' }
  ];
  const responseStats = { avgHours: [9.8, 8.4, 7.1, 6.5], within24: [71, 76, 82, 85] };
  const questions = [
    { theme: 'Parking', counts: [6, 8, 7, 11], example: 'Is there parking at Chiswick?' },
    { theme: 'Kitchens', counts: [5, 4, 6, 7], example: 'Do the rooms have a proper oven?' },
    { theme: 'Pets', counts: [3, 4, 4, 5], example: 'Can I bring my dog?' },
    { theme: 'Check-out time', counts: [4, 3, 5, 4], example: 'What time is check-out on Sundays?' },
    { theme: 'Shop & products', counts: [0, 1, 2, 14], example: 'Where can I buy one of these lamps?' },
    { theme: 'Long stays', counts: [3, 3, 2, 4], example: 'Do you do monthly rates?' }
  ];
  // Weekly sentiment share (%), weeks ending Sunday
  const sentiment = {
    weeks: ['14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct', '2 Nov', '9 Nov'],
    positive: [58, 61, 57, 60, 62, 64, 79, 74, 70],
    neutral: [35, 33, 36, 33, 31, 30, 18, 21, 24],
    negative: [7, 6, 7, 7, 7, 6, 3, 5, 6],
    examples: {
      positive: ['"This is the kind of hotel I actually want to stay in."', '"Obsessed with the lamp."', '"Spot on Southampton tips."'],
      neutral: ['"What time is check-out?"', '"Is this in London?"', '"Do you have a Leeds one?"'],
      negative: ['"Booking page kept timing out on mobile."', '"Price jumped when I added breakfast."']
    }
  };

  // ---------------------------------------------------------------
  // Partners (illustrative)
  // ---------------------------------------------------------------
  const agency = {
    name: 'Stay the Night',
    months: [
      { month: 7, contracted: { posts: 8, reels: 4, stories: 12, reports: 1 }, delivered: { posts: 8, reels: 3, stories: 12, reports: 1 }, onTime: 88 },
      { month: 8, contracted: { posts: 8, reels: 4, stories: 12, reports: 1 }, delivered: { posts: 7, reels: 4, stories: 10, reports: 1 }, onTime: 82 },
      { month: 9, contracted: { posts: 8, reels: 4, stories: 12, reports: 1 }, delivered: { posts: 8, reels: 4, stories: 12, reports: 1 }, onTime: 94 }
    ]
  };
  const creators = [
    { name: 'MadeBy', handle: '@madeby', type: 'Brand partner', date: '2026-10-21', status: 'Complete', reach: 249800, saves: 2100, shares: 6600, cost: 0, platform: 'instagram' },
    { name: 'Damian Smigalski', handle: '@damian.smigalski', type: 'Gifted stay', date: '2026-10-09', status: 'Complete', reach: 2230, saves: 12, shares: 4, cost: 0, platform: 'instagram' },
    { name: 'Keleeci', handle: '@kel.eeci', type: 'Gifted stay', date: '2026-10-15', status: 'Complete', reach: 1890, saves: 9, shares: 3, cost: 0, platform: 'instagram' },
    { name: 'Sage and Oats', handle: '@_sageandoats', type: 'Gifted stay', date: '2026-09-12', status: 'Complete', reach: 3762, saves: 29, shares: 18, cost: 0, platform: 'instagram' },
    { name: 'Belfast Blonde Foodie', handle: '@belfastblondefoodie', type: 'Gifted meal', date: '2025-12-10', status: 'Complete', reach: 8400, saves: 140, shares: 61, cost: 0, platform: 'instagram' },
    { name: 'Chiswick Mum', handle: '@chiswickmum', type: 'Gifted stay', date: '2026-11-18', status: 'Confirmed', reach: null, saves: null, shares: null, cost: 0, platform: 'instagram' },
    { name: 'North Coast Eats', handle: '@northcoasteats', type: 'Gifted stay', date: '2026-11-26', status: 'Confirmed', reach: null, saves: null, shares: null, cost: 0, platform: 'tiktok' },
    { name: 'Solent Weekends', handle: '@solentweekends', type: 'Paid + stay', date: '2026-12-05', status: 'Confirmed', reach: null, saves: null, shares: null, cost: 350, platform: 'tiktok' }
  ];
  const creatorsCompleteEarlier = 6; // completed before the ones listed, Jan to Sep
  const prStays = [
    { outlet: 'Hue & Cry: Belfast press stay', date: '2026-09-18', pieces: 3, reach: 41000, engagement: 1240 },
    { outlet: 'Familiarisation stay: travel writer, Chiswick', date: '2026-10-03', pieces: 2, reach: 18600, engagement: 610 },
    { outlet: 'Hue & Cry: festive gift guide placements', date: '2026-11-04', pieces: 4, reach: 27500, engagement: 820 }
  ];
  const guestContent = [
    { id: 'g1', handle: '@kel.eeci', property: 'Chiswick', date: '2026-10-15', desc: 'Reel of the studio, picks out the lampshade', status: 'Reshared' },
    { id: 'g2', handle: '@weekendwithwill', property: 'Belfast', date: '2026-10-26', desc: 'Story from Winnie\'s breakfast', status: 'Approved' },
    { id: 'g3', handle: '@annaandoak', property: 'Southampton', date: '2026-11-01', desc: 'Dog-friendly stay carousel', status: 'Requested' },
    { id: 'g4', handle: '@citybreakkate', property: 'Chiswick', date: '2026-11-06', desc: 'Kitchen time-lapse', status: 'Requested' },
    { id: 'g5', handle: '@marcus.r', property: 'Belfast', date: '2026-11-07', desc: 'View from the window seat', status: 'Declined' }
  ];


  // ---------------------------------------------------------------
  // Instagram follower growth tracker, financial year (Nov 2025 to Mar 2027).
  // Nov 2025 to Sep 2026 from the tracker sheet; Sep end-of-month and October from the October report.
  // ---------------------------------------------------------------
  const fy = {
    labels: ['Nov 25', 'Dec 25', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 27', 'Feb 27', 'Mar 27'],
    keys: ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'],
    start: 37635,
    goal: 60000,
    goalDate: '31 Mar 2027',
    followers: [37817, 38481, 38507, 40701, 40729, 40933, 42038, 41993, 41908, 42062, 42101, 42752],
    reach: [20290, 45879, 35176, 46013, 19367, 21989, 35409, 24605, 18108, 17943, 9605, null],
    engagements: [595, 2183, 877, 8164, 687, 1728, 872, 434, 644, 1096, 361, 26420],
    erByReach: [2.93, 4.76, 2.49, 17.74, 3.55, 7.86, 2.46, 1.76, 3.56, 6.11, 3.76, null],
    partial: { 10: 'Sep reach and engagements cover 1 to 28 Sep only' },
    // July followers use the July report (41,908; sheet 41,912). August uses the September report (42,101 less 39; sheet 42,082)
    highlights: [
      "Step into Winnie's with Chef Mathilde (video)",
      'WIN: 4x tickets to Belfast Grand Opera House',
      'Crochet a milk bottle holder',
      "WIN: The ultimate night (Valentine's, Islands Chocolate)",
      'Meet the maker behind the mirrors',
      'WIN: Two Yoto Players',
      "Did you hear this also? Winnie's Cafe",
      'Check-in video. Launch-prep quiet month',
      'Welcome to Second Nature. Rebrand launch',
      'WIN: Fancy making a night of it?',
      "Winnie's video, pets carousel",
      'This lamp used to be a flat white (MadeBy)'
    ],
    giveaway: [false, true, false, true, false, true, false, false, false, true, false, false]
  };

  // Content volume by month (Instagram exports). Nov-Dec 2025 exports had no reel data.
  const contentVolume = {
    labels: ['Nov 25', 'Dec 25', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep*'],
    video: [11, 3, 8, 5, 5, 7, 7, 5, 4, 2, 2],
    carousel: [1, 3, 1, 2, 5, 5, 3, 1, 6, 11, 7],
    image: [9, 13, 0, 2, 1, 1, 1, 0, 1, 0, 0],
    reels: [0, 0, 8, 5, 5, 7, 7, 7, 4, 2, 2],
    stories: [82, 54, 34, 48, 43, 35, 51, 27, 14, 71, 16],
    observations: [
      ['Story volume is a roller coaster', '82 in November, 14 in July, 71 in August, 16 in September. Stories have the strongest completion, so keeping them steady is the biggest lever.'],
      ['Reels have dropped sharply', '4 to 8 a month from January to July, then 2 in August and 2 in September. Reels are the discovery format, so this may be limiting new-follower reach.'],
      ['Content has become carousel-heavy', 'Carousels have the highest engagement rate per post (5.6% vs 3.2% for video), but they reach fewer non-followers than Reels.'],
      ['Volume matters', 'August returned to 86 pieces, nearly triple July, and was the first growth month since May.']
    ],
    caveat: 'Nov to Dec 2025 exports had no reel data, so some video posts may have been reels. September covers 1 to 28 Sep.'
  };

  // Default chart notes (team members can add more)
  const defaultNotes = [
    { id: 'n1', chart: 'views-trend', key: '2026-10', label: 'Oct', text: 'Lamp Reel with MadeBy, World Sustainability Day', author: 'Morgan', created: '2026-10-22', date: '2026-10-21' },
    { id: 'n2', chart: 'views-trend', key: '2026-07', label: 'Jul', text: 'Rebrand from room2 to Second Nature', author: 'Team', created: '2026-07-01', date: '2026-07-01' },
    { id: 'n4', chart: 'fy-followers', key: '2026-02', label: 'Feb', text: "Valentine's giveaway with Islands Chocolate, +2,194 followers", author: 'Team', created: '2026-03-01', date: '2026-02-02' },
    { id: 'n5', chart: 'fy-followers', key: '2026-05', label: 'May', text: "Winnie's Cafe video. Best organic month, +1,105", author: 'Team', created: '2026-06-01', date: '2026-05-11' },
    { id: 'n3', chart: 'sentiment', key: '26 Oct', label: '26 Oct', text: 'Positive share jumped with the lamp Reel', author: 'Morgan', created: '2026-10-27', date: '2026-10-26' }
  ];

  SN.data = {
    MONTHS, PLATFORMS, PROPERTIES, PILLARS, CARES, GOALS, PERSONAS, SERIES,
    account, goals, channels, campaigns, fy, contentVolume, posts, planned, web, foldWeekly,
    inbox, responseStats, questions, sentiment,
    agency, creators, creatorsCompleteEarlier, prStays, guestContent, defaultNotes,
    reportDate: '2026-11-11',
    reportSource: 'Second Nature Monthly Reports, July, September and October 2026',
    sheetSource: 'Instagram follower growth tracker (Nov 2025 to Sep 2026)'
  };
})();
