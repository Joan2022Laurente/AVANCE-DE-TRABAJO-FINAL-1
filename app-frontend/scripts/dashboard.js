// Función para parsear los datos del estudiante
function getStudentData() {
  const rawData = localStorage.getItem("userData");
  if (!rawData) return null;

  try {
    return JSON.parse(rawData); // ✅ Solo un parseo
  } catch (error) {
    console.error("Error al parsear userData:", error);
    return null;
  }
}




// Función para actualizar el encabezado con el nombre del estudiante
function updateHeader(studentName) {
  const welcomeBadge = document.querySelector(".welcome-badge");
  if (welcomeBadge) {
    welcomeBadge.innerHTML = `
      <i class="bi bi-person-check-fill me-2"></i>
      ¡Hola, ${studentName}!
    `;
  }
}

// Función para actualizar la tarjeta de horario semanal
function updateScheduleCard(studentData) {
  const scheduleCard = document.querySelector(".card-schedule");
  if (!scheduleCard) return;

  const classesThisWeek = studentData.clases.length;
  const courseText = classesThisWeek > 0
    ? `${classesThisWeek} clase(s) esta semana`
    : "No tienes clases registradas esta semana";

  scheduleCard.querySelector(".card-text").textContent = courseText;

  // Actualizar botones de acción
  const addCourseBtn = scheduleCard.querySelector(".btn-outline-modern");
  const viewScheduleBtn = scheduleCard.querySelector(".btn-link-modern");

  if (addCourseBtn) {
    addCourseBtn.innerHTML = `
      <i class="bi bi-calendar-plus me-1"></i> Ver Horario
    `;
    addCourseBtn.href = "horario.html";
  }

  if (viewScheduleBtn) {
    viewScheduleBtn.textContent = "Ver detalles ";
    viewScheduleBtn.innerHTML += '<i class="bi bi-arrow-right ms-1"></i>';
  }
}

// Función para actualizar la tarjeta de tareas pendientes
function updateTasksCard(studentData) {
  const tasksCard = document.querySelector(".card-tasks");
  if (!tasksCard) return;

  const pendingActivities = studentData.actividades.filter(
    actividad => !actividad.estado || actividad.estado !== "Entregada"
  );

  const pendingCount = pendingActivities.length;
  const progressPercentage = studentData.actividades.length > 0
    ? Math.round(((studentData.actividades.length - pendingCount) / studentData.actividades.length) * 100)
    : 0;

  tasksCard.querySelector(".card-text").textContent =
    pendingCount > 0
      ? `${pendingCount} tarea(s) pendiente(s)`
      : "No tienes tareas pendientes";

  // Actualizar barra de progreso
  const progressBar = tasksCard.querySelector(".progress-bar");
  const progressText = tasksCard.querySelector(".progress-text");

  if (progressBar) {
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute("aria-valuenow", progressPercentage);
  }

  if (progressText) {
    progressText.textContent = `${progressPercentage}% completado`;
  }
}

// Función para actualizar la sección de actividad reciente
function updateActivitySection(studentData) {
  const activityList = document.querySelector(".activity-list");
  if (!activityList) return;

  activityList.innerHTML = ""; // Limpiar contenido previo

  // Agregar actividades recientes (máximo 5)
  const recentActivities = studentData.actividades
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  if (recentActivities.length === 0) {
    activityList.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-calendar-x fs-3 d-block mb-2"></i>
        No hay actividades recientes
      </div>
    `;
    return;
  }

  recentActivities.forEach(activity => {
    const activityItem = document.createElement("div");
    activityItem.className = "activity-item";

    const iconClass = activity.estado === "Entregada"
      ? "bi-check2-square bg-success"
      : "bi-exclamation-triangle bg-warning";

    activityItem.innerHTML = `
      <div class="activity-icon ${iconClass.split(" ")[1]}">
        <i class="${iconClass.split(" ")[0]}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${activity.nombreActividad}</div>
        <div class="activity-subtitle">${activity.curso}</div>
        <div class="activity-time">${new Date(activity.fecha).toLocaleDateString()}</div>
      </div>
      <div class="activity-action">
        <button class="btn btn-sm btn-outline-light">
          <i class="bi bi-three-dots"></i>
        </button>
      </div>
    `;

    activityList.appendChild(activityItem);
  });
}

// Función para actualizar la sección de consejos
function updateTipsSection(studentData) {
  const tipsSection = document.querySelector(".tips-section");
  if (!tipsSection) return;

  const hasClasses = studentData.clases.length > 0;
  const hasActivities = studentData.actividades.length > 0;

  const tipCards = tipsSection.querySelectorAll(".tip-card");

  if (tipCards.length >= 3) {
    // Actualizar tarjeta 1 (cursos)
    if (hasClasses) {
      tipCards[0].querySelector(".tip-title").textContent = "Revisa tu horario";
      tipCards[0].querySelector(".tip-text").textContent =
        "Tienes clases programadas para esta semana. Asegúrate de asistir.";
      tipCards[0].querySelector(".tip-icon i").className = "bi bi-calendar-check";
    }

    // Actualizar tarjeta 2 (tareas)
    const pendingActivities = studentData.actividades.filter(
      a => !a.estado || a.estado !== "Entregada"
    );

    if (pendingActivities.length > 0) {
      tipCards[1].querySelector(".tip-title").textContent = "Tareas pendientes";
      tipCards[1].querySelector(".tip-text").textContent =
        `Tienes ${pendingActivities.length} tarea(s) por completar esta semana.`;
      tipCards[1].querySelector(".tip-icon i").className = "bi bi-clipboard-check";
    }

    // Actualizar tarjeta 3 (recursos)
    tipCards[2].querySelector(".tip-title").textContent = "Organiza tus materiales";
    tipCards[2].querySelector(".tip-text").textContent =
      "Guarda apuntes y recursos por curso para encontrarlos fácilmente.";
  }
}

// Función principal para inicializar el dashboard
function initDashboard() {
  const studentData = getStudentData();
  if (!studentData) {
    console.error("No se encontraron datos del estudiante.");
    return;
  }

  // Actualizar todas las secciones
  updateHeader(studentData.nombreEstudiante);
  updateScheduleCard(studentData);
  updateTasksCard(studentData);
  updateActivitySection(studentData);
  updateTipsSection(studentData);
}

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", initDashboard);
