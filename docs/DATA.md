# Data sources

The dashboard runs on sample data until the connectors are live. This is what each figure is based on.

## From the October 2026 monthly report

| Figure | October | September |
| --- | --- | --- |
| Instagram followers | 42,752 (+651) | 42,101 |
| Instagram views | 379.6K | 66.6K |
| Instagram interactions | 26.4K | 715 |
| Instagram shares / saves | 5.2K / 2.4K | 46 / 51 |
| Instagram profile visits | 4.9K | 1,853 |
| Instagram bio link taps | 892 | 214 |
| TikTok followers | 1,200 | |
| TikTok views | 6.2K | 7.1K |
| TikTok engagement rate | 2.71% | 3.04% |
| TikTok traffic from search | 34.8% | 29.9% (14.2% in August) |

Also from the report: the 2026 goals, the top posts (the MadeBy lamp Reel, the "Your stay" carousel, Keleeci's Chiswick Reel, the Southampton city guide and the Belfast room tour), the successes, improvements and actions, and the November and December plans (Circular Christmas, the Grand Opera House Belfast competition, the gift bundle competition, York).

## From the September 2026 monthly report

| Figure | September | August |
| --- | --- | --- |
| Instagram followers | 42,101 (+39) | +178 |
| Instagram views | 66,640 | 168.4K |
| Instagram interactions | 715 | 2,034 |
| Instagram engagement rate | 3.5% | 4.46% |
| Instagram likes / comments / shares / saves | 495 / 57 / 46 / 51 | |
| Profile visit to bio link tap | 11.5% | 12.9% |
| TikTok followers | 1,185 | |
| TikTok views / profile views | 7.1K / 578 | |
| TikTok engagement rate | 3.04% | 2.6% |
| TikTok traffic from search | 29.9% | 14.2% |
| Creator collaborations | 10 | 7 |

Also the September top posts (the @_sageandoats Belfast Reel and carousel, the Winnie's post, and the Belfast team's local recommendations TikTok).

The reports don't fully agree on August followers: July (41,908) + 178 = 42,086, but September (42,101) less 39 = 42,062. The dashboard uses 42,062.

## From the July 2026 monthly report

| Figure | July |
| --- | --- |
| Instagram followers | 41,908 (net loss of 84 during the rebrand) |
| Instagram engagement rate | 2.5% |
| Instagram reach | 27,298 |
| Instagram views | 79,683 organic + 52,419 boosted |
| Instagram profile visits / bio link taps | 1,931 / 195 |
| Launch Reel boost | 338 link clicks, 12 website purchases |
| TikTok followers | 1,035 (+40, five videos) |
| TikTok engagement rate / video views | 2.48% / 5.2K |
| TikTok traffic from search | 11% to 19% |

Also the July top posts (launch Reel, dog carousel, 2pm checkout TikTok). The July report says 19% search share for July while the October report gives 14.2% for August, so August reads as a dip.

## From the Instagram follower growth tracker (Google Sheet)

Nov 2025 to Sep 2026, Instagram only:

- End-of-month followers, net new, reach, engagements and engagement by reach
- Financial-year goal: 60,000 followers by 31 Mar 2027, from 37,635 on 1 Nov 2025
- Each month's top post and top reel (used as real posts in the dashboard)
- Content volume by month: video posts, carousels, images, reels, stories
- Growth-rate benchmarks and the content volume observations

September in the sheet covers 1 to 28 Sep only. The September follower count and interactions use the full-month figures from the October report instead. Views for Jan to Aug are estimated from reach (the tracker records reach, not views).

## From the Second Nature Social Media Strategy (Stay the Night)

- Personas: Hannah (The Rhythm Keeper), Ben (The Soft Explorer), Sarah (The Considered Comfort Seeker), Tom (The Connector), Maya (The Conscious Curator)
- Content pillars: Relaxed, Free, Connected, Inspired, Understood
- Content goals: Inspire, Connect, Promote, Inform
- Signature series used for tagging, e.g. Guest Diaries, Around The Corner, We Thought Of That, POV: You just checked in, The 2pm Checkout
- Channel roles: Instagram as The Editorial Home, TikTok as The Playground, with their KPIs
- End of 2026 goals, including profile visits (10,000), website clicks from Instagram (1,800), shares (800) and saves (300). The dashboard counts these from the July relaunch; change `sinceJuly` in `js/data.js` if they should count from January.

Posts from before the strategy were mapped onto the new pillars, goals and personas so the history lines up. Those tags are best guesses until the team tags posts.

## Illustrative until connected

| Area | Connector it will come from |
| --- | --- |
| TikTok January to August, Instagram views, profile visits and link taps before September | Instagram Graph API, TikTok Business API |
| Individual posts other than the monthly top posts (Instagram counts by format are real) | Instagram Graph API, TikTok Business API |
| Link clicks to bookings and revenue | UTM-tagged links, website analytics, booking engine |
| The Fold sign-ups | Membership platform |
| Inbox, response times, recurring questions, sentiment | Platform inbox APIs or a social inbox tool |
| Agency deliverables | Entered by the team on the Partners page |
| Creators, PR stays, guest content | Entered by the team, then platform tags and mentions |

Generated posts are scaled so each month adds up to the account totals above. A seeded random generator keeps the sample the same on every load.
