// /api/deepseek-search.js

// 请先安装 openai SDK: npm install openai
import OpenAI from "openai";

// 从环境变量中获取你的 DeepSeek API key, 在 vercel 控制台传入参数
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req, res) {
  // 支持 GET 请求获取参数 keyword，例如：/api/deepseek-search?keyword=xxx
  const { keyword } = req.query;
  
  if (!keyword) {
    res.status(400).json({ error: 'Missing keyword parameter' });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: `You are a helpful assistant. Please provide enhanced search results for the keyword: ${keyword}` }],
      model: "deepseek-chat",
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error("DeepSeek API 调用错误:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.toString() });
  }
}
