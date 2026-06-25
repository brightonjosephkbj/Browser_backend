const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/terminal' });

app.get('/', (req, res) => {
  res.json({ status: 'B24 Backend running', version: '1.0.0' });
});

wss.on('connection', (ws) => {
  ws.send('B24 Terminal ready. Type commands below.\r\n$ ');

  ws.on('message', (msg) => {
    const cmd = msg.toString().trim();
    if (!cmd) { ws.send('$ '); return; }

    // Block dangerous commands
    const blocked = ['rm -rf', 'mkfs', 'dd if', ':(){', 'shutdown', 'reboot'];
    if (blocked.some(b => cmd.includes(b))) {
      ws.send('Command blocked for security.\r\n$ ');
      return;
    }

    exec(cmd, { timeout: 10000, cwd: '/tmp' }, (err, stdout, stderr) => {
      const out = stdout || stderr || (err ? err.message : '');
      ws.send((out || '(no output)') + '\r\n$ ');
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`B24 Backend on port ${PORT}`));
