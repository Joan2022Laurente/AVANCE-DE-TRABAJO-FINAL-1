/* =========================================================
   DASHBOARD AI INTRO - PlanUp
   Analiza tareas y da recomendaciones al iniciar
========================================================= */

const API_URL = "https://backednexamn.onrender.com/generate-text";

// Elementos del DOM
const overlay = document.getElementById("ai-intro-overlay");
const aiTitle = document.getElementById("ai-title");
const loadingBar = document.getElementById("ai-loading-bar");
const msgContainer = document.getElementById("ai-message-container");
const typingText = document.getElementById("ai-typing-text");
const enterBtn = document.getElementById("btn-enter-dashboard");

// 1. Obtener contexto (Versión simplificada para Intro)
function getIntroContext() {
  const rawData = localStorage.getItem("userData");
  if (!rawData) return null;

  try {
    const data = JSON.parse(rawData);
    const nombre = data.nombreEstudiante || "Estudiante";
    
    // Filtrar solo tareas pendientes o programadas
    const tareas = (data.actividades || [])
      .filter(a => a.estado !== "Entregada")
      .map(a => `${a.nombreActividad} (${a.curso}) - Vence: ${a.fechaLimite}`);

    return {
      nombre,
      tareas,
      totalPendientes: tareas.length
    };
  } catch (e) {
    console.error("Error leyendo datos para AI", e);
    return null;
  }
}

// 2. Generar Prompt Estratégico
function generatePrompt(context) {
  if (!context) return "Saluda al estudiante y dile que configure sus datos.";

  const now = new Date();
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][now.getDay()];

  return `
    ERES UN ASISTENTE ACADÉMICO INTELIGENTE (PlanUp Bot).
    Hoy es ${diaSemana}, ${now.toLocaleTimeString()}.
    
    Estudiante: ${context.nombre}.
    Tiene ${context.totalPendientes} tareas pendientes:
    ${JSON.stringify(context.tareas)}

    TU MISIÓN:
    1. Analiza la lista de tareas.
    2. Identifica la MÁS URGENTE o importante.
    3. Genera un saludo motivador muy breve.
    4. Recomienda explícitamente por cuál empezar y da un consejo rápido de gestión de tiempo.
    
    FORMATO DE RESPUESTA:
    Texto plano, máximo 40 palabras. Tono motivador y directo.
    Ejemplo: "¡Hola Juan! Tienes 3 pendientes. Prioriza el Proyecto de Java que vence hoy. ¡Tú puedes!"
  `;
}

// 3. Escribir texto tipo máquina de escribir
function typeWriter(text) {
  loadingBar.style.display = "none"; // Ocultar carga
  msgContainer.style.display = "block"; // Mostrar contenedor de texto
  
  let i = 0;
  const speed = 30; // Velocidad de escritura

  function type() {
    if (i < text.length) {
      typingText.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      // Al terminar de escribir, mostrar botón
      enterBtn.style.display = "inline-block";
    }
  }
  type();
}

// 4. Función Principal: Llamar a la API
async function startAiAnalysis() {
  const context = getIntroContext();
  
  // Si no hay datos, mostrar mensaje genérico sin llamar a la API
  if (!context || context.totalPendientes === 0) {
    loadingBar.style.display = "none";
    msgContainer.style.display = "block";
    aiTitle.textContent = "¡Todo al día!";
    typingText.textContent = `Hola ${context?.nombre || 'Estudiante'}, no tienes tareas pendientes registradas. ¡Disfruta tu tiempo libre!`;
    enterBtn.style.display = "inline-block";
    return;
  }

  // Si hay tareas, llamamos a la IA
  try {
    const prompt = generatePrompt(context);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) throw new Error("Error API");

    const data = await response.json();
    const aiMessage = data.response || "Bienvenido a tu dashboard académico.";
    
    aiTitle.textContent = "Análisis Completado";
    typeWriter(aiMessage);

  } catch (error) {
    console.error(error);
    // Fallback en caso de error
    loadingBar.style.display = "none";
    msgContainer.style.display = "block";
    typingText.textContent = "Bienvenido a PlanUp. Revisa tus tareas pendientes en el panel.";
    enterBtn.style.display = "inline-block";
  }
}

// 5. Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Iniciar análisis automáticamente
  startAiAnalysis();

  // Botón para cerrar el overlay
  enterBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    // Opcional: Eliminar del DOM después de la transición para liberar memoria
    setTimeout(() => {
      overlay.style.display = "none";
    }, 500);
  });
});