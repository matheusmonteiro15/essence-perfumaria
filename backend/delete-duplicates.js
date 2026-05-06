const mysql = require('mysql2/promise');
require('dotenv').config();

async function clean() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: 'essence_db'
  });
  
  // Para cada nome, mantém apenas o menor ID (o primeiro inserido)
  await c.query(`
    DELETE p1 FROM produtos p1
    INNER JOIN produtos p2 
    WHERE p1.id > p2.id AND p1.nome = p2.nome
  `);
  
  console.log("Duplicatas removidas.");
  c.end();
}

clean();
