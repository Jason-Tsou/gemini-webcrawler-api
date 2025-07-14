const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

// 根目錄測試
app.get("/", (req, res) => {
  res.send("✅ Gemini Webcrawler API is running.");
});

// 主功能 API
app.post("/ask", async (req, res) => {
  const { url, question } = req.body;

  try {
    if (!url || !question) {
      return res.status(400).json({ error: "缺少 url 或 question 參數。" });
    }

    // 取得網頁 HTML 內容
    const html = await axios.get(url, { timeout: 10000 });
    const textOnly = html.data.replace(/<[^>]*>/g, "").slice(0, 12000);

    // 建立 prompt
    const prompt = `
你只能根據以下網頁內容回答問題，不要使用其他知識：

【網頁內容】
${textOnly}

【使用者問題】
${question}
`;

    // 呼叫 Gemini API（注意：用 v1）
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Gemini 沒有回應";

    res.json({ answer });
  } catch (error) {
    console.error("❌ 伺服器錯誤：", error.toJSON?.() || error.message);
    res.status(500).json({
      error: "處理失敗：" + JSON.stringify(error.toJSON?.() || error.message)
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
