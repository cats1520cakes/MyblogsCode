// api/deepseek.js

import OpenAI from "openai";

// 初始化 OpenAI 实例（使用 DeepSeek API 的地址与 API 密钥）
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req, res) {
  // 只接收 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { keyword, context } = req.body;

  if (!keyword) {
    res.status(400).json({ error: 'Missing keyword parameter' });
    return;
  }
  
  // 将 context 整理为一个总结字符串，如果存在的话
  // 如果没有 context，可为空字符串
  const contextText = Array.isArray(context)
    ? context.map(item => `标题：《${item.title}》\n摘要：${item.snippet}`).join('\n\n')
    : '';

  // 构造 prompt，将传统搜索的上下文和用户关键词结合
  const prompt = `
基于以下相关文章作为参考：
${contextText}

用户的搜索关键词是：“${keyword}”
请结合上述内容，为我生成一个增强版的搜索结果，内容可以包括对关键词的深入解释、相关文章关联以及推荐等信息。
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "deepseek-chat",
    });
    
    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error("DeepSeek API 调用错误:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.toString() });
  }
}
