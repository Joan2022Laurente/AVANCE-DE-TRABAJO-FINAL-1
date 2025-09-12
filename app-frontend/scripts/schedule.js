document.addEventListener("DOMContentLoaded", () => {
 
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData || !userData.success) {
    window.location.href = "index.html";
    return;
  }

  // Update header information
  document.getElementById("cycleInfo").textContent = userData.semanaInfo.ciclo;
  document.getElementById(
    "weekInfo"
  ).textContent = `${userData.semanaInfo.semanaActual} ${userData.semanaInfo.fechas}`;

  // Get elements
  const scheduleTableBody = document.getElementById("scheduleTableBody");
  const mobileSchedule = document.getElementById("mobileSchedule");
  const deliveredActivities = document.getElementById("deliveredActivities");
  const pendingActivities = document.getElementById("pendingActivities");

  // Clear previous content
  scheduleTableBody.innerHTML = "";
  mobileSchedule.innerHTML = "";
  deliveredActivities.innerHTML = "";
  pendingActivities.innerHTML = "";

  // Filter events
  const clases = userData.eventos.filter((e) => e.tipo === "Clase");
  const actividades = userData.eventos.filter((e) => e.tipo === "Actividad");

  // Generate desktop schedule
const timeSlots = [
  "08:00 a.m. - 09:30 a.m.",
  "08:00 a.m. - 10:00 a.m.",
  "09:00 a.m. - 11:00 a.m.",
  "10:00 a.m. - 12:00 p.m.",
  "02:00 p.m. - 04:00 p.m.",
  "05:00 p.m.",
  "06:00 p.m.",
  "06:30 p.m. - 08:00 p.m.",
  "11:59 p.m."
];

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo",
  ];

  timeSlots.forEach((timeSlot) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td style="font-weight: 600;">${timeSlot}</td>`;

    days.forEach((day) => {
      const dayClasses = clases.filter((clase) => {
        return clase.curso.includes(day) && clase.hora === timeSlot;
      });

      const cell = document.createElement("td");
      if (dayClasses.length > 0) {
        dayClasses.forEach((clase) => {
          const courseBlock = document.createElement("div");
          courseBlock.className = "course-block";
          const courseName = clase.curso.split("(")[0].trim();
          courseBlock.innerHTML = `
                                ${courseName}
                                <small>${clase.modalidad}</small>
                            `;
          cell.appendChild(courseBlock);
        });
      }
      row.appendChild(cell);
    });

    scheduleTableBody.appendChild(row);
  });

  // Generate mobile schedule
  const dayEvents = {};
  clases.forEach((clase) => {
    const day = clase.curso.split("(")[0].split(" ").pop();
    if (!dayEvents[day]) dayEvents[day] = [];
    dayEvents[day].push(clase);
  });

  Object.entries(dayEvents).forEach(([day, events]) => {
    const dayCard = document.createElement("div");
    dayCard.className = "day-card";
    dayCard.innerHTML = `<h4>${day}</h4>`;

    events.forEach((event) => {
      const eventDiv = document.createElement("div");
      eventDiv.className = "mobile-event";
      const courseName = event.curso.split("(")[0].trim();
      eventDiv.innerHTML = `
                        <h5>${courseName}</h5>
                        <div class="time">${event.hora}</div>
                        <span class="modality">${event.modalidad}</span>
                    `;
      dayCard.appendChild(eventDiv);
    });

    mobileSchedule.appendChild(dayCard);
  });

  // Generate activities
  actividades.forEach((actividad) => {
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
    }

    const activityName = actividad.nombreActividad
      .replace(/🔴|📝|📌/g, "")
      .trim();

    activityDiv.innerHTML = `
                    <div class="activity-name">
                        <strong>${activityName}</strong>
                        <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.25rem;">
                            ${actividad.curso} • ${actividad.hora}
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

  // Show empty state if no activities
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
