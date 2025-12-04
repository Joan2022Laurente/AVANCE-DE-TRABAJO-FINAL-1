// scripts/ai-assistant.js - Enhanced Modern AI Assistant

const API_URL = "https://backednexamn.onrender.com/generate-text";

// DOM Elements
const aiTrigger = document.getElementById("ai-assist-trigger");
const aiPanel = document.getElementById("ai-panel");
const aiClose = document.getElementById("ai-close");
const aiResponseArea = document.getElementById("ai-response-area");
const aiCustomInput = document.getElementById("ai-custom-input");
const aiSendCustom = document.getElementById("ai-send-custom");
const quickActionCards = document.querySelectorAll(".quick-action-card");

let isAiPanelOpen = false;

// Initialize AI Assistant
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
});

function setupEventListeners() {
  // Toggle AI Panel
  aiTrigger?.addEventListener("click", () => {
    toggleAiPanel();
  });

  aiClose?.addEventListener("click", () => {
    closeAiPanel();
  });

  // Quick Actions
  quickActionCards.forEach((card) => {
    card.addEventListener("click", () => {
      const action = card.getAttribute("data-action");
      handleQuickAction(action, card);
    });
  });

  // Custom Input
  aiSendCustom?.addEventListener("click", () => {
    handleCustomInput();
  });

  aiCustomInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleCustomInput();
    }
  });
}

function toggleAiPanel() {
  isAiPanelOpen = !isAiPanelOpen;

  if (isAiPanelOpen) {
    aiPanel.classList.add("active");
    aiTrigger.classList.add("active");
    setTimeout(() => {
      aiCustomInput?.focus();
    }, 300);
  } else {
    closeAiPanel();
  }
}

function closeAiPanel() {
  isAiPanelOpen = false;
  aiPanel.classList.remove("active");
  aiTrigger.classList.remove("active");
}

// Get user context from localStorage
function getUserContext() {
  const rawData = localStorage.getItem("userData");
  if (!rawData) return "No hay datos del usuario disponibles.";

  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    return "Error: No se pudo leer el formato del LocalStorage.";
  }

  // Manejo de doble parseo (si userData está stringified dentro de userData)
  let finalData = data;
  if (data.userData && typeof data.userData === "string") {
    try {
      finalData = JSON.parse(data.userData);
    } catch (e) {
      console.warn("Error parseo interno");
    }
  }

  const nombreEstudiante = finalData.nombreEstudiante || "Estudiante";

  // 1. OPTIMIZACIÓN: Limpiar Cursos (Solo nombre y docente)
  const cursosSimple = (finalData.cursos || [])
    .map((c) => `- ${c.nombre} (Prof: ${c.docente || "N/A"})`)
    .join("\n");

  // 2. OPTIMIZACIÓN: Limpiar Clases (Solo día, hora y curso)
  // Quitamos IDs o datos irrelevantes para la IA
  const clasesSimple = (finalData.clases || []).map((c) => ({
    dia: c.dia,
    hora: c.hora,
    curso: c.curso,
    modalidad: c.modalidad,
  }));

  // 3. OPTIMIZACIÓN: Actividades (Solo PENDIENTES o FUTURAS)
  // No le enviamos a la IA tareas de hace 3 meses que ya se entregaron
  const actividadesPendientes = (finalData.actividades || [])
    .filter((a) => {
      // Filtramos si ya está entregada o si es muy antigua (opcional)
      return a.estado !== "Entregada" && a.estado !== "Completada";
    })
    .map((a) => ({
      nombre: a.nombreActividad,
      curso: a.curso,
      vence: a.fechaLimite || "Sin fecha", // Usamos el nuevo campo fechaLimite
      estado: a.estado,
      tipo: a.tipo,
    }));

  const semanaInfo = finalData.semanaInfo || {
    ciclo: "Actual",
    semanaActual: "N/A",
  };

  const now = new Date();
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const today = days[now.getDay()];
  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Construcción del Prompt Optimizado
  return `
  ERES PLANUP-BOT. Tu misión es ayudar a ${nombreEstudiante} con su organización académica.
  Responde siempre de forma breve (máximo 2 párrafos), motivadora y en español.

  DATOS ACTUALES:
  - Hoy es: ${today}, ${now.toLocaleDateString()}
  - Hora: ${currentTime}
  - Ciclo: ${semanaInfo.ciclo} (${semanaInfo.semanaActual})

  HORARIO DE CLASES SEMANAL:
  ${JSON.stringify(clasesSimple)}

  TAREAS Y ACTIVIDADES PENDIENTES:
  ${JSON.stringify(actividadesPendientes)}

  LISTA DE CURSOS:
  ${cursosSimple}

  INSTRUCCIONES CLAVE:
  - Si preguntan "¿Qué me toca ahora?", busca en el HORARIO el día ${today} y compara con la hora ${currentTime}.
  - Si no hay tareas pendientes en la lista, felicita al estudiante.
  - No inventes información. Si no está en el JSON, di que no tienes esa información.
  `;
}

