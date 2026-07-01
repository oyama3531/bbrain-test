import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const { token, action } = JSON.parse(event.body || '{}');

  if (!token) return { statusCode: 400, headers, body: JSON.stringify({ error: 'トークンがありません' }) };

  try {
    const store = getStore('bbrain-tokens');
    const data = await store.get(token, { type: 'json' });

    // トークンが存在しない
    if (!data) {
      return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'notfound' }) };
    }

    // 使用済み
    if (data.used) {
      return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'used', usedAt: data.usedAt }) };
    }

    // action=use のとき → 使用済みにする
    if (action === 'use') {
      data.used = true;
      data.usedAt = new Date().toISOString();
      await store.setJSON(token, data);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: true, clientName: data.clientName, companyName: data.companyName }),
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
