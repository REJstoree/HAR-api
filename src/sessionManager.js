// C:\HAR-API\src\sessionManager.js

const { createSession } = require('./whatsapp');

const sessions = new Map();

const getSessions = () => {
    return Array.from(sessions.keys());
};

const startSession = async (sessionName) => {
    if (sessions.has(sessionName)) {
        return { status: 'already_running', message: `Sessão ${sessionName} já está em execução.` };
    }

    console.log(`[SessionManager] Iniciando nova sessão: ${sessionName}`);
    
    const session = await createSession(sessionName);
    sessions.set(sessionName, session);

    return { status: 'starting', message: `Iniciando sessão ${sessionName}...` };
};

module.exports = {
    getSessions,
    startSession,
    sessions
};
