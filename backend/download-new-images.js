require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const mysql = require('mysql2/promise');

const PRODUTOS = [
  { id: 18, file: 'jadore.jpg',                url: 'https://www.fragrantica.com/perfume/Christian-Dior/J-adore-1261.html' },
  { id: 19, file: 'miss_dior_blooming.jpg',    url: 'https://www.fragrantica.com/perfume/Christian-Dior/Miss-Dior-Blooming-Bouquet-1656.html' },
  { id: 20, file: 'leau_dissey.jpg',           url: 'https://www.fragrantica.com/perfume/Issey-Miyake/L-Eau-d-Issey-Pour-Homme-2127.html' },
  { id: 21, file: 'fahrenheit.jpg',            url: 'https://www.fragrantica.com/perfume/Christian-Dior/Fahrenheit-490.html' },
  { id: 22, file: 'kouros.jpg',                url: 'https://www.fragrantica.com/perfume/Yves-Saint-Laurent/Kouros-4476.html' },
  { id: 23, file: 'heat_beyonce.jpg',          url: 'https://www.fragrantica.com/perfume/Beyonce/Heat-7484.html' },
  { id: 24, file: 'fantasy_britney.jpg',       url: 'https://www.fragrantica.com/perfume/Britney-Spears/Fantasy-6108.html' },
  { id: 25, file: 'lovely_sjp.jpg',            url: 'https://www.fragrantica.com/perfume/Sarah-Jessica-Parker/Lovely-3490.html' },
  { id: 26, file: 'jardin_nil.jpg',            url: 'https://www.fragrantica.com/perfume/Hermes/Un-Jardin-sur-le-Nil-7.html' },
  { id: 27, file: 'green_tea_arden.jpg',       url: 'https://www.fragrantica.com/perfume/Elizabeth-Arden/Green-Tea-3034.html' },
  { id: 28, file: 'oud_ispahan.jpg',           url: 'https://www.fragrantica.com/perfume/Christian-Dior/Oud-Ispahan-20098.html' },
  { id: 29, file: 'memoir_man.jpg',            url: 'https://www.fragrantica.com/perfume/Amouage/Memoir-Man-10827.html' },
  { id: 30, file: 'tobacco_oud.jpg',           url: 'https://www.fragrantica.com/perfume/Tom-Ford/Tobacco-Oud-13494.html' },
  { id: 31, file: 'mitsouko.jpg',              url: 'https://www.fragrantica.com/perfume/Guerlain/Mitsouko-498.html' },
  { id: 32, file: 'habit_rouge.jpg',           url: 'https://www.fragrantica.com/perfume/Guerlain/Habit-Rouge-487.html' },
  { id: 33, file: 'eau_sauvage.jpg',           url: 'https://www.fragrantica.com/perfume/Christian-Dior/Eau-Sauvage-486.html' },
  { id: 34, file: 'cool_water.jpg',            url: 'https://www.fragrantica.com/perfume/Davidoff/Cool-Water-Man-2188.html' },
  { id: 35, file: 'polo_sport.jpg',            url: 'https://www.fragrantica.com/perfume/Ralph-Lauren/Polo-Sport-Man-3478.html' },
  { id: 36, file: 'davidoff_adventure.jpg',    url: 'https://www.fragrantica.com/perfume/Davidoff/Adventure-14058.html' },
  { id: 37, file: 'light_blue_dg.jpg',         url: 'https://www.fragrantica.com/perfume/Dolce-Gabbana/Light-Blue-Man-2437.html' },
  { id: 38, file: 'acqua_di_gio.jpg',          url: 'https://www.fragrantica.com/perfume/Giorgio-Armani/Acqua-di-Gio-Man-484.html' },
  { id: 39, file: 'boss_bottled.jpg',          url: 'https://www.fragrantica.com/perfume/Hugo-Boss/Boss-Bottled-489.html' },
  { id: 40, file: '4711_original.jpg',         url: 'https://www.fragrantica.com/perfume/4711/Original-Eau-de-Cologne-6753.html' },
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*',
        'Referer': 'https://www.fragrantica.com/'
      }
    }, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        if(response.statusCode === 301 || response.statusCode === 302) {
          download(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        response.pipe(file);
        file.on('finish', () => { file.close(resolve); });
      } else {
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', (err) => { fs.unlink(dest, () => reject(err)); });
  });
};

async function main() {
  const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'essence_db'
  });

  try {
    for (const p of PRODUTOS) {
      // Extrai o ID da Fragrantica da URL
      const match = p.url.match(/-(\d+)\.html$/);
      if (!match) {
        console.error(`ID não encontrado na URL: ${p.url}`);
        continue;
      }
      const fragId = match[1];
      const imgUrl = `https://fimgs.net/mdimg/perfume/375x500.${fragId}.jpg`;
      
      const dir = path.join(__dirname, '../frontend-github/public/products');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, p.file);
      
      console.log(`Baixando imagem para produto ID ${p.id} de ${imgUrl}...`);
      try {
          await download(imgUrl, dest);
          
          const localUrl = `/products/${p.file}`;
          // Atualizar o banco de dados
          await connection.query(
              `UPDATE imagens_produto SET url = ? WHERE produto_id = ? AND principal = 1`,
              [localUrl, p.id]
          );
          console.log(`✅ Imagem atualizada no banco para o produto ${p.id}`);
      } catch(e) {
          console.error(`❌ Falha ao baixar ${imgUrl}:`, e);
      }
    }
    
    console.log("✅ Todas as imagens baixadas e atualizadas no banco com sucesso!");

  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await connection.end();
  }
}

main();
