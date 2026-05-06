require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateUsers() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'essence_db'
        });
        
        const hash = '$2a$10$7VWhRhQNY2CTuHM91tx3d.hyxNoSzn7uiRpZC8SqBjaQuo6/4LbUy';
        
        await conn.query(`
        REPLACE INTO usuarios (id, nome, email, cpf, senha_hash, data_nascimento, tipo_perfil) VALUES 
        (1, 'Admin Supremo', 'admin@essence.com', '11111111111', ?, '1980-01-01', 'ADMIN'),
        (2, 'Cliente Teste', 'cliente1@mail.com', '22222222222', ?, '1990-05-15', 'CLIENTE'),
        (3, 'João Silva', 'joao@mail.com', '33333333333', ?, '1985-06-20', 'CLIENTE'),
        (4, 'Maria Costa', 'maria@mail.com', '44444444444', ?, '1992-07-21', 'CLIENTE'),
        (5, 'Carlos Alberto', 'carlos@mail.com', '55555555555', ?, '1988-12-01', 'CLIENTE'),
        (6, 'Ana Beatriz', 'ana@mail.com', '66666666666', ?, '1995-11-10', 'CLIENTE'),
        (7, 'Felipe Santos', 'felipe@mail.com', '77777777777', ?, '1982-03-30', 'CLIENTE'),
        (8, 'Julia Mendes', 'julia@mail.com', '88888888888', ?, '1998-04-12', 'CLIENTE'),
        (9, 'Roberto Alves', 'roberto@mail.com', '99999999999', ?, '1979-08-08', 'CLIENTE'),
        (10, 'Sabrina Sato', 'sabrina@mail.com', '10101010101', ?, '1991-09-09', 'CLIENTE'),
        (11, 'Admin Secundário', 'admin2@essence.com', '12121212121', ?, '1985-05-15', 'ADMIN'),
        (12, 'Matheus Rens', 'matheusrens@gmail.com', '13131313131', ?, '1998-08-20', 'CLIENTE');
        `, Array(12).fill(hash));
        
        console.log("Usuarios atualizados com sucesso com o novo hash!");
        await conn.end();
    } catch(e) {
        console.error(e);
    }
}
updateUsers();
