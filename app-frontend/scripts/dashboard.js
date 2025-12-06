/* =========================================================
   LOGICA DEL DASHBOARD - PlanUp
   Integración completa (Desarrolladores 1, 2, 3 y 4)
========================================================= */

// ---------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------

// Función para obtener datos del estudiante desde LocalStorage
function getStudentData() {
  const userId = localStorage.getItem("userId");
  const rawData = localStorage.getItem("userData");

  if (!rawData) {
    console.warn("No se encontraron datos en localStorage (userData).");
    return null;
  }

  try {
    const data = JSON.parse(rawData);
    console.log(`Cargando dashboard para usuario ID: ${userId || 'Desconocido'}`);
    return data;
  } catch (error) {
    console.error("Error al parsear userData:", error);
    return null;
  }
}

// Actualizar Encabezado (Nombre del estudiante)
function updateHeader(nombre) {
  // Buscamos el contenedor por clase, no por ID
  const welcomeBadge = document.querySelector(".welcome-badge");
  
  if (welcomeBadge) {
    // Mantenemos el ícono y actualizamos el texto
    welcomeBadge.innerHTML = `
      <i class="bi bi-person-check-fill me-2"></i>
      ¡Hola, ${nombre}! <span class="badge bg-primary ms-2">Estudiante</span>
    `;
  }
}

// ---------------------------------------------------------
// DESARROLLADOR 1 - Card "Horario Semanal"
// ---------------------------------------------------------
function updateScheduleCard(studentData) {
  const card = document.querySelector(".card-schedule");
  if (!card) return;

  const cardText = card.querySelector(".card-text");
  const courses = studentData.cursos || [];

  // Tarea 3 & 4: Validar cursos y mostrar mensaje
  if (courses.length === 0) {
    cardText.textContent = "No tienes cursos registrados aún";
  } else {
    cardText.textContent = `Tienes ${courses.length} cursos inscritos actualmente`;
  }
}

// ---------------------------------------------------------
// DESARROLLADOR 2 - Card "Tareas Pendientes"
// ---------------------------------------------------------
function updateTasksCard(studentData) {
  const card = document.querySelector(".card-tasks");
  if (!card) return;

  const cardText = card.querySelector(".card-text");
  const progressBar = card.querySelector(".progress-bar");
  const progressText = card.querySelector(".progress-text");

  const tasks = studentData.actividades || [];
  const totalTasks = tasks.length;

  // Filtramos las tareas completadas (Estado: "Entregada")
  const completedTasks = tasks.filter(t => t.estado === "Entregada").length;
  const pendingTasks = totalTasks - completedTasks;

  // Calculamos el porcentaje
  let percent = 0;
  if (totalTasks > 0) {
    percent = Math.round((completedTasks / totalTasks) * 100);
  }

  // Actualizar texto principal
  if (totalTasks === 0) {
    cardText.textContent = "No tienes tareas registradas";
  } else if (pendingTasks === 0) {
    cardText.textContent = "¡Todo al día! No tienes pendientes";
  } else {
    cardText.textContent = `Tienes ${pendingTasks} tarea(s) pendiente(s)`;
  }

  // Actualizar barra de progreso y etiqueta
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", percent);
  }
  
  if (progressText) {
    progressText.textContent = `${percent}% completado`;
  }
}

// ---------------------------------------------------------
// DESARROLLADOR 3 - Card "Recursos"
// Lógica para procesar la respuesta de la API
// ---------------------------------------------------------
function updateResourcesCard(resources) {
  const card = document.querySelector(".card-resources");
  if (!card) return;

  const cardText = card.querySelector(".card-text");
  
  // Seleccionamos los contadores por su clase. 
  // Asumimos el orden del HTML: [0] = Docs, [1] = Enlaces
  const statNumbers = card.querySelectorAll(".stat-number");
  const docsSpan = statNumbers[0];
  const linksSpan = statNumbers[1];

  const safeResources = resources || [];
  
  let docsCount = 0;
  let linksCount = 0;

  // Iteramos sobre el JSON que recibimos de la API
  safeResources.forEach(res => {
    // Convertimos a minúsculas para evitar errores (Link vs link)
    const categoria = res.categoria ? res.categoria.toLowerCase() : "";
    
    // Si la categoría es 'link' o 'enlace', lo contamos como enlace
    // Cualquier otra cosa (pdf, doc, archivo) es un documento
    if (categoria === 'link' || categoria === 'enlace') {
      linksCount++;
    } else {
      docsCount++;
    }
  });

  // Actualizar UI
  if (docsCount === 0 && linksCount === 0) {
    if (cardText) cardText.textContent = "No tienes recursos guardados";
    if (docsSpan) docsSpan.textContent = "0";
    if (linksSpan) linksSpan.textContent = "0";
  } else {
    if (cardText) cardText.textContent = "Materiales disponibles";
    if (docsSpan) docsSpan.textContent = docsCount.toString();
    if (linksSpan) linksSpan.textContent = linksCount.toString();
  }
}

