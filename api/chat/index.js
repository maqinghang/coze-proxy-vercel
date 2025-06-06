const axios = require('axios');

export default async function handler(req, res) {
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
      stream: false,
      auto_save_history: true,
      additional_messages: [{ role: 'user', content: text }]
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const convId = resp.data?.data?.conversation_id;
    if (!convId) return res.status(500).json({ error: 'No conversation_id' });

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 800));
      const poll = await axios.get(`https://api.coze.cn/v3/messages?conversation_id=${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reply = poll.data?.data?.find(msg => msg.role === 'assistant');
      if (reply?.content) {
        return res.json({ reply: reply.content });
      }
    }

    return res.status(504).json({ error: 'Timeout waiting for reply' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown error' });
  }
}
