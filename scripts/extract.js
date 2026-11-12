/*
 * In-page extractors used by fetch-updates.mjs. Each runs inside the rendered
 * page (Playwright page.evaluate) and returns [{ date, title, url, tags }].
 * Kept separate so they can be tested in any browser console.
 */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATE_RE = /(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (20\d\d)/;

function toIso(text) {
  const m = DATE_RE.exec(text || '');
  if (!m) return null;
  return `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
}

// about.instagram.com/blog: each post card holds tags (#PRODUCT), a title and a date
function extractInstagramBlog() {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.href;
    if (!/about\.instagram\.com\/blog\/(announcements|tips-and-tricks|[a-z-]+)\/[a-z0-9-]{8,}|creators\.instagram\.com\/blog\/[a-z0-9-]{8,}/.test(href)) return;
    if (seen.has(href)) return;
    let card = a;
    let date = null;
    for (let i = 0; i < 6 && card; i++) {
      card = card.parentElement;
      if (card && DATE_RE.test(card.innerText)) { date = toIso(card.innerText); break; }
    }
    if (!date) return;
    const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const tags = lines.filter(l => l.startsWith('#')).map(l => l.slice(1).toLowerCase());
    const title = lines.filter(l => !l.startsWith('#') && !DATE_RE.test(l) && l.length > 12).sort((x, y) => y.length - x.length)[0];
    if (!title) return;
    seen.add(href);
    out.push({ date, title: title.replace(/\s*↗$/, ''), url: href, tags });
  });
  return out;
}

// instagram.com/popular/instagrams-latest-updates: a summary paragraph that names a date
function extractInstagramPopular() {
  const text = document.body.innerText;
  const para = text.split('\n').find(l => /^Instagram (announced|launched|introduced|is testing|tested|rolled out)/i.test(l.trim()) && DATE_RE.test(l));
  if (!para) return [];
  const date = toIso(para);
  const first = para.split(/(?<=\.)\s/)[0].replace(/\s*\.\.\.\s*more$/, '');
  return [{ date, title: first, summary: para.replace(/\s*\.\.\.\s*more$/, '').slice(0, 400), url: location.href.split('?')[0], tags: ['product'] }];
}

// newsroom.tiktok.com: article links with a date nearby
function extractTikTokNewsroom() {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href]').forEach(a => {
    if (!/newsroom\.tiktok\.com\/[a-z0-9-]{12,}/.test(a.href)) return;
    const url = a.href.split('?')[0];
    const title = a.innerText.replace(/\s+/g, ' ').trim();
    if (title.length < 20 || seen.has(url)) return;
    let el = a;
    let date = null;
    for (let i = 0; i < 6 && el; i++) {
      el = el.parentElement;
      if (el && DATE_RE.test(el.innerText)) { date = toIso(el.innerText); break; }
    }
    if (!date) return;
    seen.add(url);
    out.push({ date, title, url, tags: [] });
  });
  return out;
}

if (typeof module !== 'undefined') module.exports = { extractInstagramBlog, extractInstagramPopular, extractTikTokNewsroom, toIso, DATE_RE, MONTHS };
