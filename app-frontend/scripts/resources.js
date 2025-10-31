// ==============================
// 📚 RESOURCES.JS (versión conectada al backend Spring Boot)
// ==============================

// ---- Obtener datos del usuario desde localStorage ----
function getUserData() {
  const rawData = localStorage.getItem("userData");
  if (!rawData) return null;
  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error al parsear userData:", error);
    return null;
  }
}

// ---- Renderizar los recursos desde el backend ----
function renderResources(resources) {
  const container = document.getElementById("resources-content");
  const emptyState = document.getElementById("empty-state");
  container.innerHTML = "";

  if (!resources || resources.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  const resourceList = document.createElement("div");
  resourceList.className = "row g-3";

  resources.forEach((res) => {
    const card = document.createElement("div");
    card.className = "col-md-6 col-lg-4";
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${res.titulo}</h5>
          <p class="card-text small text-muted mb-2">${res.descripcion || "Sin descripción"}</p>
          <p class="card-text">
            <span class="badge bg-secondary me-2">${res.categoria}</span>
            <a href="${res.enlace}" target="_blank" class="text-decoration-none">
              <i class="bi bi-box-arrow-up-right"></i> Abrir
            </a>
          </p>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <small class="text-muted">${new Date(res.fechaCreacion).toLocaleDateString()}</small>
          <button class="btn btn-sm btn-outline-danger delete-resource" data-id="${res.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
    resourceList.appendChild(card);
  });

  container.appendChild(resourceList);

  // Evento de eliminación
  document.querySelectorAll(".delete-resource").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("button").dataset.id;
      await deleteResource(id);
    });
  });
}

// ---- Obtener los recursos desde el backend ----
async function loadUserResources(userId) {
  try {
    const response = await fetch(`http://localhost:8081/api/resources/user/${userId}`);
    if (!response.ok) throw new Error("Error al obtener recursos del servidor");

    const resources = await response.json();
    console.log("📦 Recursos obtenidos:", resources);

    renderResources(resources);
  } catch (error) {
    console.error("Error al cargar recursos:", error);
  }
}

// ---- Guardar un nuevo recurso en el backend ----
async function handleAddResource(event) {
  event.preventDefault();

  const title = document.getElementById("resource-title").value.trim();
  const link = document.getElementById("resource-link").value.trim();
  const category = document.getElementById("resource-category").value || "Otro";
  const description = document.getElementById("resource-description").value.trim();

  if (!title || !link) {
    alert("Por favor completa los campos obligatorios.");
    return;
  }

  const userData = getUserData();
  if (!userData || !userData.id) {
    alert("Error: usuario no identificado");
    return;
  }

  // 🆕 Obtener el ID del curso seleccionado (desde localStorage)
  const selectedCourseId = localStorage.getItem("selectedCourseId");
  const selectedCourseName = localStorage.getItem("selectedCourse");
  console.log("📘 Curso actual:", selectedCourseName, "(ID:", selectedCourseId, ")");

  // 🧩 Crear payload del recurso
  const payload = {
    titulo: title,
    enlace: link,
    categoria: category,
    descripcion: description,
    fechaCreacion: new Date().toISOString(),
    courseId: selectedCourseId || null, // Solo si tu backend lo soporta
  };

  try {
    const response = await fetch(`http://localhost:8081/api/resources/user/${userData.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Error al guardar recurso en el servidor");

    const saved = await response.json();
    console.log("✅ Recurso guardado:", saved);

    // Recargar lista actualizada
    await loadUserResources(userData.id);

    // Limpiar formulario y cerrar modal
    document.getElementById("add-resource-form").reset();
    bootstrap.Modal.getInstance(document.getElementById("addResourceModal")).hide();

  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el recurso en el servidor.");
  }
}

// ---- Eliminar un recurso del backend ----
async function deleteResource(resourceId) {
  if (!confirm("¿Estás seguro de que deseas eliminar este recurso?")) return;

  try {
    const response = await fetch(`http://localhost:8081/api/resources/${resourceId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar el recurso");

    console.log("🗑️ Recurso eliminado correctamente");
    const userData = getUserData();
    await loadUserResources(userData.id);
  } catch (error) {
    console.error("Error al eliminar recurso:", error);
    alert("No se pudo eliminar el recurso en el servidor.");
  }
}

// ---- Volver a la lista de cursos ----
function goBackToCourses() {
  window.location.href = "index.html";
}

// ---- Inicializar la página de recursos ----
function initResourcesPage() {
  const userData = getUserData();
  if (!userData || !userData.id) {
    alert("Error: no hay usuario activo.");
    window.location.href = "index.html";
    return;
  }

  // 🆕 Mostrar el nombre del curso actual (opcional)
  const selectedCourseId = localStorage.getItem("selectedCourseId");
  const selectedCourseName = localStorage.getItem("selectedCourse");
  if (selectedCourseName && document.getElementById("course-title")) {
    document.getElementById("course-title").textContent = selectedCourseName;
  }

  document.getElementById("back-to-courses").addEventListener("click", goBackToCourses);

  // Cargar recursos del usuario
  loadUserResources(userData.id);

  // Evento de guardado
  const form = document.getElementById("add-resource-form");
  form.addEventListener("submit", handleAddResource);
}

// ---- Ejecutar al cargar DOM ----
document.addEventListener("DOMContentLoaded", initResourcesPage);
