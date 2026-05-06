const mysql = require('mysql2/promise');

const NOTAS = {
  11: { topo: 'Laranja, Notas Oceânicas', coracao: 'Pimenta, Néroli', base: 'Fava Tonka, Almíscar Branco' },
  12: { topo: 'Açafrão, Jasmim', coracao: 'Madeira de Âmbar', base: 'Resina de Abeto, Cedro' },
  13: { topo: 'Trufa, Gardênia', coracao: 'Orquídea, Especiarias', base: 'Chocolate Mexicano, Patchouli' },
  14: { topo: 'Melão, Bergamota', coracao: 'Água do Mar, Maçã Verde', base: 'Âmbar, Almíscar' },
  15: { topo: 'Aldeídos, Neroli', coracao: 'Jasmim, Rosa', base: 'Sândalo, Baunilha' },
  16: { topo: 'Limão, Bergamota', coracao: 'Lírio-do-Vale, Jasmim', base: 'Almíscar, Cedro' },
  17: { topo: 'Limão, Laranja', coracao: 'Verbena, Petitgrain', base: 'Rosa, Gerânio' },
  18: { topo: 'Pera, Melão, Magnólia', coracao: 'Tuberosa, Jasmim, Rosa', base: 'Almíscar, Baunilha, Cedro' },
  19: { topo: 'Mandarina Siciliana', coracao: 'Peônia Rosa, Rosa Damascena', base: 'Almíscar Branco' },
  20: { topo: 'Yuzu, Limão, Sálvia', coracao: 'Lótus azul, Noz-moscada', base: 'Vetiver, Almíscar, Sândalo' },
  21: { topo: 'Noz-moscada, Lavanda, Cedro', coracao: 'Folha de Violeta, Jasmim', base: 'Couro, Vetiver, Âmbar' },
  22: { topo: 'Aldeídos, Sálvia, Coentro', coracao: 'Patchouli, Cravo, Gerânio', base: 'Civeta, Mel, Couro' },
  23: { topo: 'Maracujá, Laranja Sanguínea', coracao: 'Orquídea Negra, Hibisco', base: 'Âmbar, Madeira de Teca' },
  24: { topo: 'Kiwi, Lichia Vermelha', coracao: 'Chocolate Branco, Cupcake, Orquídea', base: 'Almíscar, Raízes de Íris' },
  25: { topo: 'Lavanda, Bergamota, Tangerina', coracao: 'Patchouli, Orquídea', base: 'Almíscar, Cedro, Âmbar Branco' },
  26: { topo: 'Folhas Verdes, Bergamota', coracao: 'Vitória-Régia, Jasmim', base: 'Cedro, Musgo de Carvalho' },
  27: { topo: 'Limão, Bergamota, Hortelã', coracao: 'Chá Verde, Jasmim, Erva-Doce', base: 'Musgo de Carvalho, Âmbar' },
  28: { topo: 'Ládano', coracao: 'Rosa, Patchouli', base: 'Oud, Sândalo, Rosa' },
  29: { topo: 'Limão, Bergamota', coracao: 'Rosa de Damasco, Gerânio', base: 'Oud, Âmbar, Almíscar' },
  30: { topo: 'Uísque', coracao: 'Canela, Coentro, Notas Especiadas', base: 'Oud, Tabaco, Sândalo, Patchouli' },
  31: { topo: 'Cítricos, Jasmim, Bergamota', coracao: 'Pêssego, Ylang-Ylang, Rosa', base: 'Musgo de Carvalho, Especiarias, Vetiver' },
  32: { topo: 'Limão, Laranja Amarga, Bergamota', coracao: 'Rosa, Cravo, Sândalo', base: 'Couro, Baunilha, Benjoim' },
  33: { topo: 'Limão, Bergamota, Manjericão', coracao: 'Vetiver, Rosa, Jasmim', base: 'Musgo de Carvalho, Âmbar, Almíscar' },
  34: { topo: 'Água do Mar, Lavanda, Hortelã', coracao: 'Sândalo, Jasmim, Néroli', base: 'Almíscar, Musgo de Carvalho, Tabaco' },
  35: { topo: 'Menta, Limão, Bergamota', coracao: 'Gengibre, Pau-Brasil, Rosa', base: 'Almíscar, Sândalo, Cedro' },
  36: { topo: 'Tangerina, Pimenta, Limão', coracao: 'Gergelim, Pimentão', base: 'Vetiver, Cedro, Almíscar Branco' },
  37: { topo: 'Limão Siciliano, Maçã, Cedro', coracao: 'Bambu, Jasmim, Rosa Branca', base: 'Cedro, Almíscar, Âmbar' },
  38: { topo: 'Lima, Limão, Bergamota, Jasmim', coracao: 'Notas Oceânicas, Pêssego, Frésia', base: 'Almíscar Branco, Cedro, Musgo de Carvalho' },
  39: { topo: 'Maçã, Ameixa, Bergamota', coracao: 'Canela, Mogno, Cravo', base: 'Baunilha, Sândalo, Cedro' },
  40: { topo: 'Limão, Bergamota, Laranja', coracao: 'Lavanda, Alecrim', base: 'Néroli, Petitgrain' }
};

const CATEGORIAS_REMAKE = {
  1: 1,  // Bleu de Chanel -> Alta Perfumaria
  2: 1,  // Sauvage Dior -> Alta Perfumaria
  8: 10, // Aqva Pour Homme -> Casual
  9: 1,  // Terre d'Hermès -> Alta Perfumaria
  10: 1, // L'Homme Idéal -> Alta Perfumaria
  11: 9, // Allure Homme Sport -> Esportivo
  14: 10,// Blue Seduction -> Casual
  16: 10 // CK One -> Casual
};

(async () => {
    const db = await mysql.createConnection({
        host: '127.0.0.1', port: 3306, user: 'root', password: 'Matheus123.', database: 'essence_db'
    });

    console.log("Iniciando correção das Pirâmides Olfativas...");
    
    for (const [id, notas] of Object.entries(NOTAS)) {
        // Tenta fazer o update. Se não afetar nenhuma linha, insere.
        const [result] = await db.query(
            'UPDATE notas_olfativas SET topo=?, coracao=?, base=? WHERE produto_id=?',
            [notas.topo, notas.coracao, notas.base, id]
        );
        if (result.affectedRows === 0) {
            await db.query(
                'INSERT INTO notas_olfativas (produto_id, topo, coracao, base) VALUES (?, ?, ?, ?)',
                [id, notas.topo, notas.coracao, notas.base]
            );
        }
    }
    console.log("✅ Pirâmides Olfativas 100% preenchidas (IDs 11 a 40 corrigidos).");

    console.log("Esvaziando a categoria Designer...");
    for (const [id, nova_cat] of Object.entries(CATEGORIAS_REMAKE)) {
        await db.query('UPDATE produtos SET categoria_id=? WHERE id=?', [nova_cat, id]);
    }
    console.log("✅ Categoria Designer esvaziada. Produtos realocados para Alta Perfumaria, Casual e Esportivo.");

    await db.end();
})().catch(e => { console.error(e.message); process.exit(1); });
