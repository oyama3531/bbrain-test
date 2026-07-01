export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const adminPass = req.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'パスワードが違います' }); return;
  }

  try {
    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY },
    });
    const getData = await getRes.json();
    const current = getData.record || { tokens: {} };
    const tokens = Object.values(current.tokens)
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
