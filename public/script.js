// public/script.js

const logsElement = document.getElementById('logs');
const sessionsListElement = document.getElementById('sessionsList');
const instanceSelectElement = document.getElementById('instanceSelect');
const qrCodeImageElement = document.getElementById('qrCodeImage');
const qrCodeTextElement = document.getElementById('qrCodeText');

function log(message, type = 'info') {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-${type}`;
    logEntry.textContent = `[${time}] ${message}`;
    logsElement.prepend(logEntry);
}

// --- Funções de Comunicação com a API (HTTP) ---

async function updateSessions() {
    log('Buscando sessões ativas...', 'info');
    try {
        const response = await fetch('/api/sessions');
        const data = await response.json();

        if (data.status === 'success') {
            const sessions = data.sessions;
            sessionsListElement.innerHTML = '';
            instanceSelectElement.innerHTML = '<option value="">Selecione uma Instância</option>';

            if (sessions.length === 0) {
                sessionsListElement.innerHTML = '<li>Nenhuma sessão ativa</li>';
                log('Nenhuma sessão ativa encontrada.', 'info');
            } else {
                sessions.forEach(session => {
                    const li = document.createElement('li');
                    li.textContent = session;
                    sessionsListElement.appendChild(li);

                    const option = document.createElement('option');
                    option.value = session;
                    option.textContent = session;
                    instanceSelectElement.appendChild(option);
                });
                log(`Sessões ativas encontradas: ${sessions.join(', ')}`, 'success');
            }
        } else {
            log(`Erro ao buscar sessões: ${data.message}`, 'error');
        }
    } catch (error) {
        log(`Erro de rede ao buscar sessões: ${error.message}`, 'error');
    }
}

async function startSession() {
    const sessionId = document.getElementById('sessionIdInput').value.trim();
    if (!sessionId) {
        alert('Por favor, insira o nome da instância.');
        return;
    }

    log(`Iniciando sessão para instância: ${sessionId}...`, 'info');
    
    // Limpa a área do QR Code
    qrCodeImageElement.style.display = 'none';
    qrCodeImageElement.src = '';
    qrCodeTextElement.textContent = 'Aguardando QR Code...';

    try {
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        });
        const data = await response.json();

        if (data.status === 'qr_code_generated') {
            log(`QR Code gerado para a sessão ${sessionId}.`, 'success');
            qrCodeImageElement.src = data.qrCode;
            qrCodeImageElement.style.display = 'block';
            qrCodeTextElement.textContent = 'Escaneie o QR Code acima';
        } else if (data.status === 'success') {
            log(`Sessão ${sessionId} iniciada com sucesso (já logada ou reconectando).`, 'success');
            qrCodeTextElement.textContent = 'Sessão conectada!';
            updateSessions();
        } else {
            log(`Erro ao iniciar sessão: ${data.message}`, 'error');
            qrCodeTextElement.textContent = 'Erro ao iniciar sessão';
        }
    } catch (error) {
        log(`Erro de rede ao iniciar sessão: ${error.message}`, 'error');
        qrCodeTextElement.textContent = 'Erro de rede';
    }
}

async function sendMessage() {
    const sessionId = instanceSelectElement.value;
    const number = document.getElementById('numberInput').value.trim();
    const message = document.getElementById('messageInput').value.trim();

    if (!sessionId || !number || !message) {
        alert('Por favor, selecione a instância, insira o número e a mensagem.');
        return;
    }

    log(`Tentando enviar mensagem para ${number} na sessão ${sessionId}...`, 'info');

    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, number, message })
        });
        const data = await response.json();

        if (data.status === 'warning') {
            log(`Aviso: ${data.message}`, 'info');
        } else if (data.status === 'error') {
            log(`Erro ao enviar mensagem: ${data.message}`, 'error');
        } else {
            log(`Resposta da API: ${JSON.stringify(data)}`, 'info');
        }
    } catch (error) {
        log(`Erro de rede ao enviar mensagem: ${error.message}`, 'error');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateSessions();
});
