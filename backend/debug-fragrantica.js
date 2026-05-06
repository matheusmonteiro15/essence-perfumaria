require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function debug() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const url = 'https://www.fragrantica.com/perfume/Christian-Dior/Fahrenheit-490.html';
  console.log('Abrindo:', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot para ver o que carregou
  await page.screenshot({ path: 'debug-fragrantica.png', fullPage: false });
  console.log('Screenshot salvo: debug-fragrantica.png');

  // Inspeciona todas as imagens
  const resultado = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map(img => ({
      src: img.src,
      dataSrc: img.getAttribute('data-src'),
      alt: img.alt,
      class: img.className,
    }));
    return {
      titulo: document.title,
      allImgs: imgs.filter(i => i.src || i.dataSrc),
      fimgsImgs: imgs.filter(i => (i.src || '').includes('fimgs') || (i.dataSrc || '').includes('fimgs')),
      bodyHTML: document.body.innerHTML.substring(0, 3000),
    };
  });

  console.log('\n=== TÍTULO ===');
  console.log(resultado.titulo);

  console.log('\n=== IMAGENS FIMGS.NET ===');
  if (resultado.fimgsImgs.length === 0) {
    console.log('Nenhuma imagem fimgs.net encontrada!');
    console.log('\n=== TODAS AS IMAGENS ===');
    resultado.allImgs.slice(0, 20).forEach(img => {
      console.log('src:', img.src?.substring(0, 80));
      console.log('data-src:', img.dataSrc?.substring(0, 80));
      console.log('alt:', img.alt);
      console.log('---');
    });
  } else {
    resultado.fimgsImgs.forEach(img => {
      console.log('src:', img.src);
      console.log('data-src:', img.dataSrc);
      console.log('alt:', img.alt);
      console.log('---');
    });
  }

  console.log('\n=== INÍCIO DO BODY HTML ===');
  console.log(resultado.bodyHTML);

  fs.writeFileSync('debug-result.json', JSON.stringify(resultado, null, 2));
  console.log('\nResultado completo salvo em debug-result.json');

  await browser.close();
}

debug().catch(e => { console.error('Erro:', e.message); process.exit(1); });
