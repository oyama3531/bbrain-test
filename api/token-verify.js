export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { token, action } = req.body || {};
  if (!token) { res.json({ valid: false, reason: 'notfound' }); return; }

  try {
    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
      headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY },
    });
    const getData = await getRes.json();
    const current = getData.record || { tokens: {} };
    const data = current.tokens[token];

    if (!data) { res.json({ valid: false, reason: 'notfound' }); return; }
    if (data.used) { res.json({ valid: false, reason: 'used', usedAt: data.usedAt }); return; }

    if (action === 'use') {
      current.tokens[token].used = true;
      current.tokens[token].usedAt = new Date().toISOString();
      await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': process.env.JSONBIN_API_KEY },
        body: JSON.stringify(current),
      });
    }
    res.json({ valid: true, clientName: data.clientName, companyName: data.companyName });
  } catch (err) {
    console.error('Error:', err.message);
    res.json({ valid: false, reason: 'error' });
  }
}
