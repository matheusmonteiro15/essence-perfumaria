const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

const newPerfumes = [
  { 
    nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', categoria: 'Alta Perfumaria', familia: 'Gourmand',
    preco: 2900.00, estoque: 15, desc: 'Doce e inebriante', ingr: 'Açafrão, Jasmim', ocasiao: 'Eventos de Luxo',
    topo: 'Açafrão, Jasmim', coracao: 'Madeira de Âmbar', base: 'Resina de Abeto, Cedro',
    filename: 'baccarat_rouge', url: 'https://fimgs.net/mdimg/perfume/375x500.33519.jpg' 
  },
  { 
    nome: 'Blue Seduction', marca: 'Antonio Banderas', categoria: 'Celebrity', familia: 'Aquático',
    preco: 250.00, estoque: 100, desc: 'Fresco e descontraído', ingr: 'Melão, Bergamota', ocasiao: 'Dia a Dia',
    topo: 'Melão, Bergamota', coracao: 'Água do Mar, Maçã Verde', base: 'Âmbar, Almíscar',
    filename: 'blue_seduction', url: 'https://fimgs.net/mdimg/perfume/375x500.1408.jpg' 
  },
  { 
    nome: 'Verveine', marca: "L'Occitane", categoria: 'Natural/Orgânico', familia: 'Cítrico Aromático',
    preco: 450.00, estoque: 60, desc: 'Cítrico energizante orgânico', ingr: 'Verbena, Limão', ocasiao: 'Manhã / Sol',
    topo: 'Limão, Laranja', coracao: 'Verbena, Petitgrain', base: 'Rosa, Gerânio',
    filename: 'verveine', url: 'https://fimgs.net/mdimg/perfume/375x500.3168.jpg' 
  },
  { 
    nome: 'Black Orchid', marca: 'Tom Ford', categoria: 'Exótico', familia: 'Oriental Especiado',
    preco: 1400.00, estoque: 20, desc: 'A excentricidade da orquídea negra', ingr: 'Trufa, Ylang-Ylang', ocasiao: 'Noite / Festas',
    topo: 'Trufa, Gardênia', coracao: 'Orquídea, Especiarias', base: 'Chocolate Mexicano, Patchouli',
    filename: 'black_orchid', url: 'https://fimgs.net/mdimg/perfume/375x500.1018.jpg' 
  },
  { 
    nome: 'Chanel No 5', marca: 'Chanel', categoria: 'Vintage', familia: 'Floral Branco',
    preco: 1350.00, estoque: 40, desc: 'O maior clássico vintage da história', ingr: 'Aldeídos, Ylang-Ylang', ocasiao: 'Eventos Formais',
    topo: 'Aldeídos, Neroli', coracao: 'Jasmim, Rosa', base: 'Sândalo, Baunilha',
    filename: 'chanel_5', url: 'https://fimgs.net/mdimg/perfume/375x500.608.jpg' 
  },
  { 
    nome: 'Allure Homme Sport', marca: 'Chanel', categoria: 'Esportivo', familia: 'Cítrico Aromático',
    preco: 950.00, estoque: 75, desc: 'A energia do movimento', ingr: 'Laranja, Aldeídos', ocasiao: 'Esportes / Academia',
    topo: 'Laranja, Notas Oceânicas', coracao: 'Pimenta, Néroli', base: 'Fava Tonka, Almíscar Branco',
    filename: 'allure_sport', url: 'https://fimgs.net/mdimg/perfume/375x500.607.jpg' 
  },
  { 
    nome: 'CK One', marca: 'Calvin Klein', categoria: 'Casual', familia: 'Cítrico Aromático',
    preco: 320.00, estoque: 150, desc: 'Casual e atemporal', ingr: 'Limão, Notas Verdes', ocasiao: 'Trabalho / Passeio',
    topo: 'Limão, Bergamota', coracao: 'Lírio-do-Vale, Jasmim', base: 'Almíscar, Cedro',
    filename: 'ck_one', url: 'https://fimgs.net/mdimg/perfume/375x500.276.jpg' 
  }
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

async function getId(connection, table, name) {
  const [rows] = await connection.query(`SELECT id FROM ${table} WHERE nome = ? LIMIT 1`, [name]);
  if (rows.length > 0) return rows[0].id;
  // insert if not found
  const [result] = await connection.query(`INSERT INTO ${table} (nome) VALUES (?)`, [name]);
  return result.insertId;
}

async function main() {
  const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'essence_db'
  });

  try {
    for (const p of newPerfumes) {
      console.log(`Injetando ${p.nome}...`);
      
      const marca_id = await getId(connection, 'marcas', p.marca);
      const categoria_id = await getId(connection, 'categorias', p.categoria);
      const familia_id = await getId(connection, 'familias_olfativas', p.familia);

      const [prodRes] = await connection.query(
        `INSERT IGNORE INTO produtos (nome, marca_id, categoria_id, familia_olfativa_id, preco, estoque_qtd, ativo, descricao, ingredientes, ocasiao_ideal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.nome, marca_id, categoria_id, familia_id, p.preco, p.estoque, true, p.desc, p.ingr, p.ocasiao]
      );
      
      let produto_id = prodRes.insertId;
      if (produto_id === 0) {
          // already exists
          const [exist] = await connection.query('SELECT id FROM produtos WHERE nome = ?', [p.nome]);
          produto_id = exist[0].id;
      }

      await connection.query(
        `INSERT IGNORE INTO notas_olfativas (produto_id, topo, coracao, base) VALUES (?, ?, ?, ?)`,
        [produto_id, p.topo, p.coracao, p.base]
      );

      const dir = path.join(__dirname, '../frontend-github/public/products');
      const dest = path.join(dir, `${p.filename}.jpg`);
      
      console.log(`Baixando imagem para ${p.nome}...`);
      await download(p.url, dest);
      
      const localUrl = `/products/${p.filename}.jpg`;
      await connection.query(
          `INSERT IGNORE INTO imagens_produto (produto_id, url, principal) VALUES (?, ?, ?)`,
          [produto_id, localUrl, true]
      );
    }
    
    console.log("✅ Todos os perfumes adicionados com sucesso!");

  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await connection.end();
  }
}

main();
