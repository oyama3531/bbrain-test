import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  // 管理者パスワード確認
  const adminPass = event.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'パスワードが違います' }) };
  }

  try {
    const store = getStore('bbrain-tokens');
    const { blobs } = await store.list();

    const tokens = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: 'json' });
        return data;
      })
    );

    // 作成日の新しい順に並べる
    tokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, tokens }),
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
