require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function cloneDatabase() {
    console.log("Iniciando o processo de clonagem do banco...");
    
    try {
        console.log("1. Conectando ao banco LOCAL (Origem)...");
        const local = await mysql.createConnection({
            host: '127.0.0.1', 
            port: 3306,
            user: 'root', 
            password: 'Matheus123.', 
            database: 'essence_db'
        });

        console.log("2. Conectando ao banco AIVEN (Destino)...");
        const remote = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
            multipleStatements: true
        });

        console.log("3. Recriando a estrutura das tabelas no Aiven (defaultdb)...");
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Remove CREATE DATABASE e USE para rodar direto no defaultdb
        schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS essence_db;/g, '');
        schemaSql = schemaSql.replace(/USE essence_db;/g, '');
        // Adiciona IF NOT EXISTS nas tabelas para não dar erro
        schemaSql = schemaSql.replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ');
        await remote.query(schemaSql);

        // Ordem importa por causa das chaves estrangeiras (Foreign Keys)
        const tables = [
            'usuarios', 'enderecos', 'marcas', 'familias_olfativas', 'categorias', 
            'produtos', 'produto_variacoes', 'imagens_produto', 'notas_olfativas', 
            'carrinho', 'itens_carrinho', 'cupons', 'favoritos', 'vendas', 'itens_venda'
        ];

        console.log("4. Copiando os dados (Isso pode levar alguns segundos)...");
        
        // Desativa a checagem de chave estrangeira temporariamente para facilitar o insert
        await remote.query('SET FOREIGN_KEY_CHECKS=0;');

        for (const table of tables) {
            const [rows] = await local.query(`SELECT * FROM ${table}`);
            if (rows.length === 0) continue;
            
            console.log(`   -> Copiando ${rows.length} registros da tabela '${table}'...`);
            
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(',');
            
            for (const row of rows) {
                const values = columns.map(c => row[c]);
                await remote.query(`INSERT IGNORE INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`, values);
            }
        }
        
        // Reativa checagem de chaves
        await remote.query('SET FOREIGN_KEY_CHECKS=1;');

        console.log("🎉 CLONAGEM CONCLUÍDA COM SUCESSO! O Aiven agora é um espelho do seu PC.");
        
        await local.end();
        await remote.end();
        process.exit(0);
        
    } catch (error) {
        console.error("❌ ERRO NA CLONAGEM:", error);
        process.exit(1);
    }
}

cloneDatabase();
