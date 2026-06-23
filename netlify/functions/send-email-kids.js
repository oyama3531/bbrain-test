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
    const { form, result, scores, answers } = JSON.parse(event.body);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const now = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    await transporter.sendMail({
      from: `"B-Brain こどもしんだん" <${process.env.GMAIL_USER}>`,
      to: 'oyama35.31@gmail.com',
      subject: `【こどもしんだん】${form.name}さん（${form.grade||''}${form.gender?'・'+form.gender:''}）　${new Date().toLocaleDateString('ja-JP')}`,
      html: buildHTML(form, result, scores, answers, now),
    });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Kids email error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function buildHTML(form, result, scores, answers, date) {
  const typeColors = {
    'かんがえるタイプ': '#4A90E2',
    'きちんとタイプ':   '#52C97A',
    'ぼうけんタイプ':   '#FF8C42',
    'なかよしタイプ':   '#FF6BAF',
  };
  const domColor = typeColors[result.typeName] || '#FF8C42';

  const bar = (label, emoji, val, color) => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:14px;font-weight:700;color:#3A2010">${emoji}　${label}</span>
        <span style="font-size:13px;font-weight:900;color:${color}">${val}%</span>
      </div>
      <div style="height:10px;background:#EEE5DC;border-radius:99px;overflow:hidden">
        <div style="height:100%;width:${Math.min(100,Math.max(0,val))}%;background:${color};border-radius:99px"></div>
      </div>
    </div>`;

  const ansColor = (v) => v === 2 ? '#7A5A00' : v === 1 ? '#1A5080' : '#80204A';
  const ansBg   = (v) => v === 2 ? '#FFF9D6' : v === 1 ? '#E8F4FF' : '#FFF0F5';
  const ansRows = answers.map(a => `
    <tr style="border-bottom:1px solid #F5EDE4">
      <td style="padding:6px 8px;font-size:16px;width:30px;vertical-align:top">${a.emoji}</td>
      <td style="padding:6px 8px;font-size:13px;color:#3A2010;vertical-align:top;font-weight:600">${a.txt}<br>
        <span style="font-size:11px;color:#B09080;font-weight:400">${a.type}</span></td>
      <td style="padding:6px 8px;vertical-align:top;text-align:right">
        <span style="font-size:12px;font-weight:700;color:${ansColor(a.ans)};background:${ansBg(a.ans)};padding:3px 8px;border-radius:8px;white-space:nowrap">${a.ansLabel}</span>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#FFF9F0;font-family:'Helvetica Neue',Arial,sans-serif">
<div style="max-width:620px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10)">

  <!-- ヘッダー -->
  <div style="background:linear-gradient(135deg,${domColor},${domColor}BB);padding:28px;text-align:center;color:white">
    <div style="font-size:40px;margin-bottom:8px">${result.typeEmoji}</div>
    <h1 style="margin:0;font-size:20px;font-weight:900">のうタイプしんだん こどもばん</h1>
    <p style="margin:7px 0 0;opacity:.9;font-size:13px">${date}</p>
  </div>

  <!-- 子どもの情報 -->
  <div style="padding:22px 28px;border-bottom:1px solid #EDD5BC;background:#FFF9F0">
    <div style="font-size:13px;color:#8A6B5A;font-weight:600;margin-bottom:12px;letter-spacing:.08em">受診者情報</div>
    <table style="width:100%;border-collapse:collapse;background:#FFFAF5;border-radius:10px;overflow:hidden">
      <tr style="border-bottom:1px solid #EDD5BC">
        <td style="padding:8px 12px;color:#8A6B5A;font-size:13px;width:120px;font-weight:600">なまえ</td>
        <td style="padding:8px 12px;color:#3A2010;font-size:18px;font-weight:900">${form.name || '?'} さん</td>
      </tr>
      <tr style="border-bottom:1px solid #EDD5BC">
        <td style="padding:8px 12px;color:#8A6B5A;font-size:13px;font-weight:600">きみは？</td>
        <td style="padding:8px 12px;color:#3A2010;font-size:15px;font-weight:700">${form.gender && form.gender.length > 0 ? form.gender : '（こたえなし）'}</td>
      </tr>
      <tr style="border-bottom:1px solid #EDD5BC">
        <td style="padding:8px 12px;color:#8A6B5A;font-size:13px;font-weight:600">なんねんせい</td>
        <td style="padding:8px 12px;color:#3A2010;font-size:15px;font-weight:700">${form.grade && form.grade.length > 0 ? form.grade : '（こたえなし）'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#8A6B5A;font-size:13px;font-weight:600">すんでいるまち</td>
        <td style="padding:8px 12px;color:#3A2010;font-size:15px;font-weight:700">${form.town && form.town.length > 0 ? form.town : '（こたえなし）'}</td>
      </tr>
    </table>
  </div>

  <!-- 診断結果 -->
  <div style="padding:22px 28px;border-bottom:1px solid #EDD5BC;background:#FFFAF4">
    <div style="display:inline-block;background:${domColor};color:white;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:12px">のうタイプ</div>
    <div style="font-size:24px;font-weight:900;color:${domColor};margin-bottom:10px">${result.typeEmoji}　${result.typeName}</div>
    <div style="font-size:14px;line-height:1.9;color:#3A2010;font-weight:600">${result.desc}</div>
  </div>

  <!-- スコア -->
  <div style="padding:22px 28px;border-bottom:1px solid #EDD5BC">
    <div style="font-size:13px;color:#8A6B5A;font-weight:600;margin-bottom:14px;letter-spacing:.08em">4つの のうタイプ バランス</div>
    ${bar('かんがえるタイプ', '🧠', scores.l3p, '#4A90E2')}
    ${bar('きちんとタイプ',   '📋', scores.l2p, '#52C97A')}
    ${bar('ぼうけんタイプ',   '⚡', scores.r3p, '#FF8C42')}
    ${bar('なかよしタイプ',   '💛', scores.r2p, '#FF6BAF')}
  </div>

  <!-- 回答一覧 -->
  <div style="padding:22px 28px;border-bottom:1px solid #EDD5BC">
    <div style="font-size:13px;color:#8A6B5A;font-weight:600;margin-bottom:14px;letter-spacing:.08em">20もんへの こたえ</div>
    <table style="width:100%;border-collapse:collapse">
      ${ansRows}
    </table>
  </div>

  <!-- フッター -->
  <div style="padding:16px 28px;text-align:center;background:#FFF9F0">
    <p style="margin:0 0 4px;font-size:12px;color:#B09080">開発者　フロンティア75　／　B-Brain のうタイプしんだん こどもばん</p>
    <a href="https://frontier75.com/" style="font-size:12px;color:#FF8C42;text-decoration:none">https://frontier75.com/</a>
  </div>

</div>
</body></html>`;
}
