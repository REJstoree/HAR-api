// api/index.js

const express = require('express');
const routes = require('../src/routes'); 
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/api', routes());

// Rota principal (para o painel)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Exporta o app do Express para o Vercel
module.exports = app;
