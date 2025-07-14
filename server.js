const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

// API 路由：從網址抓取內容，並將問題送進 Gemini
app.post("/ask", async (req, res) => {
  const { url, question } = req.body;

  try {
    // 抓取網頁內容
    const html = await axios.get(url, { timeout: 10000 });
    const textOnly = html.data.replace(/<[^>]*>/g, '').slice(0, 12000); // 去除 HTML tag，限制長度

    // 建立 prompt
    const prompt = `
你只能根據以下網頁內容回答問題，不要使用其他知識：

【網頁內容】
${textOnly}

【使用者問題】
${question}
`;

    // 呼叫 Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ 無回應";
    res.json({ answer: reply });
  } catch (error) {
    console.error("❌ 伺服器錯誤：", error.response?.data || error.message);
    res.status(500).json({
      error: "處理失敗：" + (error.response?.data?.error?.message || error.message)
    });
  }
});

// 根目錄測試頁
app.get("/", (req, res) => {
  res.send("✅ Gemini Webcrawler API is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
