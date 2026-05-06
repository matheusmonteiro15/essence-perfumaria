const axios = require('axios');

async function test() {
  try {
    // Fazer login primeiro para pegar o token
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'matheusrens@gmail.com',
      senha: 'senha1234'
    });
    const token = loginRes.data.token;

    // Criar um novo endereço
    const addRes = await axios.post('http://localhost:3001/api/addresses', {
      titulo: 'Casa',
      cep: '12345678',
      bairro: 'Centro',
      rua: 'Rua Principal',
      numero: '100',
      complemento: 'Apt 1'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Endereço adicionado:", addRes.data.address.id);

    // Listar endereços
    const getRes = await axios.get('http://localhost:3001/api/addresses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Endereços recuperados:", getRes.data.length);
  } catch(e) {
    console.error("Erro no teste:", e.response ? e.response.data : e.message);
  }
}
test();
