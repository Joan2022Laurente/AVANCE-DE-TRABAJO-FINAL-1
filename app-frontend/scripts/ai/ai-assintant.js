// scripts/ai-assistant.js

const API_KEY = "AIzaSyChGu1YXhFHVZ0qWDlagJbjEE57uJKgBEs"; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Elementos del DOM
const toggleBtn = document.getElementById('ai-toggle-btn');
const chatWindow = document.getElementById('ai-chat-window');
const closeBtn = document.getElementById('ai-close-btn');
const sendBtn = document.getElementById('ai-send-btn');
const inputField = document.getElementById('ai-input');
const messagesContainer = document.getElementById('ai-messages');

// Estado
let isChatOpen = false;


// 1. Preparar el contexto del usuario (Datos del LocalStorage)
function getUserContext() {
    const rawData = localStorage.getItem("userData");
    if (!rawData) return "No hay datos del usuario disponibles.";
    
    let data;
    try {
        data = JSON.parse(rawData);
    } catch (e) {
        return "Error: No se pudo leer el formato del LocalStorage.";
    }

    // --- CORRECCIÓN DE ESTRUCTURA ---
    // Determinamos si 'data' ya tiene la información o si hay que entrar a una propiedad interna.
    // Si main.js usa 'userData.clases', entonces la info ya está en 'data'.
    
    let finalData = data;
    let nombreEstudiante = "Estudiante";

    // Verificamos si existe una propiedad interna 'userData' que sea string (el caso del error anterior)
    if (data.userData && typeof data.userData === 'string') {
        try {
            const parsedInner = JSON.parse(data.userData);
            finalData = parsedInner; // Usamos los datos internos
            nombreEstudiante = parsedInner.nombreEstudiante || nombreEstudiante;
        } catch (e) {
            console.warn("No se pudo parsear data.userData interno");
        }
    } else {
        // Si no hay anidamiento, intentamos leer el nombre directamente
        nombreEstudiante = data.nombreEstudiante || "Estudiante";
    }
    
    // Obtenemos arrays seguros (si no existen, usamos arrays vacíos)
    const cursos = finalData.cursos || [];
    const clases = finalData.clases || [];
    const actividades = finalData.actividades || [];
    const semanaInfo = finalData.semanaInfo || { ciclo: "Actual", semanaActual: "" };

    // Obtenemos fecha actual
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = days[now.getDay()];
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Construimos el prompt
    return `
    ERES UN ASISTENTE ACADÉMICO PARA UNA APP LLAMADA PLANUP.
    
    CONTEXTO ACTUAL:
    - Día de hoy: ${today}
    - Hora actual: ${currentTime}
    - Ciclo: ${semanaInfo.ciclo}
    - Semana: ${semanaInfo.semanaActual}

    DATOS DEL ESTUDIANTE:
    Nombre: ${nombreEstudiante}
    
    CURSOS INSCRITOS:
    ${cursos.map(c => `- ${c.nombre} (${c.docente || 'Docente no especificado'})`).join('\n')}

    HORARIO DE CLASES (DATA CRUDA):
    ${JSON.stringify(clases)}

    ACTIVIDADES Y TAREAS (DATA CRUDA):
    ${JSON.stringify(actividades)}

    INSTRUCCIONES:
    1. Responde preguntas sobre el horario ("¿Qué me toca hoy?", "¿Cuándo es la próxima clase?").
    2. Responde sobre tareas pendientes o entregadas basándote en la lista de ACTIVIDADES.
    3. Sé amable, conciso y motivador.
    4. Si te preguntan algo fuera de este contexto, responde amablemente que solo gestionas información académica.
    5. Usa emojis para ser amigable.
    `;
}

// 2. Función para llamar a Gemini
async function askGemini(userMessage) {
    const context = getUserContext();
    
    const requestBody = {
        contents: [{
            parts: [
                { text: context }, // Inyectamos el contexto primero (System Prompt simulado)
                { text: `Pregunta del usuario: ${userMessage}` }
            ]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Lo siento, hubo un error al procesar tu solicitud.";
        }
    } catch (error) {
        console.error("Error API Gemini:", error);
        return "Error de conexión. Por favor intenta más tarde.";
    }
}

// 3. Funciones de UI
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('ai-message', sender === 'user' ? 'user-message' : 'bot-message');
    
    // Convertir saltos de línea a <br> y negritas simples de markdown
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas
        .replace(/\n/g, '<br>');
        
    div.innerHTML = formattedText;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    // Mostrar mensaje usuario
    addMessage(text, 'user');
    inputField.value = '';
    
    // Indicador de cargando
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.classList.add('typing-indicator');
    loadingDiv.textContent = 'PlanUp AI está escribiendo...';
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Llamada a la IA
    const reply = await askGemini(text);

    // Remover loading y mostrar respuesta
    document.getElementById(loadingId).remove();
    addMessage(reply, 'bot');
}

// 4. Event Listeners
toggleBtn.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('d-none');
        // Pequeña animación de entrada si quieres
    } else {
        chatWindow.classList.add('d-none');
    }
});

closeBtn.addEventListener('click', () => {
    isChatOpen = false;
    chatWindow.classList.add('d-none');
});

sendBtn.addEventListener('click', handleSend);

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});