// Handle Quick Actions
async function handleQuickAction(action, cardElement) {
  // Visual feedback
  cardElement.classList.add("loading");

  let prompt = "";

  switch (action) {
    case "next-class":
      prompt =
        "¿Cuál es mi próxima clase? Dame solo el nombre del curso, hora y modalidad.";
      break;
    case "pending-tasks":
      prompt =
        "Lista mis tareas pendientes de forma concisa. Solo nombre y curso.";
      break;
    case "today-schedule":
      prompt = "Muéstrame mi horario de hoy de forma clara y ordenada.";
      break;
    case "week-summary":
      prompt =
        "Dame un resumen breve de mi semana: cuántas clases tengo y tareas pendientes.";
      break;
  }

  await processAiRequest(prompt);
  cardElement.classList.remove("loading");
}

// Handle Custom Input
async function handleCustomInput() {
  const userMessage = aiCustomInput.value.trim();
  if (!userMessage) return;

  aiCustomInput.value = "";
  await processAiRequest(userMessage);
}

// Process AI Request
async function processAiRequest(userMessage) {
  // Clear welcome message
  const welcomeMsg = aiResponseArea.querySelector(".ai-welcome");
  if (welcomeMsg) welcomeMsg.remove();

  // Show loading state
  showLoadingState();

  try {
    const response = await callAiApi(userMessage);
    displayAiResponse(response);
  } catch (error) {
    displayErrorMessage();
  }
}

// Call AI API
async function callAiApi(userMessage) {
  const context = getUserContext();
  console.log("usuarioconteto")
  console.log(context)
  const fullPrompt = `${context}\n\nPregunta: ${userMessage}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: fullPrompt }),
  });

  if (!response.ok) {
    throw new Error(`Error servidor: ${response.status}`);
  }

  const data = await response.json();
  return data.response || "No recibí respuesta del servidor.";
}

// Show Loading State
function showLoadingState() {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "ai-response loading";
  loadingDiv.id = "ai-loading";
  loadingDiv.innerHTML = `
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  aiResponseArea.appendChild(loadingDiv);
  aiResponseArea.scrollTop = aiResponseArea.scrollHeight;
}

// Display AI Response with typing animation
function displayAiResponse(text) {
  // Remove loading
  const loading = document.getElementById("ai-loading");
  if (loading) loading.remove();

  // Create response container
  const responseDiv = document.createElement("div");
  responseDiv.className = "ai-response";

  const contentDiv = document.createElement("div");
  contentDiv.className = "ai-response-content";

  responseDiv.appendChild(contentDiv);
  aiResponseArea.appendChild(responseDiv);

  // Typing animation
  let index = 0;
  const typingSpeed = 20;

  function typeWriter() {
    if (index < text.length) {
      contentDiv.textContent += text.charAt(index);
      index++;
      aiResponseArea.scrollTop = aiResponseArea.scrollHeight;
      setTimeout(typeWriter, typingSpeed);
    }
  }

  typeWriter();
}

// Display Error Message
function displayErrorMessage() {
  const loading = document.getElementById("ai-loading");
  if (loading) loading.remove();

  const errorDiv = document.createElement("div");
  errorDiv.className = "ai-response error";
  errorDiv.innerHTML = `
    <i class="bi bi-exclamation-circle"></i>
    <p>No pude conectar con el servidor. Intenta de nuevo.</p>
  `;
  aiResponseArea.appendChild(errorDiv);
}
