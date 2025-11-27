// src/server.js

const express = require('express');
const cors = require('cors');
const http = require('http' );
const path = require('path');
const routes = require('./routes');
const { loadExistingSessions } = require('./sessionManager'); // Apenas o que é necessário

const app = express();
const server = http.createServer(app );

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/api', routes());

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Exporta o app do Express
module.exports = app;
