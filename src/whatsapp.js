// C:\HAR-API\src\whatsapp.js

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');

const createSession = async (sessionName) => {
    // Usa o nome da sessão para o caminho da pasta de credenciais
    const { state, saveCreds } = await useMultiFileAuthState(`sessions/${sessionName}`);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        connectTimeoutMs: 60000, 
        qrTimeout: 60000,
        // Adicionado para tentar contornar o erro 408
        shouldIgnoreProcessError: () => true, 
        keepAliveIntervalMs: 10000, 
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log(`[${sessionName}] Status da Conexão: ${connection}`);
        
        if (qr) {
            console.log(`[${sessionName}] QR Code Recebido. Emitindo para o Socket.io...`);
            global.io.emit('qr', { qr });
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            
            console.log(`[${sessionName}] Conexão fechada. Motivo: ${reason}`);

            global.io.emit('status', { status: 'disconnected', sessionName, reason });

            if (reason !== DisconnectReason.loggedOut) {
                console.log(`[${sessionName}] Tentando reconectar...`);
                createSession(sessionName);
            }
        }

        if (connection === 'open') {
            console.log(`[${sessionName}] Conexão aberta com sucesso!`);
            global.io.emit('status', { status: 'connected', sessionName });
        }
    });

    return sock;
};

module.exports = {
    createSession
};
