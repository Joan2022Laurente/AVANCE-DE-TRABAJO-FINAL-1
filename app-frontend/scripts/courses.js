// ==============================
// 📚 COURSES.JS - VERSIÓN MEJORADA CON MODAL DE OPCIONES
// ==============================

const API_URL = "http://localhost:8081/api";
let currentCourse = null;

// ---- Obtener el código del usuario actual ----
function getUserCode() {
  const rawData = localStorage.getItem("userData");
  if (!rawData) return null;
  try {
    const parsed = JSON.parse(rawData);
    return parsed.codigo || null;
  } catch (error) {
    console.error("Error al parsear userData:", error);
    return null;
  }
}

// ---- Mostrar notificación toast ----
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('toast-notification');
  const toastBody = toastEl.querySelector('.toast-body');
  const toastIcon = toastEl.querySelector('.toast-header i');
  
  toastBody.textContent = message;
  
  if (type === 'success') {
    toastIcon.className = 'bi bi-check-circle-fill text-success me-2';
  } else if (type === 'error') {
    toastIcon.className = 'bi bi-exclamation-circle-fill text-danger me-2';
  } else if (type === 'info') {
    toastIcon.className = 'bi bi-info-circle-fill text-primary me-2';
  }
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ---- Mostrar skeleton loader ----
function showSkeletonLoader() {
  document.getElementById('skeleton-loader').style.display = 'grid';
  document.getElementById('courses-content').style.display = 'none';
  document.getElementById('empty-state').style.display = 'none';
}

// ---- Ocultar skeleton loader ----
function hideSkeletonLoader() {
  document.getElementById('skeleton-loader').style.display = 'none';
}

// ---- Obtener datos del usuario desde el backend ----
async function fetchUserFromBackend(id) {
  try {
    const res = await fetch(`${API_URL}/courses/usuario/${id}`);
    if (!res.ok) throw new Error("Usuario no encontrado");
    return await res.json();
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    showToast("Error al cargar los cursos", "error");
    return null;
  }
}

// ---- Actualizar estadísticas ----
function updateStats(courses) {
  const statsContainer = document.getElementById('courses-stats');
  const totalCourses = courses.length;
  
  document.getElementById('total-courses').textContent = totalCourses;
  statsContainer.style.display = totalCourses > 0 ? 'flex' : 'none';
}

// ---- Crear tarjeta de curso ----
function createCourseCard(course, index) {
  const card = document.createElement('div');
  card.className = 'course-card';
  card.style.animationDelay = `${index * 0.05}s`;
  card.dataset.courseId = course.id;
  card.dataset.courseName = course.nombre;
  card.dataset.courseTeacher = course.docente || "Sin docente";

  // Colores aleatorios para variedad visual
  const colors = [
    { bg: '#4f46e515', border: '#4f46e5', icon: '#4f46e5' },
    { bg: '#ec489915', border: '#ec4899', icon: '#ec4899' },
    { bg: '#06b6d415', border: '#06b6d4', icon: '#06b6d4' },
    { bg: '#8b5cf615', border: '#8b5cf6', icon: '#8b5cf6' },
    { bg: '#f5931515', border: '#f59315', icon: '#f59315' },
  ];
  const color = colors[index % colors.length];

  card.innerHTML = `
    <div class="course-card-header" style="background: ${color.bg};">
      <div class="course-icon" style="background: ${color.border}20; color: ${color.icon};">
        <i class="bi bi-book-half"></i>
      </div>
      <button class="course-menu-btn">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
    </div>
    
    <div class="course-card-body">
      <h3 class="course-title">${course.nombre}</h3>
      <div class="course-teacher">
        <i class="bi bi-person"></i>
        <span>${course.docente || "Sin docente"}</span>
      </div>
    </div>
    
    <div class="course-card-footer">
      <div class="course-stats-inline">
        <span class="stat-badge">
          <i class="bi bi-journal-text"></i>
          Recursos
        </span>
        <span class="stat-badge">
          <i class="bi bi-list-check"></i>
          Tareas
        </span>
      </div>
      <i class="bi bi-arrow-right course-arrow"></i>
    </div>
  `;

  return card;
}

