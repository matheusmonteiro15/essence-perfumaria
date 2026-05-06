require('dotenv').config();
const puppeteer = require('puppeteer');
const mysql2 = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const IMAGE_DIR = path.join(__dirname, '..', 'frontend-github', 'public', 'products');
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });

const PRODUTOS = [
  { id: 18, file: 'jadore.jpg',             url: 'https://www.fragrantica.com/perfume/Christian-Dior/J-adore-1261.html' },
  { id: 19, file: 'miss_dior_blooming.jpg', url: 'https://www.fragrantica.com/perfume/Christian-Dior/Miss-Dior-Blooming-Bouquet-1656.html' },
  { id: 20, file: 'leau_dissey.jpg',        url: 'https://www.fragrantica.com/perfume/Issey-Miyake/L-Eau-d-Issey-Pour-Homme-2127.html' },
  { id: 21, file: 'fahrenheit.jpg',         url: 'https://www.fragrantica.com/perfume/Christian-Dior/Fahrenheit-490.html' },
  { id: 22, file: 'kouros.jpg',             url: 'https://www.fragrantica.com/perfume/Yves-Saint-Laurent/Kouros-4476.html' },
  { id: 23, file: 'heat_beyonce.jpg',       url: 'https://www.fragrantica.com/perfume/Beyonce/Heat-7484.html' },
  { id: 24, file: 'fantasy_britney.jpg',    url: 'https://www.fragrantica.com/perfume/Britney-Spears/Fantasy-6108.html' },
  { id: 25, file: 'lovely_sjp.jpg',         url: 'https://www.fragrantica.com/perfume/Sarah-Jessica-Parker/Lovely-3490.html' },
  { id: 26, file: 'jardin_nil.jpg',         url: 'https://www.fragrantica.com/perfume/Hermes/Un-Jardin-sur-le-Nil-7.html' },
  { id: 27, file: 'green_tea_arden.jpg',    url: 'https://www.fragrantica.com/perfume/Elizabeth-Arden/Green-Tea-3034.html' },
  { id: 28, file: 'oud_ispahan.jpg',        url: 'https://www.fragrantica.com/perfume/Christian-Dior/Oud-Ispahan-20098.html' },
  { id: 29, file: 'memoir_man.jpg',         url: 'https://www.fragrantica.com/perfume/Amouage/Memoir-Man-10827.html' },
  { id: 30, file: 'tobacco_oud.jpg',        url: 'https://www.fragrantica.com/perfume/Tom-Ford/Tobacco-Oud-13494.html' },
  { id: 31, file: 'mitsouko.jpg',           url: 'https://www.fragrantica.com/perfume/Guerlain/Mitsouko-498.html' },
  { id: 32, file: 'habit_rouge.jpg',        url: 'https://www.fragrantica.com/perfume/Guerlain/Habit-Rouge-487.html' },
  { id: 33, file: 'eau_sauvage.jpg',        url: 'https://www.fragrantica.com/perfume/Christian-Dior/Eau-Sauvage-486.html' },
  { id: 34, file: 'cool_water.jpg',         url: 'https://www.fragrantica.com/perfume/Davidoff/Cool-Water-Man-2188.html' },
  { id: 35, file: 'polo_sport.jpg',         url: 'https://www.fragrantica.com/perfume/Ralph-Lauren/Polo-Sport-Man-3478.html' },
  { id: 36, file: 'davidoff_adventure.jpg', url: 'https://www.fragrantica.com/perfume/Davidoff/Adventure-14058.html' },
  { id: 37, file: 'light_blue_dg.jpg',      url: 'https://www.fragrantica.com/perfume/Dolce-Gabbana/Light-Blue-Man-2437.html' },
  { id: 38, file: 'acqua_di_gio.jpg',       url: 'https://www.fragrantica.com/perfume/Giorgio-Armani/Acqua-di-Gio-Man-484.html' },
  { id: 39, file: 'boss_bottled.jpg',       url: 'https://www.fragrantica.com/perfume/Hugo-Boss/Boss-Bottled-489.html' },
  { id: 40, file: '4711_original.jpg',      url: 'https://www.fragrantica.com/perfume/4711/Original-Eau-de-Cologne-6753.html' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function baixarImagem(url, destino) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destino);
    proto.get(url, { headers: { 'Referer': 'https://www.fragrantica.com/' } }, (res) => {
      if (res.statusCode !== 200) { file.close(); return resolve(false); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => resolve(false));
  });
}