// FUNCIÓN FETCH PARA DESARROLLADOR 3
// Obtiene los datos reales de la API
async function fetchResourcesAndRender() {
  const userId = localStorage.getItem("userId");
  
  // Si no hay userId, no podemos consultar la API
  if (!userId) {
    console.error("No se encontró userId para buscar recursos.");
    return;
  }

  try {
    const url = `https://utpschedulebackendjava.onrender.com/api/resources/user/${userId}`;
    console.log(`Consultando recursos en: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const resources = await response.json();
    console.log("Recursos obtenidos:", resources);
    
    // Llamamos a la función que actualiza la UI con los datos obtenidos
    updateResourcesCard(resources);

  } catch (error) {
    console.error("Error al obtener recursos:", error);
    // En caso de error, mostramos 0 en todo para no romper la UI
    updateResourcesCard([]);
    
    // Opcional: Mostrar mensaje de error en la tarjeta
    const cardText = document.querySelector(".card-resources .card-text");
    if(cardText) cardText.textContent = "Error de conexión";
  }
}

// ---------------------------------------------------------
// DESARROLLADOR 4 - Card "Progreso General"
// ---------------------------------------------------------
function updateProgressCard(studentData) {
  const card = document.querySelector(".card-progress");
  if (!card) return;

  const circle = card.querySelector(".chart-circle");
  const circleText = circle ? circle.querySelector("span") : null;
  const cardText = card.querySelector(".card-text");

  const tasks = studentData.actividades || [];
  const total = tasks.length;
  
  if (total === 0) {
    if (circleText) circleText.textContent = "0%";
    if (cardText) cardText.textContent = "Sin actividad registrada";
    return;
  }

  // Calcular porcentaje global
  const completed = tasks.filter(t => t.estado === "Entregada").length;
  const percent = Math.round((completed / total) * 100);

  // Actualizar el gráfico circular con gradiente cónico
  if (circle) {
    circle.style.background = `conic-gradient(#3b82f6 ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%)`;
    circle.setAttribute("data-percent", percent);
  }

  if (circleText) {
    circleText.textContent = `${percent}%`;
  }
  
  if (cardText) {
    cardText.textContent = "Rendimiento académico global";
  }
}

// ---------------------------------------------------------
// EXTRA - Sección de Actividad Reciente
// ---------------------------------------------------------
function updateActivitySection(studentData) {
  const list = document.querySelector(".activity-list");
  if (!list) return;

  list.innerHTML = ""; // Limpiar contenido previo

  const activities = studentData.actividades || [];
  // Tomamos las primeras 5 actividades
  const recent = activities.slice(0, 5);

  if (recent.length === 0) {
    list.innerHTML = `<div class="text-center py-4 text-muted">Sin actividad reciente</div>`;
    return;
  }

  recent.forEach(act => {
    // Configuración visual según estado
    let iconClass = "bi-exclamation-triangle";
    let bgClass = "bg-warning"; // Por defecto "Por entregar"

    if (act.estado === "Entregada") {
      iconClass = "bi-check2-square";
      bgClass = "bg-success";
    } else if (act.estado === "Programada") {
      iconClass = "bi-calendar-event";
      bgClass = "bg-primary";
    }

    // Crear elemento HTML
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <div class="activity-icon ${bgClass}">
        <i class="bi ${iconClass}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${act.nombreActividad}</div>
        <div class="activity-subtitle text-muted" style="font-size: 0.85rem;">${act.curso}</div>
        <div class="activity-time">${act.fechaLimite || "Sin fecha límite"}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

// ---------------------------------------------------------
// INICIALIZACIÓN PRINCIPAL
// ---------------------------------------------------------
function initDashboard() {
  // 1. Cargar datos síncronos del LocalStorage (Perfil, Cursos, Tareas)
  const studentData = getStudentData();

  if (studentData) {
    updateHeader(studentData.nombreEstudiante);
    updateScheduleCard(studentData);
    updateTasksCard(studentData);
    updateProgressCard(studentData);
    updateActivitySection(studentData);
  }

  // 2. Cargar datos ASÍNCRONOS de la API (Recursos)
  // Se ejecuta independientemente para no bloquear el resto
  fetchResourcesAndRender();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initDashboard);