// ---- Renderizar los cursos ----
function renderCourses(courses) {
  const content = document.getElementById("courses-content");
  const emptyState = document.getElementById("empty-state");

  content.innerHTML = "";

  if (!courses || courses.length === 0) {
    emptyState.style.display = "block";
    content.style.display = "none";
    updateStats([]);
    return;
  }

  emptyState.style.display = "none";
  content.style.display = "grid";

  courses.forEach((course, index) => {
    const card = createCourseCard(course, index);
    content.appendChild(card);
  });

  updateStats(courses);
  attachCardEventListeners();
}

// ---- Adjuntar eventos a las tarjetas ----
function attachCardEventListeners() {
  document.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Evitar abrir modal si se clickea el botón de menú
      if (e.target.closest('.course-menu-btn')) {
        return;
      }
      
      const courseId = card.dataset.courseId;
      const courseName = card.dataset.courseName;
      const courseTeacher = card.dataset.courseTeacher;
      
      openCourseModal(courseId, courseName, courseTeacher);
    });
  });
}

// ---- Abrir modal de opciones del curso ----
function openCourseModal(courseId, courseName, courseTeacher) {
  currentCourse = { id: courseId, name: courseName, teacher: courseTeacher };
  
  const modal = document.getElementById('course-modal');
  const modalName = document.getElementById('modal-course-name');
  const modalTeacher = document.getElementById('modal-course-teacher');
  
  modalName.textContent = courseName;
  modalTeacher.textContent = courseTeacher;
  
  // Mostrar modal con animación
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// ---- Cerrar modal ----
function closeCourseModal() {
  const modal = document.getElementById('course-modal');
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll
  currentCourse = null;
}

// ---- Navegar a recursos ----
function navigateToResources(courseId, courseName) {
  localStorage.setItem("selectedCourseId", courseId);
  localStorage.setItem("selectedCourse", courseName);
  window.location.href = "resources.html";
}

// ---- Navegar a tareas ----
function navigateToTasks(courseId, courseName) {
  localStorage.setItem("selectedCourseId", courseId);
  localStorage.setItem("selectedCourse", courseName);
  window.location.href = "tasks.html";
}

// ---- Configurar eventos del modal ----
function setupModalEvents() {
  const modal = document.getElementById('course-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('close-modal');
  const optionButtons = document.querySelectorAll('.course-option-btn');
  
  // Cerrar con backdrop
  backdrop.addEventListener('click', closeCourseModal);
  
  // Cerrar con botón X
  closeBtn.addEventListener('click', closeCourseModal);
  
  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeCourseModal();
    }
  });
  
  // Botones de opciones
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentCourse) return;
      
      const action = btn.dataset.action;
      
      if (action === 'resources') {
        navigateToResources(currentCourse.id, currentCourse.name);
      } else if (action === 'tasks') {
        navigateToTasks(currentCourse.id, currentCourse.name);
      }
    });
  });
}

// ---- Inicializar la página de cursos ----
async function initCoursesPage() {
  const id = localStorage.getItem("userId");
  
  if (!id) {
    console.error("No se encontró el ID del usuario");
    showToast("Error: Usuario no identificado", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  showSkeletonLoader();

  const courses = await fetchUserFromBackend(id);
  
  // Delay para mejor UX
  setTimeout(() => {
    hideSkeletonLoader();
    
    if (!courses) {
      console.error("Cursos no encontrados en backend");
      document.getElementById('empty-state').style.display = 'block';
      return;
    }

    console.log("Cursos cargados desde backend:", courses);
    renderCourses(courses);
  }, 300);
}

// ---- Ejecutar al cargar DOM ----
document.addEventListener("DOMContentLoaded", () => {
  initCoursesPage();
  setupModalEvents();
});