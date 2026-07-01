import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  try {
    const { form, brainType, scores, a1=[], a2=[] } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const now = new Date().toLocaleString('ja-JP', {
      timeZone:'Asia/Tokyo', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
    });
    await transporter.sendMail({
      from: `"B-Brain診断システム" <${process.env.GMAIL_USER}>`,
      to: 'oyama35.31@gmail.com',
      subject: `【B-Brain診断】${form.name}様　${new Date().toLocaleDateString('ja-JP')}`,
      html: buildHTML(form, brainType, scores, now, a1, a2),
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

function buildHTML(form, bt, sc, date, a1, a2) {
  const stColor = sc.stLv==='低'?'#E07878':sc.stLv==='中'?'#E8B86D':'#7BAE8E';
  const row=(l,v)=>`<tr><td style="padding:7px 0;color:#8A6B5A;font-size:13px;width:110px">${l}</td><td style="padding:7px 0;color:#3A2518;font-size:14px;font-weight:500">${v}</td></tr>`;
  const bar=(l,v,c,n='')=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;color:#3A2518">${l}</span><span style="font-size:11px;color:#8A6B5A">${n||v}</span></div><div style="height:9px;background:#EEE5DC;border-radius:99px;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.max(0,v))}%;background:${c};border-radius:99px"></div></div><div style="text-align:right;font-size:13px;font-weight:700;color:${c}">${v}</div></div>`;
  const chip=(l,v,bg,fc)=>`<div style="flex:1;text-align:center;background:${bg};border-radius:9px;padding:9px 5px"><div style="font-size:11px;color:${fc};margin-bottom:2px">${l}</div><div style="font-size:17px;font-weight:700;color:${fc}">${v}%</div></div>`;
  const typeColor={'左脳3次元':'#5B8EC4','左脳2次元':'#E8B86D','右脳3次元':'#7BAE8E','右脳2次元':'#E07878'};
  const a1Rows=a1.map(q=>`<tr style="border-bottom:1px solid #F5EDE4"><td style="padding:5px 8px;font-size:11px;color:#8A6B5A;width:28px">${q.id}</td><td style="padding:5px 8px;font-size:12px;color:#3A2518">${q.txt}<br><span style="font-size:11px;color:#B09080">${q.type}</span></td><td style="padding:5px 8px;font-size:12px;font-weight:600;color:${typeColor[q.type]||'#3A2518'};text-align:right">${q.ansLabel}</td></tr>`).join('');
  const a2Items=a2.map(q=>`<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #F5EDE4"><div style="font-size:11px;color:#8A6B5A">Q${q.id}　${q.cat}</div><div style="font-size:12px;color:#3A2518;margin:3px 0">${q.txt}</div><div style="font-size:12px;font-weight:600;color:#C96B45;background:#FFF6EE;padding:3px 8px;border-radius:6px;display:inline-block">${q.ansLabel}</div></div>`).join('');
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"></head><body style="margin:0;padding:20px;background:#FDF6EC;font-family:Arial,sans-serif"><div style="max-width:640px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10)"><div style="background:linear-gradient(135deg,#C96B45,#E8956A);padding:28px;text-align:center;color:white"><div style="font-size:28px;margin-bottom:6px">🧠</div><h1 style="margin:0;font-size:21px;font-weight:700">B-Brain 脳タイプ診断結果</h1><p style="margin:7px 0 0;opacity:.9;font-size:13px">${date}</p></div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 12px;font-size:13px;color:#8A6B5A;font-weight:600">受診者情報</h2><table style="width:100%;border-collapse:collapse">${row('お名前',`<strong>${form.name}</strong> 様`)}${row('メール',form.email)}${form.phone?row('電話',form.phone):''}${form.org?row('所属',form.org):''}</table></div><div style="padding:22px 28px;background:#FFF9F4;border-bottom:1px solid #EDD5BC"><div style="display:inline-block;background:linear-gradient(135deg,#C96B45,#E8956A);color:white;padding:4px 13px;border-radius:99px;font-size:11px;margin-bottom:10px">脳タイプ</div><h2 style="margin:0 0 10px;font-size:21px;color:#3A2518;font-weight:700">${bt.name}</h2><p style="margin:0 0 10px;font-size:13px;line-height:1.9;color:#3A2518">${bt.desc}</p></div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC">${bar('左脳3次元',sc.l3p,'#5B8EC4')}${bar('左脳2次元',sc.l2p,'#E8B86D')}${bar('右脳3次元',sc.r3p,'#7BAE8E')}${bar('右脳2次元',sc.r2p,'#E07878')}<div style="display:flex;gap:7px;margin-top:14px">${chip('左脳',sc.leftP,'#EEF4FF','#5B8EC4')}${chip('右脳',sc.rightP,'#F0FAF3','#7BAE8E')}${chip('3次元',sc.tdP,'#FFF9EE','#E8B86D')}${chip('2次元',sc.twdP,'#FFF3F3','#E07878')}</div></div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC">${bar('人間脳',sc.nG,'#7BAE8E','理想値 70以上')}${bar('動物脳プラス',sc.dP,'#E8B86D','理想値 70〜80')}${bar('動物脳マイナス',sc.dM,'#E07878','理想値 30以下')}${bar('ストレス耐性',sc.stS,stColor,'判定：'+sc.stLv)}</div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 14px;font-size:13px;color:#8A6B5A;font-weight:600">セクション1 回答（Q1〜40）</h2><table style="width:100%;border-collapse:collapse">${a1Rows}</table></div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 14px;font-size:13px;color:#8A6B5A;font-weight:600">セクション2 回答（Q41〜50）</h2>${a2Items}</div><div style="padding:16px 28px;text-align:center;background:#FDF6EC"><p style="margin:0;font-size:12px;color:#B09080">開発者　フロンティア75</p><a href="https://frontier75.com/" style="font-size:12px;color:#C96B45;text-decoration:none">https://frontier75.com/</a></div></div></body></html>`;
}
