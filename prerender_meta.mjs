// After `vite build`: write a copy of index.html for each public page with that page's own
// title / description / canonical, so Google sees correct tags even before JavaScript runs.
import fs from 'fs';
import path from 'path';

const BASE = (process.env.SITE_URL || 'https://agriversllp.in').replace(/\/$/, '');
const dist = 'dist';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const pages = {
  'products': ['Mulching Sheet Products | Dharaa by AgriVerse LLP', 'Browse the Dharaa range of premium agricultural mulching sheets by AgriVerse LLP. Request a quote for farm, bulk and dealer orders.'],
  'about-us': ['About AgriVerse LLP | Mulching Sheet Manufacturer | Dharaa', 'AgriVerse LLP is a farmer-focused agricultural manufacturer. Dharaa is our brand of premium mulching sheets built from real field feedback.'],
  'contact-us': ['Contact AgriVerse LLP | Mulching Sheet Enquiries | Dharaa', 'Contact AgriVerse LLP for Dharaa mulching sheets: farm orders, bulk and dealer enquiries, quotes and product guidance.'],
  'general-enquiry': ['Enquire Now | Dharaa Mulching Sheets | AgriVerse LLP', 'Send an enquiry to AgriVerse LLP for Dharaa mulching sheets: price quote, free sample, bulk and dealer pricing.'],
};

for (const [route, [title, desc]] of Object.entries(pages)) {
  const url = `${BASE}/${route}`;
  let out = html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="twitter:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="twitter:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="twitter:description" content=")[^"]*"/, `$1${desc}"`);
  fs.mkdirSync(path.join(dist, route), { recursive: true });
  fs.writeFileSync(path.join(dist, route, 'index.html'), out);
}
console.log(`Wrote per-page meta for ${Object.keys(pages).length} pages.`);
