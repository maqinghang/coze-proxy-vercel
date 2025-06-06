const axios = require('axios');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, user_id = 'user-tool1-001' } = req.body;
  const token = process.env.COZE_TOKEN;
  const bot_id = process.env.COZE_BOT_ID;

  try {
    const resp = await axios.post('https://api.coze.cn/v3/chat', {
      bot_id,
      user_id,
      stream: true,
      auto_save_history: true,
      additional_messages: [{ role: 'user', content: text, content_type: 'text' }]
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = resp.data?.data?.messages?.find(m => m.role === 'assistant')?.content;
    if (reply) return res.json({ reply });

    return res.status(500).json({ error: 'AI 未返回回复内容' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown error' });
  }
}
