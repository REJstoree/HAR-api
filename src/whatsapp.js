// C:\HAR-API\src\whatsapp.js

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    isJidBroadcast,
    delay
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode');

// Configuração do logger para evitar logs excessivos no console
const logger = pino({ level: 'silent' });

// Função para criar uma nova sessão
async function createSession(sessionId, io) {
    const sessionPath = `./sessions/${sessionId}`;
    
    // Cria a pasta de sessão se não existir
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    // 1. Novo método para obter o estado de autenticação (multi-device)
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

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
            // Envia o QR Code via Socket.io
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('Erro ao gerar QR Code:', err);
                    return;
                }
                io.emit('qr', { sessionId, qrCode: url });
                console.log(`QR Code gerado para a sessão: ${sessionId}`);
            });
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

            if (reason === DisconnectReason.badSession || reason === DisconnectReason.loggedOut) {
                console.log(`Sessão desconectada. Deletando arquivos de sessão para ${sessionId}`);
                // Deleta a sessão e tenta reconectar
                fs.rmSync(sessionPath, { recursive: true, force: true });
                createSession(sessionId, io);
            } else if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) {
                console.log('Reinicialização necessária. Reconectando...');
                await delay(5000);
                createSession(sessionId, io);
            } else {
                console.log(`Conexão fechada por: ${reason}. Tentando reconectar...`);
                await delay(5000);
                createSession(sessionId, io);
            }
        } else if (connection === 'open') {
            io.emit('ready', { sessionId, message: 'Sessão conectada com sucesso!' });
            console.log(`Sessão aberta: ${sessionId}`);
        }
    });

    // 5. Listener de mensagens (exemplo)
    sock.ev.on('messages.upsert', async (m) => {
        // Lógica para lidar com novas mensagens aqui
        // console.log(JSON.stringify(m, undefined, 2));
    });

    return sock;
}

// Função para listar sessões existentes
function listSessions() {
    // Garante que a pasta 'sessions' exista antes de tentar ler
    if (!fs.existsSync('./sessions')) {
        return [];
    }
    const sessions = fs.readdirSync('./sessions').filter(f => fs.statSync(`./sessions/${f}`).isDirectory());
    return sessions;
}

module.exports = {
    createSession,
    listSessions
};