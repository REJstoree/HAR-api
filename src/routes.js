// src/routes.js

const express = require('express');
const { startSession, getActiveSessions, getSession } = require('./sessionManager');

module.exports = () => {
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
    router.post('/start', async (req, res) => {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: 'error',
                message: 'O campo sessionId é obrigatório.'
            });
        }

        try {
            const { qrCodeData } = await startSession(sessionId); 
            
            if (qrCodeData) {
                res.json({
                    status: 'qr_code_generated',
                    message: `Sessão ${sessionId} iniciada. Escaneie o QR Code.`,
                    sessionId: sessionId,
                    qrCode: qrCodeData
                });
            } else {
                res.json({
                    status: 'success',
                    message: `Sessão ${sessionId} iniciada. Verifique o status.`,
                    sessionId: sessionId
                });
            }
        } catch (error) {
            console.error('Erro ao iniciar sessão:', error);
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

            // Lógica de envio de mensagem (a ser implementada)
            // Em Serverless, você precisará de uma solução de banco de dados para gerenciar o estado
            // da sessão e um webhook para receber mensagens.

            res.json({
                status: 'warning',
                message: 'A lógica de envio de mensagem precisa ser adaptada para o Vercel (Serverless).'
            });

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erro ao enviar mensagem.',
                error: error.message
            });
        }
    });

    return router;
};
