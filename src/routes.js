// C:\HAR-API\src\routes.js

const express = require('express');
const { startSession, getActiveSessions, getSession } = require('./sessionManager');

module.exports = (io) => {
    const router = express.Router();

    // Rota para listar sessões ativas
    router.get('/sessions', (req, res) => {
        const activeSessions = getActiveSessions();
        res.json({
            status: 'success',
            sessions: activeSessions
        });
    });

    // Rota para iniciar uma nova sessão
    router.post('/start', (req, res) => {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: 'error',
                message: 'O campo sessionId é obrigatório.'
            });
        }

        try {
            // startSession PRECISA do 'io' para emitir o QR Code
            startSession(sessionId, io); 
            res.json({
                status: 'success',
                message: `Tentativa de iniciar sessão ${sessionId}. Verifique o QR Code.`
            });
        } catch (error) {
            console.error(`Erro ao iniciar sessão ${sessionId}:`, error);
            res.status(500).json({
                status: 'error',
                message: 'Erro interno ao iniciar a sessão.'
            });
        }
    });

    // Rota de exemplo para enviar mensagem
    router.post('/send-message', async (req, res) => {
        const { sessionId, to, message } = req.body;
        const sock = getSession(sessionId);

        if (!sock) {
            return res.status(404).json({ status: 'error', message: 'Sessão não encontrada ou inativa.' });
        }

        try {
            await sock.sendMessage(to, { text: message });
            res.json({ status: 'success', message: 'Mensagem enviada.' });
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            res.status(500).json({ status: 'error', message: 'Falha ao enviar mensagem.' });
        }
    });

    return router; // GARANTE QUE O ROUTER É RETORNADO
};
