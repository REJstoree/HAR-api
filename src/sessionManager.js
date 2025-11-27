// C:\HAR-API\src\sessionManager.js

const { createSession, listSessions } = require('./whatsapp');

// Mapa para armazenar as instâncias de socket do Baileys
const sessions = new Map();

// Função para iniciar uma nova sessão
function startSession(sessionId, io) {
    // Se a sessão já estiver no mapa, retorna a instância existente
    if (sessions.has(sessionId)) {
        console.log(`Sessão ${sessionId} já está ativa.`);
        return sessions.get(sessionId);
    }

    console.log(`Iniciando nova sessão: ${sessionId}`);
    const sock = createSession(sessionId, io);
    sessions.set(sessionId, sock);
    return sock;
}

// Função para carregar sessões existentes ao iniciar o servidor
function loadExistingSessions(io) {
    const existingSessions = listSessions();
    console.log(`Sessões existentes encontradas: ${existingSessions.join(', ')}`);
    existingSessions.forEach(sessionId => {
        // Recria a sessão para reconectar
        startSession(sessionId, io);
    });
}

// Função para obter uma sessão
function getSession(sessionId) {
    return sessions.get(sessionId);
}

// Função para listar todas as sessões ativas
function getActiveSessions() {
    return Array.from(sessions.keys());
}

module.exports = {
    startSession,
    loadExistingSessions,
    getSession,
    getActiveSessions
};
