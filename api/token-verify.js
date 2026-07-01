export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch(e) {}

  const { token, action } = body;

  if (!token) {
    return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'notfound' }) };
  }

  try {
    // データ取得
    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY },
    });
    const getData = await getRes.json();
    const current = getData.record || { tokens: {} };
    const data = current.tokens[token];

    // トークンが存在しない
    if (!data) {
      return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'notfound' }) };
    }
    // 使用済み
    if (data.used) {
      return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'used', usedAt: data.usedAt }) };
    }

    // 使用済みにする
    if (action === 'use') {
      current.tokens[token].used = true;
      current.tokens[token].usedAt = new Date().toISOString();
      await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': process.env.JSONBIN_API_KEY,
        },
        body: JSON.stringify(current),
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: true, clientName: data.clientName, companyName: data.companyName }),
    };

  } catch (err) {
    console.error('Error:', err.message);
    return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'error' }) };
  }
};
