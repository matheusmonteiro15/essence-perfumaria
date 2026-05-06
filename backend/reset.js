const db = require('./src/config/database');

async function resetDB() {
  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const [tables] = await db.query('SHOW TABLES');
    const dbName = 'essence_db'; // Change this if needed based on the key returned by SHOW TABLES
    const tableKey = Object.keys(tables[0])[0];
    
    for (const table of tables) {
      await db.query(`DROP TABLE IF EXISTS \`${table[tableKey]}\``);
      console.log(`Dropped table ${table[tableKey]}`);
    }
    
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database reset complete.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

resetDB();
