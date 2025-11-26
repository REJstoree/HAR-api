const express = require('express');
const http = require('http' );
const socketIo = require('socket.io');
const path = require('path');
const routes = require('./routes');

// Log de inicialização para depuração
console.log('--- Servidor Node.js Carregado ---');

const app = express();
app.use(express.json());

// 1. Sirva os arquivos estáticos (frontend) primeiro.
app.use(express.static(path.join(__dirname, '..', 'public')));

// 2. Use as rotas da API com o prefixo '/api'.
app.use('/api', routes);

const server = http.createServer(app );
// Configuração do Socket.io
const io = socketIo(server, { cors: { origin: '*' } });

// Torna o Socket.io globalmente acessível para o whatsapp.js
global.io = io;

io.on('connection', (socket) => {
  console.log('Socket conectado', socket.id);
});

// Usa a porta do ambiente (para nuvem) ou 3000 (para local)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}` ));
