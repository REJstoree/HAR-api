// src/sessionManager.js

const { createSession, listSessions, getSession, getActiveSessions } = require('./whatsapp');

// Função para iniciar uma nova sessão
async function startSession(sessionId) {
    console.log('Iniciando nova sessão:', sessionId);
    
    const { sock, qrCodeData } = await createSession(sessionId); 
    
    return { sock, qrCodeData };
}

// Função para carregar sessões existentes ao iniciar o servidor
function loadExistingSessions() {
    const existingSessions = listSessions();
    console.log('Sessões existentes encontradas:', existingSessions.join(', '));
}

module.exports = {
    startSession,
    getActiveSessions,
    getSession,
    loadExistingSessions
};
