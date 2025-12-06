// ==============================
// 📚 RESOURCES.JS - VERSIÓN MEJORADA CON UI/UX PREMIUM
// ==============================

const userId = localStorage.getItem("userId");
let allResources = [];
let currentFilter = "all";

// ---- Obtener datos del usuario ----
function getUserData() {
  const rawUserData = localStorage.getItem("userData");
  if (!rawUserData) return null;
  try {
    return JSON.parse(rawUserData);
  } catch (error) {
    console.error("Error al parsear userData:", error);
    return null;
  }
}

// ---- Mostrar notificación toast ----
function showToast(message, type = "success") {
  const toastEl = document.getElementById("toast-notification");
  const toastBody = toastEl.querySelector(".toast-body");
  const toastIcon = toastEl.querySelector(".toast-header i");

  toastBody.textContent = message;

  // Cambiar icono según tipo
  if (type === "success") {
    toastIcon.className = "bi bi-check-circle-fill text-success me-2";
  } else if (type === "error") {
    toastIcon.className = "bi bi-exclamation-circle-fill text-danger me-2";
  } else if (type === "info") {
    toastIcon.className = "bi bi-info-circle-fill text-primary me-2";
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ---- Actualizar estadísticas ----
function updateStats(resources) {
  const statsContainer = document.getElementById("resources-stats");
  const total = resources.length;
  const links = resources.filter((r) => r.categoria === "link").length;
  const videos = resources.filter((r) => r.categoria === "video").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-links").textContent = links;
  document.getElementById("stat-videos").textContent = videos;

  statsContainer.style.display = total > 0 ? "flex" : "none";
}

// ---- Obtener icono según categoría ----
function getCategoryIcon(category) {
  const icons = {
    document: "bi-file-earmark-text",
    link: "bi-link-45deg",
    video: "bi-play-circle",
    other: "bi-three-dots",
  };
  return icons[category] || icons["other"];
}

// ---- Obtener color según categoría ----
function getCategoryColor(category) {
  const colors = {
    document: "#4f46e5",
    link: "#06b6d4",
    video: "#ec4899",
    other: "#8b5cf6",
  };
  return colors[category] || colors["other"];
}

// ---- Crear tarjeta de recurso con diseño mejorado ----
function createResourceCard(resource) {
  const card = document.createElement("div");
  card.className = "col-md-6 col-lg-4";
  card.dataset.category = resource.categoria;
  card.dataset.title = resource.titulo.toLowerCase();

  const categoryIcon = getCategoryIcon(resource.categoria);
  const categoryColor = getCategoryColor(resource.categoria);
  const date = new Date(resource.fechaCreacion);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  card.innerHTML = `
    <div class="resource-card">
      <div class="resource-card-header" style="background: linear-gradient(135deg, ${categoryColor}15, transparent);">
        <div class="resource-category-badge" style="background: ${categoryColor}20; color: ${categoryColor};">
          <i class="bi ${categoryIcon}"></i>
          <span>${resource.categoria}</span>
        </div>
        <button class="resource-menu-btn" data-id="${resource.id}">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      
      <div class="resource-card-body">
        <h3 class="resource-title">${resource.titulo}</h3>
        <p class="resource-description">
          ${resource.descripcion || "Sin descripción disponible"}
        </p>
        
        <a href="${resource.enlace}" target="_blank" class="resource-link">
          <i class="bi bi-box-arrow-up-right"></i>
          <span>Abrir recurso</span>
        </a>
      </div>
      
      <div class="resource-card-footer">
        <div class="resource-date">
          <i class="bi bi-calendar3"></i>
          <span>${formattedDate}</span>
        </div>
        <button class="btn-delete-resource" data-id="${
          resource.id
        }" title="Eliminar recurso">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// ---- Renderizar recursos con animaciones ----
function renderResources(resources, animate = true) {
  const container = document.getElementById("resources-content");
  const listContainer = document.getElementById("resources-list");
  const emptyState = document.getElementById("empty-state");
  const filtersSection = document.getElementById("filters-section");
  const noResults = document.getElementById("no-results");

  listContainer.innerHTML = "";

  if (!resources || resources.length === 0) {
    container.style.display = "none";
    emptyState.style.display = "block";
    filtersSection.style.display = "none";
    noResults.style.display = "none";
    updateStats([]);
    return;
  }

  emptyState.style.display = "none";
  container.style.display = "block";
  filtersSection.style.display = "flex";

  // Aplicar filtros
  const filteredResources = filterAndSearchResources(resources);

  if (filteredResources.length === 0) {
    container.style.display = "none";
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  filteredResources.forEach((resource, index) => {
    const card = createResourceCard(resource);
    if (animate) {
      card.style.animationDelay = `${index * 0.05}s`;
    }
    listContainer.appendChild(card);
  });

  updateStats(resources);
  attachCardEventListeners();
}

// ---- Filtrar y buscar recursos ----
function filterAndSearchResources(resources) {
  const searchTerm =
    document.getElementById("search-input")?.value.toLowerCase() || "";

  return resources.filter((resource) => {
    const matchesFilter =
      currentFilter === "all" || resource.categoria === currentFilter;
    const matchesSearch =
      resource.titulo.toLowerCase().includes(searchTerm) ||
      (resource.descripcion || "").toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });
}

// ---- Adjuntar eventos a las tarjetas ----
function attachCardEventListeners() {
  // Botones de eliminar
  document.querySelectorAll(".btn-delete-resource").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      await deleteResource(id);
    });
  });
}

// ---- Mostrar skeleton loader ----
function showSkeletonLoader() {
  document.getElementById("skeleton-loader").style.display = "block";
  document.getElementById("resources-content").style.display = "none";
  document.getElementById("empty-state").style.display = "none";
}

// ---- Ocultar skeleton loader ----
function hideSkeletonLoader() {
  document.getElementById("skeleton-loader").style.display = "none";
}

// ---- Cargar recursos del curso ----
async function loadCourseResources(courseId) {
  showSkeletonLoader();

  try {
    const response = await fetch(
      `https://utpschedulebackendjava.onrender.com/api/resources/course/${courseId}`
    );

    if (!response.ok) throw new Error("Error al obtener recursos del curso");

    const resources = await response.json();
    allResources = resources;

    console.log("📘 Recursos del curso:", resources);

    // Pequeño delay para mejor UX
    setTimeout(() => {
      hideSkeletonLoader();
      renderResources(resources);
    }, 300);
  } catch (error) {
    hideSkeletonLoader();
    console.error("Error al cargar recursos:", error);
    showToast("Error al cargar los recursos", "error");
  }
}


