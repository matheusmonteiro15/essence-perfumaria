const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: 'essence_db'
  });
  
  try {
    await c.query(
      `INSERT INTO produtos (id, nome, marca_id, categoria_id, familia_olfativa_id, preco, estoque_qtd, ativo, descricao, ingredientes, ocasiao_ideal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [14, 'Black Orchid', 3, 7, 5, 1400.00, 20, true, 'A excentricidade da orquídea negra', 'Trufa, Ylang-Ylang', 'Noite / Festas']
    );
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
  c.end();
}
test();