async function rasparComPuppeteer(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000 + Math.random() * 1500);

  return page.evaluate(() => {
    // Imagem principal
    let imgUrl = '';
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      const src = img.src || img.getAttribute('data-src') || '';
      if (src.includes('fimgs.net') && src.includes('375x500')) { imgUrl = src; break; }
    }
    if (!imgUrl) {
      for (const img of imgs) {
        const src = img.src || '';
        if (src.includes('fimgs.net')) { imgUrl = src; break; }
      }
    }

    // Descrição
    let descricao = '';
    const descEls = document.querySelectorAll('[itemprop="description"] p, .mainContent p, div.cell p');
    for (const el of descEls) {
      const t = el.innerText?.trim();
      if (t && t.length > 50) { descricao = t.substring(0, 400); break; }
    }

    // Notas olfativas (top, heart, base)
    const notas = { topo: [], coracao: [], base: [] };
    const notaBoxes = document.querySelectorAll('div#pyramid div, .noteItem');
    notaBoxes.forEach(box => {
      const h = box.querySelector('h4, h5, strong, b')?.innerText?.toLowerCase() || '';
      const spans = [...box.querySelectorAll('span')].map(s => s.innerText?.trim()).filter(Boolean);
      if (h.includes('top') || h.includes('topo')) notas.topo = spans;
      else if (h.includes('heart') || h.includes('meio') || h.includes('coração')) notas.coracao = spans;
      else if (h.includes('base')) notas.base = spans;
    });

    return { imgUrl, descricao, notas };
  });
}

async function main() {
  const db = await mysql2.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'essence_db',
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });

  console.log('🚀 Iniciando scraping de', PRODUTOS.length, 'produtos da Fragrantica...\n');

  for (const produto of PRODUTOS) {
    console.log(`\n🔍 [${produto.id}] ${produto.url.split('/').slice(-1)[0]}`);
    try {
      const dados = await rasparComPuppeteer(page, produto.url);

      // Baixa imagem
      const destino = path.join(IMAGE_DIR, produto.file);
      const baixou = await baixarImagem(dados.imgUrl, destino);
      console.log(`  🖼️  Imagem: ${baixou ? '✅ ' + produto.file : '❌ falhou (' + dados.imgUrl.substring(0, 40) + ')'}`);

      // Atualiza banco
      const ingredientes = [...(dados.notas.topo || []), ...(dados.notas.coracao || []), ...(dados.notas.base || [])].join(', ');
      if (dados.descricao) {
        await db.query('UPDATE produtos SET descricao = ?, ingredientes = ? WHERE id = ?',
          [dados.descricao, ingredientes || 'Não informado', produto.id]);
        console.log(`  📝 Descrição atualizada.`);
      }

      if (baixou) {
        await db.query('UPDATE imagens_produto SET url = ? WHERE produto_id = ? AND principal = TRUE',
          [`/products/${produto.file}`, produto.id]);
        console.log(`  💾 Imagem no banco: /products/${produto.file}`);
      }

    } catch (e) {
      console.log(`  ❌ Erro: ${e.message}`);
    }

    const espera = 3500 + Math.random() * 2000;
    console.log(`  ⏳ Aguardando ${Math.round(espera / 1000)}s...`);
    await sleep(espera);
  }

  await browser.close();
  await db.end();
  console.log('\n🎉 Scraping concluído! Verifique os produtos no site.');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
