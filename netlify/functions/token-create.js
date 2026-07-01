import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  // 管理者パスワード確認
  const adminPass = event.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'パスワードが違います' }) };
  }

  try {
    const { clientName, companyName } = JSON.parse(event.body);

    // ランダムトークン生成（8文字）
    const token = Math.random().toString(36).substring(2, 6).toUpperCase() +
                  Math.random().toString(36).substring(2, 6).toUpperCase();

    const store = getStore('bbrain-tokens');

    const tokenData = {
      token,
      clientName: clientName || '',
      companyName: companyName || '',
      createdAt: new Date().toISOString(),
      used: false,
      usedAt: null,
    };

    await store.setJSON(token, tokenData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, token, url: `https://brain3433.netlify.app/?token=${token}` }),
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
