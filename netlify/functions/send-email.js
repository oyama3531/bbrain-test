import nodemailer from 'nodemailer';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  try {
    const { form, brainType, scores } = JSON.parse(event.body);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    await transporter.sendMail({
      from: `"B-Brain診断システム" <${process.env.GMAIL_USER}>`,
      to: 'oyama35.31@gmail.com',
      subject: `【B-Brain診断】${form.name}様　${new Date().toLocaleDateString('ja-JP')}`,
      html: buildHTML(form, brainType, scores, now),
    });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Send error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function buildHTML(form, bt, sc, date) {
  const stColor = sc.stLv === '低' ? '#E07878' : sc.stLv === '中' ? '#E8B86D' : '#7BAE8E';
  const row = (l, v) => `<tr><td style="padding:8px 0;color:#8A6B5A;font-size:13px;width:110px">${l}</td><td style="padding:8px 0;color:#3A2518;font-size:14px;font-weight:500">${v}</td></tr>`;
  const bar = (l, v, c, n='') => `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:13px;color:#3A2518">${l}</span><span style="font-size:12px;color:#8A6B5A">${n||v}</span></div><div style="height:10px;background:#EEE5DC;border-radius:99px;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.max(0,v))}%;background:${c};border-radius:99px"></div></div><div style="text-align:right;font-size:14px;font-weight:700;color:${c};margin-top:3px">${v}</div></div>`;
  const chip = (l, v, bg, fc) => `<div style="flex:1;text-align:center;background:${bg};border-radius:10px;padding:10px 6px"><div style="font-size:11px;color:${fc};margin-bottom:3px">${l}</div><div style="font-size:18px;font-weight:700;color:${fc}">${v}%</div></div>`;
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"></head><body style="margin:0;padding:20px;background:#FDF6EC;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10)">
<div style="background:linear-gradient(135deg,#C96B45,#E8956A);padding:30px;text-align:center;color:white"><div style="font-size:32px;margin-bottom:8px">🧠</div><h1 style="margin:0;font-size:22px;font-weight:700">B-Brain 脳タイプ診断結果</h1><p style="margin:8px 0 0;opacity:.9;font-size:13px">${date}</p></div>
<div style="padding:24px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 14px;font-size:13px;color:#8A6B5A;font-weight:600">受診者情報</h2><table style="width:100%;border-collapse:collapse">${row('お名前',`<strong>${form.name}</strong> 様`)}${row('メール',form.email)}${form.phone?row('電話番号',form.phone):''}${form.org?row('所属',form.org):''}</table></div>
<div style="padding:24px 28px;background:#FFF9F4;border-bottom:1px solid #EDD5BC"><div style="display:inline-block;background:linear-gradient(135deg,#C96B45,#E8956A);color:white;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:600;margin-bottom:12px">脳タイプ</div><h2 style="margin:0 0 12px;font-size:22px;color:#3A2518;font-weight:700">${bt.name}</h2><p style="margin:0 0 12px;font-size:14px;line-height:1.9;color:#3A2518">${bt.desc}</p><div style="background:#FFF1E8;border-radius:12px;padding:14px 16px;border:1px solid #EDD5BC"><div style="font-size:12px;color:#C96B45;font-weight:600;margin-bottom:6px">💡 アドバイス</div><div style="font-size:13px;line-height:1.8;color:#3A2518">${bt.adv}</div></div></div>
<div style="padding:24px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 16px;font-size:13px;color:#8A6B5A;font-weight:600">脳タイプ スコア</h2>${bar('左脳3次元（合理主義）',sc.l3p,'#5B8EC4')}${bar('左脳2次元（原理主義）',sc.l2p,'#E8B86D')}${bar('右脳3次元（拡張主義）',sc.r3p,'#7BAE8E')}${bar('右脳2次元（温情主義）',sc.r2p,'#E07878')}<div style="display:flex;gap:8px;margin-top:16px">${chip('左脳',sc.leftP,'#EEF4FF','#5B8EC4')}${chip('右脳',sc.rightP,'#F0FAF3','#7BAE8E')}${chip('3次元',sc.tdP,'#FFF9EE','#E8B86D')}${chip('2次元',sc.twdP,'#FFF3F3','#E07878')}</div></div>
<div style="padding:24px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 16px;font-size:13px;color:#8A6B5A;font-weight:600">脳活用度・ストレス耐性</h2>${bar('人間脳',sc.nG,'#7BAE8E','理想値 70以上')}${bar('動物脳プラス',sc.dP,'#E8B86D','理想値 70〜80')}${bar('動物脳マイナス',sc.dM,'#E07878','理想値 30以下')}${bar('ストレス耐性',sc.stS,stColor,'判定：'+sc.stLv)}<div style="background:#F9F5F0;border-radius:12px;padding:14px 16px;border:1px solid #EDD5BC;margin-top:14px"><div style="font-size:12px;color:#8A6B5A;margin-bottom:6px">能動脳・受動脳バランス</div><div style="font-size:15px;color:#3A2518">能動脳　<strong style="color:#C96B45;font-size:18px">${sc.acP}%</strong>　　受動脳　<strong style="color:#7BAE8E;font-size:18px">${sc.paP}%</strong></div></div></div>
<div style="padding:18px 28px;text-align:center;background:#FDF6EC"><p style="margin:0;font-size:12px;color:#B09080">開発者　フロンティア75　／　B-Brain 脳タイプ診断</p></div>
</div></body></html>`;
}
