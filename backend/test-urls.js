const axios = require('axios');

const urls = [
  'https://fimgs.net/mdimg/perfume/375x500.9028.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.31861.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.1826.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.9828.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.920.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.39314.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.30529.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.153.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.17.jpg',
  'https://fimgs.net/mdimg/perfume/375x500.25776.jpg'
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
