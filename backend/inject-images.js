require('dotenv').config();
const mysql = require('mysql2/promise');

async function injectImages() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'essence_db'
        });

        // Mapeamento dos 10 produtos para as 5 imagens (2 produtos por imagem)
        const mappings = [
            { id: 1, url: '/products/perfume_bleu.png' }, // Bleu de Chanel
            { id: 2, url: '/products/perfume_bleu.png' }, // Sauvage Dior
            { id: 3, url: '/products/perfume_wood.png' }, // Oud Wood
            { id: 4, url: '/products/perfume_classic.png' }, // Aventus
            { id: 5, url: '/products/perfume_classic.png' }, // Reflection Man
            { id: 6, url: '/products/perfume_wood.png' }, // Layton
            { id: 7, url: '/products/perfume_gold.png' }, // Naxos
            { id: 8, url: '/products/perfume_fresh.png' }, // Aqva Pour Homme
            { id: 9, url: '/products/perfume_wood.png' }, // Terre d'Hermes
            { id: 10, url: '/products/perfume_gold.png' }, // L'Homme Ideal
        ];

        // Limpa a tabela antes de inserir
        await connection.query('DELETE FROM imagens_produto');

        for (const map of mappings) {
            await connection.query(
                'INSERT INTO imagens_produto (produto_id, url, principal) VALUES (?, ?, ?)',
                [map.id, map.url, true]
            );
        }

        console.log("✅ Imagens injetadas com sucesso!");
        await connection.end();
    } catch (error) {
        console.error("Erro:", error);
    }
}

injectImages();
