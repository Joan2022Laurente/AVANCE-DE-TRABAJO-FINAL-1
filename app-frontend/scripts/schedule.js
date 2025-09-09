document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData || !userData.success) {
    window.location.href = "index.html";
    return;
  }

  const scheduleBody = document.getElementById("scheduleBody");
  const deliveredActivities = document.getElementById("deliveredActivities");
  const pendingActivities = document.getElementById("pendingActivities");

  // Limpiar contenido previo
  scheduleBody.innerHTML = "";
  deliveredActivities.innerHTML = "";
  pendingActivities.innerHTML = "";

  // Agrupar eventos por tipo
  const clases = userData.eventos.filter(e => e.tipo === "Clase");
  const actividades = userData.eventos.filter(e => e.tipo === "Actividad");

  // Generar filas para clases (por horario)
  clases.forEach((clase) => {
    const dia = clase.curso.split(" ").find(d =>
      ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].includes(d)
    );
    if (!dia) return;

    const hora = clase.hora;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${hora}</td>
      <td>${dia === "Lunes" ? `<strong>${clase.curso}</strong><br><small>${clase.modalidad}</small>` : ""}</td>
      <td>${dia === "Martes" ? `<strong>${clase.curso}</strong><br><small>${clase.modalidad}</small>` : ""}</td>
      <td>${dia === "Miércoles" ? `<strong>${clase.curso}</strong><br><small>${clase.modalidad}</small>` : ""}</td>
      <td>${dia === "Jueves" ? `<strong>${clase.curso}</strong><br><small>${clase.modalidad}</small>` : ""}</td>
      <td>${dia === "Viernes" ? `<strong>${clase.curso}</strong><br><small>${clase.modalidad}</small>` : ""}</td>
    `;
    scheduleBody.appendChild(tr);
  });

  // Generar listas para actividades
  actividades.forEach((actividad) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>📌 <strong>${actividad.nombreActividad}</strong></span>
      <span class="badge ${actividad.estado === "Entregada" ? "bg-success" : "bg-danger"}">
        ${actividad.estado || "Pendiente"}
      </span>
    `;
    if (actividad.estado === "Entregada") {
      deliveredActivities.appendChild(li);
    } else {
      pendingActivities.appendChild(li);
    }
  });
});
