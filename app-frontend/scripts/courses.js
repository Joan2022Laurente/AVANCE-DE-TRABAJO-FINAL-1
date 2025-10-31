// ==============================
// 📚 COURSES.JS (versión conectada al backend)
// ==============================

const API_URL = "http://localhost:8081/api/users";

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

// ---- Obtener datos del usuario desde el backend ----
async function fetchUserFromBackend(codigo) {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    const users = await res.json();

    // Buscar el usuario por su código
    return users.find((u) => u.codigo === codigo) || null;
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    return null;
  }
}

// ---- Renderizar los cursos como tarjetas ----
function renderCourses(courses) {
  const content = document.getElementById("courses-content");
  const emptyState = document.getElementById("empty-state");

  if (!courses || courses.length === 0) {
    emptyState.style.display = "block";
    content.innerHTML = "";
    return;
  }

  emptyState.style.display = "none";
  content.innerHTML = "";

  courses.forEach((course) => {
    const card = document.createElement("div");
    card.className = "course-item";

    card.innerHTML = `
      <div class="course-card" data-course-id="${course.id}" data-course-name="${course.nombre}">
        <i class="bi bi-book"></i>
        <h3>${course.nombre}</h3>
        <p>${course.docente || "Sin docente"}</p>
      </div>
    `;

    content.appendChild(card);
  });

  // Evento click -> guarda ID y nombre del curso
  document.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", () => {
      const courseId = card.dataset.courseId;
      const courseName = card.dataset.courseName;
      navigateToResources(courseId, courseName);
    });
  });
}

function navigateToResources(courseId, courseName) {
  localStorage.setItem("selectedCourseId", courseId);
  localStorage.setItem("selectedCourse", courseName);
  window.location.href = "resources.html";
}
// ---- Inicializar la página de cursos ----
async function initCoursesPage() {
  const codigo = getUserCode();
  if (!codigo) {
    console.error("No se encontró código de usuario en localStorage");
    return;
  }

  const user = await fetchUserFromBackend(codigo);
  if (!user) {
    console.error("Usuario no encontrado en backend");
    return;
  }

  console.log("Usuario cargado desde backend:", user);
  renderCourses(user.courses || []);
}

// ---- Ejecutar al cargar DOM ----
document.addEventListener("DOMContentLoaded", initCoursesPage);
