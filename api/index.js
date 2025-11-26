// C:\HAR-API\api\index.js (Simplificado para Vercel)

const express = require('express');
const routes = require('../src/routes'); // Ajuste o caminho para routes.js

const app = express();
app.use(express.json());

// O Vercel lida com o servidor e a porta. Apenas exportamos o app.
app.use('/api', routes);

// Exporta o app do Express
module.exports = app; 
