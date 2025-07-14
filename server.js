import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const app = express();
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

app.post('/ask', async (req, res) => {
  const { question, url } = req.body;

  try {
    const html = await fetch(url).then(r => r.text());
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent;
    const cleanedText = text.replace(/\s+/g, ' ').trim().slice(0, 6000);

    const prompt = `
你只能根據下列內容回答問題，不可自行推論。
若無法回答，請回覆「無法從資料中得知」：

【網站內容】
${cleanedText}

【問題】
${question}
    `;

    const geminiRes = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${API_KEY}\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ 無法取得回應";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});
