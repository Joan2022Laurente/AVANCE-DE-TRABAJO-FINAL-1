export function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  if (loginForm.dataset.listenerAdded === "true") return;

  // 🔹 Función para actualizar botones Login ↔ Logout
  function updateLoginLinks() {
    const isLoggedIn = !!localStorage.getItem("userData");

    // Navbar móvil
    const mobileLoginLink = document.querySelector(
      "#mobileNavbarMenu .nav-link.loginLinkMobile"
    );
    // Sidebar
    const sidebarLoginLink = document.querySelector(
      "#sidebar .loginLinkDesktop"
    );

    if (isLoggedIn) {
      if (mobileLoginLink) {
        mobileLoginLink.innerHTML =
          '<i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión';
        mobileLoginLink.removeAttribute("data-bs-toggle");
        mobileLoginLink.removeAttribute("data-bs-target");
        mobileLoginLink.onclick = cerrarSesion;
      }
      if (sidebarLoginLink) {
        sidebarLoginLink.innerHTML =
          '<i class="bi bi-box-arrow-right"></i><span class="link-text">Cerrar sesión</span>';
        sidebarLoginLink.removeAttribute("data-bs-toggle");
        sidebarLoginLink.removeAttribute("data-bs-target");
        sidebarLoginLink.onclick = cerrarSesion;
      }
    } else {
      if (mobileLoginLink) {
        mobileLoginLink.innerHTML =
          '<i class="bi bi-box-arrow-in-right me-2"></i>Login';
        mobileLoginLink.setAttribute("data-bs-toggle", "modal");
        mobileLoginLink.setAttribute("data-bs-target", "#loginModal");
        mobileLoginLink.onclick = null;
      }
      if (sidebarLoginLink) {
        sidebarLoginLink.innerHTML =
          '<i class="bi bi-box-arrow-in-right"></i><span class="link-text">Login</span>';
        sidebarLoginLink.setAttribute("data-bs-toggle", "modal");
        sidebarLoginLink.setAttribute("data-bs-target", "#loginModal");
        sidebarLoginLink.onclick = null;
      }
    }
  }

  // 🔹 Función para cerrar sesión
  function cerrarSesion(e) {
    e.preventDefault();
    localStorage.removeItem("userData");
    updateLoginLinks();
    window.location.href = "index.html"; // Redirigir al inicio
  }

  // 🔹 Actualizar links al cargar la página
  updateLoginLinks();

  // --- Código original de login ---
  loginBtn.addEventListener("click", () => {
    loginForm.requestSubmit();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("codigo")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    if (!username || !password) {
      alert("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    loginBtn.disabled = true;
    const modalBody = loginForm.closest(".modal-body");
    const loaderOverlay = document.getElementById("modalLoaderOverlay");
    const loadingTextElement = document.getElementById("loadingText");

    loaderOverlay.style.display = "flex";
    modalBody.classList.add("modal-loading");

    // Verificar si ya hay datos guardados en localStorage
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      const userData = JSON.parse(savedData);

      const mensajesLocales = [
        "Conectando con datos guardados",
        "Cargando cursos",
        "Cargando actividades",
        "Listo 🚀",
      ];

      for (let i = 0; i < mensajesLocales.length; i++) {
        setTimeout(() => {
          loadingTextElement.textContent = mensajesLocales[i];
          if (i === mensajesLocales.length - 1) {
            loaderOverlay.style.display = "none";
            modalBody.classList.remove("modal-loading");
            loginBtn.disabled = false;
            updateLoginLinks(); // 🔹 actualiza botones a "Cerrar sesión"
            window.location.href = "schedule.html";
          }
        }, i * 2000);
      }

      return;
    }

    try {
      const evtSource = new EventSource(
        `https://apiutp-1.onrender.com/api/eventos-stream?username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`
      );

      let userData = {};

      evtSource.addEventListener("estado", (event) => {
        const data = JSON.parse(event.data);
        loadingTextElement.textContent = data.mensaje;
      });

      evtSource.addEventListener("nombre", (event) => {
        const data = JSON.parse(event.data);
        userData.nombreEstudiante = data.nombreEstudiante;
      });

      evtSource.addEventListener("eventos", (event) => {
        const data = JSON.parse(event.data);
        userData.eventos = data.eventos;
      });

      evtSource.addEventListener("semana", (event) => {
        const data = JSON.parse(event.data);
        userData.semanaInfo = data.semanaInfo;
      });

      evtSource.addEventListener("fin", () => {
        userData.success = true;
        localStorage.setItem("userData", JSON.stringify(userData));
        loaderOverlay.style.display = "none";
        evtSource.close();
        updateLoginLinks(); // 🔹 cambia a "Cerrar sesión"
        window.location.href = "schedule.html";
      });

      evtSource.addEventListener("error", () => {
        loaderOverlay.style.display = "none";
        evtSource.close();
        alert("Error al iniciar sesión, revisa tus credenciales.");
      });
    } catch (error) {
      loaderOverlay.style.display = "none";
      alert("Error al iniciar sesión, revisa tus credenciales.");
    } finally {
      modalBody.classList.remove("modal-loading");
      loginBtn.disabled = false;
    }
  });

  loginForm.dataset.listenerAdded = "true";
}
