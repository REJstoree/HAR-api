// C:\HAR-API\src\routes.js

const express = require('express');
const { startSession, getActiveSessions, getSession } = require('./sessionmanager');

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
                message: `Sessão ${sessionId} iniciada. Aguarde o QR Code.`,
                sessionId: sessionId
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Erro ao iniciar sessão.',
                error: error.message
            });
        }
    });

    // Rota para enviar mensagem
    router.post('/send', async (req, res) => {
        const { sessionId, number, message } = req.body;

        if (!sessionId || !number || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'sessionId, number e message são obrigatórios.'
            });
        }

        try {
            const session = getSession(sessionId);
            
            if (!session) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Sessão não encontrada.'
                });
            }

            const formattedNumber = number.includes('@s.whatsapp.net') 
                ? number 
                : `${number}@s.whatsapp.net`;

            await session.sendMessage(formattedNumber, { text: message });

            res.json({
                status: 'success',
                message: 'Mensagem enviada com sucesso.'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Erro ao enviar mensagem.',
                error: error.message
            });
        }
    });

    // Rota para desconectar sessão
    router.post('/disconnect', async (req, res) => {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: 'error',
                message: 'O campo sessionId é obrigatório.'
            });
        }

        try {
            const session = getSession(sessionId);
            
            if (!session) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Sessão não encontrada.'
                });
            }

            await session.logout();

            res.json({
                status: 'success',
                message: `Sessão ${sessionId} desconectada com sucesso.`
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Erro ao desconectar sessão.',
                error: error.message
            });
        }
    });

    return router;
};