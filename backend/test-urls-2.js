const axios = require('axios');

const urls = [
  'https://fimgs.net/mdimg/perfume/375x500.33519.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.1408.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.3168.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.1018.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.608.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.607.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.276.jpg'
];

async function check() {
  for (const u of urls) {
    try {
      const res = await axios.head(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[OK] ${u} - ${res.status}`);
    } catch (e) {
      console.log(`[FAIL] ${u} - ${e.message}`);
    }
  }
}

check();