// ---- Guardar nuevo recurso ----
async function handleAddResource(event) {
  event.preventDefault();

  const title = document.getElementById("resource-title").value.trim();
  const link = document.getElementById("resource-link").value.trim();
  const categoryInput = document.querySelector('input[name="category"]:checked');
  const category = categoryInput ? categoryInput.value : "";
  const description = document.getElementById("resource-description").value.trim();

  // Validación básica
  if (!title || !link || !category) {
    showToast("Por favor completa todos los campos obligatorios", "error");
    return;
  }

  // Validación de usuario
  if (!userId) {
    showToast("Error: usuario no identificado", "error");
    return;
  }

  // Validación de curso
  const selectedCourseId = localStorage.getItem("selectedCourseId");
  if (!selectedCourseId) {
    showToast("Error: no se seleccionó un curso", "error");
    return;
  }

  const payload = {
    titulo: title,
    enlace: link,
    categoria: category,
    descripcion: description || "",
  };

  // --- CORRECCIÓN AQUÍ ---
  // Buscamos el botón por su atributo 'form', no como hijo del formulario
  const submitBtn = document.querySelector('button[type="submit"][form="add-resource-form"]');
  
  let originalText = "";
  
  // Solo intentamos manipular el botón si existe
  if (submitBtn) {
    originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
  }

  try {
    const response = await fetch(
      `https://utpschedulebackendjava.onrender.com/api/resources/user/${userId}/course/${selectedCourseId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error("Error al guardar recurso");

    // Recargar recursos
    await loadCourseResources(selectedCourseId);

    // Cerrar modal
    const modalEl = document.getElementById("addResourceModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Limpiar formulario
    document.getElementById("add-resource-form").reset();
    document.querySelectorAll('input[name="category"]').forEach((input) => (input.checked = false));

    showToast("Recurso agregado exitosamente", "success");
  } catch (error) {
    console.error(error);
    showToast("No se pudo guardar el recurso", "error");
  } finally {
    // Restaurar el botón original (solo si existe)
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}

// ---- Eliminar recurso con confirmación ----
async function deleteResource(resourceId) {
  // Confirmación moderna
  const confirmDelete = confirm(
    "¿Estás seguro de eliminar este recurso?\nEsta acción no se puede deshacer."
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `https://utpschedulebackendjava.onrender.com/api/resources/${resourceId}`,
      { method: "DELETE" }
    );

    if (!response.ok) throw new Error("Error al eliminar el recurso");

    console.log("🗑️ Recurso eliminado correctamente");

    const selectedCourseId = localStorage.getItem("selectedCourseId");
    await loadCourseResources(selectedCourseId);

    showToast("Recurso eliminado correctamente", "success");
  } catch (error) {
    console.error("Error al eliminar recurso:", error);
    showToast("No se pudo eliminar el recurso", "error");
  }
}

// ---- Configurar filtros ----
function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Actualizar botones activos
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Aplicar filtro
      currentFilter = btn.dataset.filter;
      renderResources(allResources, false);
    });
  });
}

// ---- Configurar búsqueda ----
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderResources(allResources, false);
      }, 300);
    });
  }
}

// ---- Volver a cursos ----
function goBackToCourses() {
  window.location.href = "courses.html";
}

// ---- Inicializar página ----
function initResourcesPage() {
  const userData = getUserData();

  if (!userData || !userId) {
    showToast("Error: no hay usuario activo", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  const selectedCourseId = localStorage.getItem("selectedCourseId");
  const selectedCourseName = localStorage.getItem("selectedCourse");

  if (!selectedCourseId) {
    showToast("Error: no se seleccionó un curso", "error");
    setTimeout(() => {
      window.location.href = "courses.html";
    }, 1500);
    return;
  }

  // Actualizar títulos
  if (selectedCourseName) {
    const titleElement = document.getElementById("course-title");
    const breadcrumbElement = document.getElementById("course-name-breadcrumb");

    if (titleElement) titleElement.textContent = selectedCourseName;
    if (breadcrumbElement) breadcrumbElement.textContent = selectedCourseName;
  }

  // Event listeners
  document
    .getElementById("back-to-courses")
    .addEventListener("click", goBackToCourses);
  document
    .getElementById("add-resource-form")
    .addEventListener("submit", handleAddResource);

  // Configurar filtros y búsqueda
  setupFilters();
  setupSearch();

  // Limpiar formulario al abrir modal
  const modal = document.getElementById("addResourceModal");
  modal.addEventListener("show.bs.modal", () => {
    document.getElementById("add-resource-form").reset();
    document
      .querySelectorAll('input[name="category"]')
      .forEach((input) => (input.checked = false));
  });

  // Cargar recursos
  loadCourseResources(selectedCourseId);
}

// ---- Ejecutar al cargar DOM ----
document.addEventListener("DOMContentLoaded", initResourcesPage);
