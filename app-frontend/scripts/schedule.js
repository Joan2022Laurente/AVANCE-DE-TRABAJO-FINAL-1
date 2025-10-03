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

  // Filtrar eventos
  const clases = userData.eventos.filter((e) => e.tipo === "Clase");
  const actividades = userData.eventos.filter((e) => e.tipo === "Actividad");

  // Función para generar colores consistentes por curso
  const getColorForCourse = (courseName) => {
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
    
    // Generar un índice basado en el nombre del curso
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Función para normalizar horas (convierte a formato comparable)
  const normalizeTime = (timeStr) => {
    // Eliminar espacios extras y convertir a minúsculas
    timeStr = timeStr.toLowerCase().trim();
    
    // Extraer hora y minutos
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.|am|pm)/);
    if (!match) return timeStr;
    
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    
    // Convertir a formato 24 horas para comparación
    if (period.includes('p') && hours !== 12) {
      hours += 12;
    } else if (period.includes('a') && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Extraer todos los horarios únicos de las clases
  const uniqueTimeSlots = new Set();
  clases.forEach(clase => {
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

      const dayClasses = clases.filter((clase) => {
        // Validar que tenga hora válida
        if (!clase.hora || !clase.hora.includes('-')) return false;
        
        // Extrae solo el nombre del día, ignorando números o saltos de línea
        const match = clase.dia.match(/^[^\d\n]+/);
        const claseDay = match ? match[0].trim() : clase.dia;
        const claseDayFull = dayMap[claseDay];
        
        // Extraer hora de inicio de la clase
        const claseStartTime = clase.hora.split(" - ")[0];
        
        // Comparar usando normalización
        return claseDayFull === day && normalizeTime(claseStartTime) === normalizeTime(timeSlot);
      });

      if (dayClasses.length > 0) {
        dayClasses.forEach((clase) => {
          const courseBlock = document.createElement("div");
          courseBlock.className = "course-block";
          const courseName = clase.curso.split("(")[0].trim();
          courseBlock.style.backgroundColor = getColorForCourse(courseName);
          
          // Mostrar modalidad solo si existe
          const modalityText = clase.modalidad ? `<small>${clase.modalidad}</small>` : '';
          
          courseBlock.innerHTML = `
            ${courseName}
            ${modalityText}
          `;
          cell.appendChild(courseBlock);
        });
      }
      row.appendChild(cell);
    });
    scheduleTableBody.appendChild(row);
  });

  // Generar horario para mobile
  const dayEvents = {};
  clases.forEach((clase) => {
    // Solo incluir clases con hora válida
    if (!clase.hora || !clase.hora.includes('-')) return;
    
    const match = clase.dia.match(/^[^\d\n]+/);
    const claseDay = match ? match[0].trim() : clase.dia;
    const dayName = dayMap[claseDay];
    if (!dayEvents[dayName]) dayEvents[dayName] = [];
    dayEvents[dayName].push(clase);
  });

  // Ordenar días según el orden de la semana
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
      
      // Ordenar eventos por hora
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
        
        // Mostrar modalidad solo si existe
        const modalityHTML = event.modalidad 
          ? `<span class="modality" style="background-color: ${color}">${event.modalidad}</span>` 
          : '';
        
        eventDiv.innerHTML = `
          <h5>${courseName}</h5>
          <div class="time">${event.hora}</div>
          ${modalityHTML}
        `;
        dayCard.appendChild(eventDiv);
      });
      mobileSchedule.appendChild(dayCard);
    });
  }

  // Generar lista de actividades
  actividades.forEach((actividad) => {
    const activityDiv = document.createElement("div");
    activityDiv.className = "activity-item";
    let badgeClass = "badge-pending";
    let statusText = "Pendiente";

    // Manejar diferentes estados
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
      // Si no tiene estado, asumimos pendiente
      badgeClass = "badge-pending";
      statusText = "Pendiente";
    }

    const activityName = actividad.nombreActividad
      .replace(/🔴|📝|📌/g, "")
      .trim();
    
    // Manejar campo hora que puede contener el nombre del curso
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
});