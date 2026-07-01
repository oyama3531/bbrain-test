export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  const adminPass = req.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'パスワードが違います' }); return;
  }

  try {
    const { clientName, companyName } = req.body || {};
    const token = Math.random().toString(36).substring(2,6).toUpperCase() +
                  Math.random().toString(36).substring(2,6).toUpperCase();

    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY },
    });
    const getData = await getRes.json();
    const current = getData.record || { tokens: {} };

    current.tokens[token] = {
      token, clientName: clientName||'', companyName: companyName||'',
      createdAt: new Date().toISOString(), used: false, usedAt: null,
    };

    await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': process.env.JSONBIN_API_KEY },
      body: JSON.stringify(current),
    });

    res.json({ success: true, token, url: `https://bbrain-test.vercel.app/?token=${token}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
