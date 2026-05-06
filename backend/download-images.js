const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

const perfumes = [
  { name: 'Bleu de Chanel', filename: 'bleu_de_chanel', url: 'https://fimgs.net/mdimg/perfume/375x500.9028.jpg' },
  { name: 'Sauvage Dior', filename: 'sauvage_dior', url: 'https://fimgs.net/mdimg/perfume/375x500.31861.jpg' },
  { name: 'Oud Wood', filename: 'oud_wood', url: 'https://fimgs.net/mdimg/perfume/375x500.1826.jpg' },
  { name: 'Aventus', filename: 'aventus', url: 'https://fimgs.net/mdimg/perfume/375x500.9828.jpg' },
  { name: 'Reflection Man', filename: 'reflection_man', url: 'https://fimgs.net/mdimg/perfume/375x500.920.jpg' },
  { name: 'Layton', filename: 'layton', url: 'https://fimgs.net/mdimg/perfume/375x500.39314.jpg' },
  { name: 'Naxos', filename: 'naxos', url: 'https://fimgs.net/mdimg/perfume/375x500.30529.jpg' },
  { name: 'Aqva Pour Homme', filename: 'aqva_pour_homme', url: 'https://fimgs.net/mdimg/perfume/375x500.153.jpg' },
  { name: "Terre d'Hermès", filename: 'terre_d_hermes', url: 'https://fimgs.net/mdimg/perfume/375x500.17.jpg' },
  { name: "L'Homme Idéal", filename: 'l_homme_ideal', url: 'https://fimgs.net/mdimg/perfume/375x500.25776.jpg' }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.fragrantica.com/'
      }
    }, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        if(response.statusCode === 301 || response.statusCode === 302) {
          download(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  const dir = path.join(__dirname, '../frontend-github/public/products');
  
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'essence_db'
  });

  await connection.query('DELETE FROM imagens_produto');

  const [rows] = await connection.query('SELECT id, nome FROM produtos');
  const dbProducts = rows.reduce((acc, row) => {
    acc[row.nome] = row.id;
    return acc;
  }, {});

  for (const p of perfumes) {
    if (!dbProducts[p.name]) {
      console.log(`⚠️ Produto não encontrado no BD: ${p.name}`);
      continue;
    }
    
    const dbId = dbProducts[p.name];
    const dest = path.join(dir, `${p.filename}.jpg`);
    console.log(`Baixando ${p.name}...`);
    try {
      await download(p.url, dest);
      
      const localUrl = `/products/${p.filename}.jpg`;
      await connection.query(
          'INSERT INTO imagens_produto (produto_id, url, principal) VALUES (?, ?, ?)',
          [dbId, localUrl, true]
      );
      console.log(`✅ ${p.name} salvo e registrado no banco!`);
    } catch (e) {
      console.error(`❌ Erro no ${p.name}:`, e);
    }
  }
  
  await connection.end();
  console.log("Concluído!");
}

main();
