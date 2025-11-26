// C:\HAR-API\src\routes.js

const express = require('express');
const router = express.Router();
const { getSessions, startSession } = require('./sessionManager');

// Rota para obter a lista de sessões
router.get('/sessions', (req, res) => {
    const sessionsList = getSessions();
    res.status(200).json({
        status: true,
        sessions: sessionsList
    });
});

// Rota para iniciar uma nova sessão (Corrigida para /session/start)
router.post('/session/start', async (req, res) => {
    const { sessionName } = req.body;
    
    console.log(`[Routes] Requisição para iniciar sessão: ${sessionName}`);
    
    if (!sessionName) {
        return res.status(400).json({ status: false, message: 'sessionName é obrigatório.' });
    }
    
    const result = await startSession(sessionName);
    
    res.status(200).json({
        status: true,
        ...result
    });
});

// Rota de teste (mantida)
router.get('/', (req, res) => {
    res.status(200).json({
        status: true,
        message: 'API está funcionando!'
    });
});

module.exports = router;
