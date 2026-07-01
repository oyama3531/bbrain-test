import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  try {
    const { form, result, scores, answers } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const now = new Date().toLocaleString('ja-JP', {
      timeZone:'Asia/Tokyo', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
    });
    await transporter.sendMail({
      from: `"B-Brain こどもしんだん" <${process.env.GMAIL_USER}>`,
      to: 'oyama35.31@gmail.com',
      subject: `【こどもしんだん】${form.name}さん（${form.grade||''}${form.gender?'・'+form.gender:''}）　${new Date().toLocaleDateString('ja-JP')}`,
      html: buildKidsHTML(form, result, scores, answers||[], now),
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

function buildKidsHTML(form, result, sc, answers, date) {
  const typeColors={'かんがえるタイプ':'#4A90E2','きちんとタイプ':'#52C97A','ぼうけんタイプ':'#FF8C42','なかよしタイプ':'#FF6BAF'};
  const domColor=typeColors[result.typeName]||'#FF8C42';
  const bar=(l,emoji,v,c)=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:14px;font-weight:700;color:#3A2010">${emoji}　${l}</span><span style="font-size:13px;font-weight:900;color:${c}">${v}%</span></div><div style="height:10px;background:#EEE5DC;border-radius:99px;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.max(0,v))}%;background:${c};border-radius:99px"></div></div></div>`;
  const ansColor=(v)=>v===2?'#7A5A00':v===1?'#1A5080':'#80204A';
  const ansBg=(v)=>v===2?'#FFF9D6':v===1?'#E8F4FF':'#FFF0F5';
  const ansRows=answers.map(a=>`<tr style="border-bottom:1px solid #F5EDE4"><td style="padding:6px 8px;font-size:16px;width:30px">${a.emoji}</td><td style="padding:6px 8px;font-size:13px;color:#3A2010;font-weight:600">${a.txt}<br><span style="font-size:11px;color:#B09080">${a.type}</span></td><td style="padding:6px 8px;text-align:right"><span style="font-size:12px;font-weight:700;color:${ansColor(a.ans)};background:${ansBg(a.ans)};padding:3px 8px;border-radius:8px">${a.ansLabel}</span></td></tr>`).join('');
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"></head><body style="margin:0;padding:20px;background:#FFF9F0;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10)"><div style="background:linear-gradient(135deg,${domColor},${domColor}BB);padding:28px;text-align:center;color:white"><div style="font-size:40px;margin-bottom:8px">${result.typeEmoji}</div><h1 style="margin:0;font-size:20px;font-weight:900">のうタイプしんだん こどもばん</h1><p style="margin:7px 0 0;opacity:.9;font-size:13px">${date}</p></div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC;background:#FFF9F0"><div style="font-size:13px;color:#8A6B5A;margin-bottom:12px">受診者情報</div><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 12px;color:#8A6B5A;font-size:13px;width:120px">なまえ</td><td style="padding:8px 12px;color:#3A2010;font-size:18px;font-weight:900">${form.name||'?'} さん</td></tr><tr><td style="padding:8px 12px;color:#8A6B5A;font-size:13px">きみは？</td><td style="padding:8px 12px;color:#3A2010;font-size:15px;font-weight:700">${form.gender&&form.gender.length>0?form.gender:'（こたえなし）'}</td></tr><tr><td style="padding:8px 12px;color:#8A6B5A;font-size:13px">なんねんせい</td><td style="padding:8px 12px;color:#3A2010;font-size:15px;font-weight:700">${form.grade&&form.grade.length>0?form.grade:'（こたえなし）'}</td></tr><tr><td style="padding:8px 12px;color:#8A6B5A;font-size:13px">すんでいるまち</td><td style="padding:8px 12px;color:#3A2010;font-size:15px;font-weight:700">${form.town&&form.town.length>0?form.town:'（こたえなし）'}</td></tr></table></div><div style="padding:22px 28px;background:#FFFAF4;border-bottom:1px solid #EDD5BC"><div style="font-size:24px;font-weight:900;color:${domColor};margin-bottom:10px">${result.typeEmoji}　${result.typeName}</div><p style="margin:0;font-size:14px;line-height:1.9;color:#3A2010">${result.desc}</p></div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC">${bar('かんがえるタイプ','🧠',sc.l3p,'#4A90E2')}${bar('ぼうけんタイプ','⚡',sc.r3p,'#FF8C42')}${bar('きちんとタイプ','📋',sc.l2p,'#52C97A')}${bar('なかよしタイプ','💛',sc.r2p,'#FF6BAF')}</div><div style="padding:22px 28px;border-bottom:1px solid #EDD5BC"><h2 style="margin:0 0 14px;font-size:13px;color:#8A6B5A">20もんへの こたえ</h2><table style="width:100%;border-collapse:collapse">${ansRows}</table></div><div style="padding:16px 28px;text-align:center;background:#FFF9F0"><p style="margin:0 0 4px;font-size:12px;color:#B09080">開発者　フロンティア75</p><a href="https://frontier75.com/" style="font-size:12px;color:#FF8C42;text-decoration:none">https://frontier75.com/</a></div></div></body></html>`;
}
