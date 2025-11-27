// src/whatsapp.js

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, isJidBroadcast, delay } = require('@whiskeysockets/baileys');
const Boom = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode');

// Configuração do logger para evitar logs excessivos no console
const logger = pino({ level: 'silent' });

// Função para criar uma nova sessão
async function createSession(sessionId) {
    const sessionPath = `./sessions/${sessionId}`;

    // Cria a pasta de sessão se não existir
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    // 1. Novo método para obter o estado de autenticação (multi-device)
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // Variável para armazenar o QR Code gerado
    let qrCodeData = null;

    // 2. Configuração do socket
    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: ['HAR-API', 'Chrome', '1.0.0'],
        shouldIgnoreJid: jid => isJidBroadcast(jid),
    });

    // 3. Salva credenciais sempre que houver uma atualização
    sock.ev.on('creds.update', saveCreds);

    // 4. Gerenciamento do estado da conexão
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Se o QR Code for gerado, armazena a URL de dados
            await new Promise((resolve, reject) => {
                qrcode.toDataURL(qr, (err, url) => {
                    if (err) {
                        console.error('Erro ao gerar QR Code:', err);
                        reject(err);
                        return;
                    }
                    qrCodeData = url; // Armazena o QR Code
                    resolve();
                });
            });
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

            if (reason === DisconnectReason.badSession || reason === DisconnectReason.loggedOut) {
                console.log('Sessão desconectada. Deletando arquivos de sessão para', sessionId);
                fs.rmSync(sessionPath, { recursive: true, force: true });
                createSession(sessionId);
            } else if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) {
                console.log('Reinicialização necessária. Reconectando...');
                await delay(5000);
                createSession(sessionId);
            } else {
                console.log('Conexão fechada por:', reason, '. Tentando reconectar...');
                await delay(5000);
                createSession(sessionId);
            }
        } else if (connection === 'open') {
            console.log('Sessão aberta:', sessionId);
        }
    });

    // 5. Listener de mensagens (exemplo)
    sock.ev.on('messages.upsert', async (m) => {
        // Lógica para lidar com novas mensagens aqui
    });

    // Espera até que o QR Code seja gerado (ou a conexão seja aberta)
    let attempts = 0;
    while (!qrCodeData && sock.ws.readyState !== sock.ws.OPEN && attempts < 20) {
        await delay(1000);
        attempts++;
    }

    // Retorna o socket e o QR Code (se disponível)
    return { sock, qrCodeData };
}

// Função para listar sessões existentes
function listSessions() {
    if (!fs.existsSync('./sessions')) {
        return [];
    }

    const sessions = fs.readdirSync('./sessions').filter(f => fs.statSync(`./sessions/${f}`).isDirectory());
    return sessions;
}

// Função para obter uma sessão ativa
function getSession(sessionId) {
    const sessionPath = `./sessions/${sessionId}`;
    if (fs.existsSync(sessionPath)) {
        return { id: sessionId, status: 'active' };
    }
    return null;
}

// Função para obter todas as sessões ativas (apenas as pastas existentes)
function getActiveSessions() {
    return listSessions();
}

module.exports = {
    createSession,
    listSessions,
    getSession,
    getActiveSessions
};
