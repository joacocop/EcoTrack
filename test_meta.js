const fetch = global.fetch || require('node-fetch');
(async () => {
  const base = 'http://localhost:5000/api';
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'test1234';
  try {
    const regRes = await fetch(`${base}/usuarios/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nombre: 'Test User', email, password }),
    });
    const regBody = await regRes.json();
    console.log('register', regRes.status, regBody);
    const token = regBody.token;
    const saveRes = await fetch(`${base}/estadisticas/metas`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify({ objetivoCO2: 22 }),
    });
    const saveBody = await saveRes.json();
    console.log('saveMeta', saveRes.status, saveBody);
    const getRes = await fetch(`${base}/estadisticas/metas`, {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`},
    });
    const getBody = await getRes.json();
    console.log('getMeta', getRes.status, getBody);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
