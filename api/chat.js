const axios = require('axios');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从请求中获取 text 与 user_id
  const { text, user_id = 'user-tool1-001' } = req.body;

  // 从环境变量中读取 Coze 的 token 和 bot_id
  const token = process.env.COZE_TOKEN;
  const bot_id = process.env.COZE_BOT_ID;

  // 校验环境变量
  if (!token || !bot_id) {
    return res.status(500).json({ error: 'Missing COZE_TOKEN or COZE_BOT_ID in environment variables' });
  }

  try {
    // 向 Coze 发送对话请求
    const resp = await axios.post('https://api.coze.cn/v3/chat', {
      bot_id,
      user_id,
      stream: true,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: text,
          content_type: 'text'
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // 提取返回的 assistant 消息
    const reply = resp.data?.data?.messages?.find(m => m.role === 'assistant')?.content;

    if (reply) {
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ error: 'AI 没有返回回复内容' });
    }

  } catch (e) {
    // 打印详细错误日志
    console.error('🔥 Coze Proxy Error:', {
      message: e?.message,
      response: e?.response?.data,
      stack: e?.stack
    });

    return res.status(500).json({
      error: e?.response?.data || e.message || 'Unknown server error'
    });
  }
};
