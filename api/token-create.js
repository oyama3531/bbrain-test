export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  const adminPass = event.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'パスワードが違います' }) };
  }

  try {
    const { clientName, companyName } = JSON.parse(event.body || '{}');

    // トークン生成（8文字）
    const token = Math.random().toString(36).substring(2, 6).toUpperCase() +
                  Math.random().toString(36).substring(2, 6).toUpperCase();

    // 現在のデータを取得
    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY },
    });
    const getData = await getRes.json();
    const current = getData.record || { tokens: {} };

    // 新しいトークンを追加
    current.tokens[token] = {
      token,
      clientName: clientName || '',
      companyName: companyName || '',
      createdAt: new Date().toISOString(),
      used: false,
      usedAt: null,
    };

    // 保存
    await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_API_KEY,
      },
      body: JSON.stringify(current),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        url: `https://brain3433.netlify.app/?token=${token}`,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
