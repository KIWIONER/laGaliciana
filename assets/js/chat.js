/* =============================================
   La Galiciana - Chat Logic
   Connects to n8n webhook for AI conversations
   ============================================= */

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// Cambia esta URL por tu webhook de n8n cuando lo actives
const N8N_WEBHOOK_URL = 'https://cerebro.agencialquimia.com/webhook/galiciana-chat';

// ID de sesión único por visita (para que el AI recuerde el contexto)
const SESSION_ID = 'sess_' + Math.random().toString(36).substr(2, 9);

// Estado de la reserva que vamos recogiendo en la conversación
let reservationData = {
    nombre: null,
    fecha: null,
    hora: null,
    personas: null,
    telefono: null,
};

// ─── UI HELPERS ──────────────────────────────────────────────────────────────

function toggleChat() {
    const panel = document.getElementById('chat-panel');
    const btn = document.getElementById('chat-btn');
    const badge = document.getElementById('chat-unread');

    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('hidden', isOpen);

    // Ocultar la badge al abrir
    if (isOpen) badge.style.display = 'none';

    // Scroll al fondo al abrir
    if (isOpen) scrollToBottom();
}

function closeChat() {
    const panel = document.getElementById('chat-panel');
    const btn = document.getElementById('chat-btn');
    panel.classList.remove('open');
    btn.classList.remove('hidden');
}

function scrollToBottom() {
    const messages = document.getElementById('chat-messages');
    setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
    }, 50);
}

function getTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function addMessage(text, role = 'bot') {
    const messages = document.getElementById('chat-messages');

    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text;

    const time = document.createElement('span');
    time.className = 'msg-time';
    time.textContent = getTime();

    msg.appendChild(bubble);
    msg.appendChild(time);
    messages.appendChild(msg);

    scrollToBottom();
    return msg;
}

function showTyping() {
    document.getElementById('chat-typing').style.display = 'flex';
    scrollToBottom();
}

function hideTyping() {
    document.getElementById('chat-typing').style.display = 'none';
}

function setInputEnabled(enabled) {
    document.getElementById('chat-input').disabled = !enabled;
    document.getElementById('chat-send').disabled = !enabled;
}

// ─── SEND MESSAGE ────────────────────────────────────────────────────────────

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    setInputEnabled(false);

    // Mostrar mensaje del usuario
    addMessage(text, 'user');
    showTyping();

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: SESSION_ID,
                message: text,
                reservationData,       // Contexto acumulado
                timestamp: new Date().toISOString(),
                source: 'lagaliciana-web',
            }),
        });

        hideTyping();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // n8n devuelve: { reply: "texto", reservationData: {...}, completed: bool }
        const reply = data.reply || data.output || data.text || '¡Gracias! Enseguida te atiendo.';
        addMessage(reply, 'bot');

        // Actualizar datos de reserva si n8n los ha completado
        if (data.reservationData) {
            Object.assign(reservationData, data.reservationData);
        }

        // Si la reserva está completada, mostrar confirmación especial
        if (data.completed) {
            setTimeout(() => {
                addMessage(
                    `✅ <strong>¡Reserva confirmada!</strong><br>
                    Te esperamos en <strong>La Galiciana</strong>.<br>
                    📍 Rúa do Franco, Santiago de Compostela`,
                    'bot'
                );
            }, 800);
        }

    } catch (err) {
        hideTyping();
        console.error('Chat error:', err);
        addMessage(
            '⚠️ Estamos teniendo una pequeña dificultad técnica. Por favor, inténtalo de nuevo en un momento o llámanos directamente.',
            'bot'
        );
    } finally {
        setInputEnabled(true);
        document.getElementById('chat-input').focus();
    }
}

// ─── INIT ────────────────────────────────────────────────────────────────────
// Mostrar la badge de bienvenida después de 3 segundos
window.addEventListener('load', () => {
    setTimeout(() => {
        const badge = document.getElementById('chat-unread');
        if (badge) {
            badge.style.display = 'flex';
            badge.textContent = '1';
        }
    }, 3000);
});
