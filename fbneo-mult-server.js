const express = require('express');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || process.argv[2] || 5000;
const romPath = process.argv[3];
const maxPlayers = parseInt(process.argv[4], 10) || 2; // теперь задаётся аргументом, по умолчанию 2

if (!romPath) {
  console.error("no rom file");
  process.exit(1);
}

// Статика (отдаём index.html и всё остальное)
app.use(express.static(__dirname));

// Главная страница
app.get('/', async (req, res) => {
  const indexHtml = await fs.readFile(path.join(__dirname, 'index.html'));
  res.send(indexHtml.toString());
});

// ROM отдача
app.get('/rom', (req, res) => {
  res.sendFile(path.resolve(romPath));
});

// HTTP + WebSocket сервер
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const room = [];
let totalBytesReceived = 0;
let totalBytesSent = 0;

setInterval(() => {
  console.log(`[Traffic] Received: ${totalBytesReceived} B | Sent: ${totalBytesSent} B`);
}, 10000);

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  console.log('connect');
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  room.push(ws);
  if (room.length === maxPlayers) {
    room.forEach((ws, id) => {
      ws.send(`join ${id + 1}`);
    });
  } else {
    ws.send('wait');
  }

  ws.on('message', (data, isBinary) => {
    const size = isBinary ? data.byteLength : Buffer.byteLength(data);
    totalBytesReceived += size;
    if (!isBinary && Buffer.isBuffer(data)) {
      var parts = data.toString().split(" ");
      var cmd = parts[0];
      if (cmd === 'keyup' || cmd === 'keydown') {
        // Кнопки ретранслируются host-у (игроку 1)
        const peer = room[0];
        if (peer && peer.readyState === WebSocket.OPEN) {
          peer.send(data, { binary: isBinary });
          totalBytesSent += size;
        }
      }
    } else if (!isBinary) {
      // Текстовые сообщения всем
      room.forEach((peer) => {
        if (peer && peer.readyState === WebSocket.OPEN) {
          peer.send(data, { binary: isBinary });
          totalBytesSent += size;
        }
      });
    } else {
      // Бинарные данные (кадры) всем, кроме host-а
      room.forEach((peer, id) => {
        if (peer && peer.readyState === WebSocket.OPEN && id !== 0) {
          peer.send(data, { binary: isBinary });
          totalBytesSent += size;
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('disconnect');
    const id = room.indexOf(ws);
    if (id !== -1) room.splice(id, 1);
    room.forEach((peer) => {
      if (peer && peer.readyState === WebSocket.OPEN) {
        peer.send('part');
      }
    });
    console.log(`[Session ended] Current total traffic: Received ${totalBytesReceived} B, Sent ${totalBytesSent} B`);
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 10000);

wss.on('close', function close() {
  clearInterval(interval);
});

server.listen(port, () => {
  console.log(`listening on http://localhost:${port} (maxPlayers=${maxPlayers})`);
}); 