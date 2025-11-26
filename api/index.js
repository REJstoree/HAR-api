// C:\HAR-API\api\index.js (Novo Arquivo para Vercel)

const express = require('express');
const http = require('http' );
const socketIo = require('socket.io');
const path = require('path');
const routes = require('../src/routes'); // Ajuste o caminho para routes.js

const app = express();
app.use(express.json());

// O Vercel lida com arquivos estáticos de forma diferente, mas vamos manter a rota API
app.use('/api', routes);

// O Vercel não usa o listen tradicional, mas precisamos do servidor HTTP para o Socket.io
const server = http.createServer(app );
const io = socketIo(server, { cors: { origin: '*' } });

global.io = io;

io.on('connection', (socket) => {
  console.log('Socket conectado', socket.id);
});

// Exporta o servidor para o Vercel
module.exports = server; 
