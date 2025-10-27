document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos del usuario
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData || !userData.success) {
    window.location.href = "index.html";
    return;
  }

  // Mapear días abreviados a días completos
  const dayMap = {
    Lun: "Lunes",
    Mar: "Martes",
    Mié: "Miércoles",
    Jue: "Jueves",
    Vie: "Viernes",
    Sáb: "Sabado",
    Dom: "Domingo",
  };

  // Actualizar información del encabezado
  document.getElementById("cycleInfo").textContent = userData.semanaInfo.ciclo;
  document.getElementById(
    "weekInfo"
  ).textContent = `${userData.semanaInfo.semanaActual} ${userData.semanaInfo.fechas}`;

  // Obtener elementos del DOM
  const scheduleTableBody = document.getElementById("scheduleTableBody");
  const mobileSchedule = document.getElementById("mobileSchedule");
  const deliveredActivities = document.getElementById("deliveredActivities");
  const pendingActivities = document.getElementById("pendingActivities");

  // Limpiar contenido previo
  scheduleTableBody.innerHTML = "";
  mobileSchedule.innerHTML = "";
  deliveredActivities.innerHTML = "";
  pendingActivities.innerHTML = "";

  // Función para generar colores consistentes por curso
  const colorCache = {};
  const getColorForCourse = (courseName) => {
    if (colorCache[courseName]) return colorCache[courseName];
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#3b82f6', // Blue
      '#f97316', // Orange
      '#14b8a6', // Teal
    ];
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    colorCache[courseName] = color;
    return color;
  };

  // Función para normalizar horas
  const normalizeTime = (timeStr) => {
    timeStr = timeStr.toLowerCase().trim();
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.|am|pm)/);
    if (!match) return timeStr;
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    if (period.includes('p') && hours !== 12) {
      hours += 12;
    } else if (period.includes('a') && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Extraer todos los horarios únicos de las clases
  const uniqueTimeSlots = new Set();
  userData.clases.forEach(clase => {
    if (clase.hora && clase.hora.includes('-')) {
      const startTime = clase.hora.split(' - ')[0];
      uniqueTimeSlots.add(startTime);
    }
  });

  // Convertir a array y ordenar
  const timeSlots = Array.from(uniqueTimeSlots).sort((a, b) => {
    return normalizeTime(a).localeCompare(normalizeTime(b));
  });

  // Si no hay slots de tiempo, mostrar mensaje
  if (timeSlots.length === 0) {
    scheduleTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <div class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <p>No hay clases programadas esta semana</p>
          </div>
        </td>
      </tr>
    `;
  }

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo",
  ];

  // Generar horario para desktop
  timeSlots.forEach((timeSlot) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td style="font-weight: 600;">${timeSlot}</td>`;
    days.forEach((day) => {
      const cell = document.createElement("td");
      const dayClasses = userData.clases.filter((clase) => {
        if (!clase.hora || !clase.hora.includes('-')) return false;
        const match = clase.dia.match(/^[^\d\n]+/);
        const claseDay = match ? match[0].trim() : clase.dia;
        const claseDayFull = dayMap[claseDay];
        const claseStartTime = clase.hora.split(" - ")[0];
        return claseDayFull === day && normalizeTime(claseStartTime) === normalizeTime(timeSlot);
      });
      if (dayClasses.length > 0) {
        dayClasses.forEach((clase) => {
          const courseBlock = document.createElement("div");
          courseBlock.className = "course-block";
          const courseName = clase.curso.split("(")[0].trim();
          courseBlock.style.backgroundColor = getColorForCourse(courseName);
          const modalityText = clase.modalidad ? `<small>${clase.modalidad}</small>` : '';
          courseBlock.innerHTML = `
            ${courseName}
            ${modalityText}
            <div class="course-actions d-none">
              <i class="bi bi-journal-plus action-icon" title="Agregar nota" data-course="${courseName}"></i>
              <i class="bi bi-link-45deg action-icon" title="Agregar recurso" data-course="${courseName}"></i>
            </div>
          `;
          // Eventos para hover en desktop
          courseBlock.addEventListener("mouseenter", () => {
            const actions = courseBlock.querySelector(".course-actions");
            actions.classList.remove("d-none");
            actions.classList.add("d-flex");
          });
          courseBlock.addEventListener("mouseleave", () => {
            const actions = courseBlock.querySelector(".course-actions");
            actions.classList.add("d-none");
            actions.classList.remove("d-flex");
          });
          cell.appendChild(courseBlock);
        });
      }
      row.appendChild(cell);
    });
    scheduleTableBody.appendChild(row);
  });

  // Generar horario para mobile
  const dayEvents = {};
  userData.clases.forEach((clase) => {
    if (!clase.hora || !clase.hora.includes('-')) return;
    const match = clase.dia.match(/^[^\d\n]+/);
    const claseDay = match ? match[0].trim() : clase.dia;
    const dayName = dayMap[claseDay];
    if (!dayEvents[dayName]) dayEvents[dayName] = [];
    dayEvents[dayName].push(clase);
  });

  const orderedDays = days.filter(day => dayEvents[day]);
  if (orderedDays.length === 0) {
    mobileSchedule.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-calendar-x"></i>
        <p>No hay clases programadas esta semana</p>
      </div>
    `;
  } else {
    orderedDays.forEach((day) => {
      const events = dayEvents[day];
      const dayCard = document.createElement("div");
      dayCard.className = "day-card";
      dayCard.innerHTML = `<h4>${day}</h4>`;
      events.sort((a, b) => {
        const timeA = a.hora.split(' - ')[0];
        const timeB = b.hora.split(' - ')[0];
        return normalizeTime(timeA).localeCompare(normalizeTime(timeB));
      });
      events.forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.className = "mobile-event";
        const courseName = event.curso.split("(")[0].trim();
        const color = getColorForCourse(courseName);
        eventDiv.style.borderLeftColor = color;
        const modalityHTML = event.modalidad
          ? `<span class="modality" style="background-color: ${color}">${event.modalidad}</span>`
          : '';
        eventDiv.innerHTML = `
          <h5>${courseName}</h5>
          <div class="time">${event.hora}</div>
          ${modalityHTML}
          <div class="course-actions-mobile d-none">
            <i class="bi bi-journal-plus action-icon" title="Agregar nota" data-course="${courseName}"></i>
            <i class="bi bi-link-45deg action-icon" title="Agregar recurso" data-course="${courseName}"></i>
          </div>
        `;
        // Evento para click en móvil
        eventDiv.addEventListener("click", (e) => {
          const actions = eventDiv.querySelector(".course-actions-mobile");
          if (actions.classList.contains("d-none")) {
            actions.classList.remove("d-none");
            actions.classList.add("d-flex");
          } else {
            actions.classList.add("d-none");
            actions.classList.remove("d-flex");
          }
          e.stopPropagation();
        });
        dayCard.appendChild(eventDiv);
      });
      mobileSchedule.appendChild(dayCard);
    });
  }

  // Generar lista de actividades
  userData.actividades.forEach((actividad) => {
    const activityDiv = document.createElement("div");
    activityDiv.className = "activity-item";
    let badgeClass = "badge-pending";
    let statusText = "Pendiente";
    if (actividad.estado === "Entregada") {
      badgeClass = "badge-delivered";
      statusText = "Entregada";
    } else if (actividad.estado === "Vencida") {
      badgeClass = "badge-overdue";
      statusText = "Vencida";
    } else if (actividad.estado === "Por entregar") {
      badgeClass = "badge-pending";
      statusText = "Por entregar";
    } else if (!actividad.estado) {
      badgeClass = "badge-pending";
      statusText = "Pendiente";
    }
    const activityName = actividad.nombreActividad
      .replace(/🔴|📝|📌/g, "")
      .trim();
    const horaDisplay = actividad.hora && !actividad.hora.includes(actividad.curso)
      ? actividad.hora
      : 'Sin hora específica';
    activityDiv.innerHTML = `
      <div class="activity-name">
        <strong>${activityName}</strong>
        <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.25rem;">
          ${actividad.curso} • ${horaDisplay}
        </div>
      </div>
      <span class="activity-badge ${badgeClass}">${statusText}</span>
    `;
    if (actividad.estado === "Entregada") {
      deliveredActivities.appendChild(activityDiv);
    } else {
      pendingActivities.appendChild(activityDiv);
    }
  });

  // Mostrar estado vacío si no hay actividades
  if (deliveredActivities.children.length === 0) {
    deliveredActivities.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-check-circle"></i>
        <p>No hay actividades entregadas</p>
      </div>
    `;
  }
  if (pendingActivities.children.length === 0) {
    pendingActivities.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-clock"></i>
        <p>No hay actividades pendientes</p>
      </div>
    `;
  }

  // Eventos para los iconos de nota y recurso
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("bi-journal-plus")) {
      const courseName = e.target.getAttribute("data-course");
      document.getElementById("noteCourseName").value = courseName;
      const modal = new bootstrap.Modal(document.getElementById("addNoteModal"));
      modal.show();
    } else if (e.target.classList.contains("bi-link-45deg")) {
      const courseName = e.target.getAttribute("data-course");
      document.getElementById("resourceCourseName").value = courseName;
      const modal = new bootstrap.Modal(document.getElementById("addResourceModal"));
      modal.show();
    }
  });

  // Guardar nota
  document.getElementById("saveNote").addEventListener("click", () => {
    const courseName = document.getElementById("noteCourseName").value;
    const noteContent = document.getElementById("noteContent").value;
    alert(`Nota guardada para ${courseName}: ${noteContent}`);
    const modal = bootstrap.Modal.getInstance(document.getElementById("addNoteModal"));
    modal.hide();
  });

  // Guardar recurso
  document.getElementById("saveResource").addEventListener("click", () => {
    const courseName = document.getElementById("resourceCourseName").value;
    const resourceName = document.getElementById("resourceName").value;
    const resourceLink = document.getElementById("resourceLink").value;
    alert(`Recurso guardado para ${courseName}: ${resourceName} (${resourceLink})`);
    const modal = bootstrap.Modal.getInstance(document.getElementById("addResourceModal"));
    modal.hide();
  });
});
