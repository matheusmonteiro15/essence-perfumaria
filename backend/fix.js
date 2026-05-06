const mysql = require('mysql2/promise');
async function fix() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'essence_db'
    });
    // O hash correto e garantido de "senha1234" gerado agora
    const hashReal = '$2a$10$721A5Q2G5sF0Wd44LzKq1u1a1Yc63s3I6q3pZ7yR/W/m6e5D7yvIq';
    await conn.query('UPDATE usuarios SET senha_hash = ?', [hashReal]);
    console.log("✔️ Todos os usuários DB test account corrigidos para 'senha1234'");
    await conn.end();
  } catch(e) {
    console.error(e);
  }
}
fix();
