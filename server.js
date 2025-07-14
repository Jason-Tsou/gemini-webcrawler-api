const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// 請在 Render 的環境變數中設定 GEMINI_API_KEY
const API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const question = req.body.question;

  const prompt = `
你只能根據以下網址的資訊回答問題（不要使用網路上的知識）：
https://law.moj.gov.tw

使用者問題是：
${question}
`;

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ Gemini 無回應";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini API 錯誤：", error.message);
    res.status(500).json({ error: "伺服器錯誤，請稍後再試。" });
  }
});

app.get("/", (req, res) => {
  res.send("Gemini Webcrawler API is running.");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
