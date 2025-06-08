import { WebSocketServer } from 'ws';
import { createServer } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

let wss;

export default function handler(req, res) {
  if (!res.socket.server.wss) {
    const server = createServer((req, res) => {
      res.writeHead(200);
      res.end('WebSocket Server');
    });

    wss = new WebSocketServer({ server });
    res.socket.server.wss = wss;

    wss.on('connection', ws => {
      ws.on('message', msg => {
        console.log('收到消息：', msg.toString());
        ws.send(`你刚才说了：${msg.toString()}`);
      });

      ws.send('连接成功！你可以开始聊天。');
    });

    server.listen(0, () => {
      const address = server.address();
      console.log(`WebSocket server listening on ${address.port}`);
    });
  }
  res.end();
}

