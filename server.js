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
