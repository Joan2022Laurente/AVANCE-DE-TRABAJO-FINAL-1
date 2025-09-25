// login.js (reemplaza la impl. existente)
export function initLogin() {
  const servers = [
    "https://apiutp-1.onrender.com",
    "https://apiutp-2.onrender.com",
    "https://apiutp-3.onrender.com",
    "https://apiutp-4.onrender.com",
    "https://apiutp-5.onrender.com",
  ];

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  if (loginForm.dataset.listenerAdded === "true") return;

  // ---------- Helpers ----------
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function fetchWithTimeout(url, opts = {}, timeout = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        ...opts,
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  // Intenta muchos /status en paralelo (rápido) y devuelve el primero libre.
  async function getFreeServer() {
    const checks = servers.map((server) =>
      fetchWithTimeout(`${server}/status`, {}, 2500)
        .then((r) => r.json().then((data) => ({ server, data })))
        .catch((err) => {
          console.warn("status failed:", server, err && err.name);
          return null;
        })
    );

    const results = await Promise.all(checks);
    const free = results.find((r) => r && !r.data?.busy);
    if (free) return free.server;

    // fallback: secuencial
    for (const server of servers) {
      try {
        const res = await fetchWithTimeout(`${server}/status`, {}, 7000);
        const data = await res.json();
        if (!data.busy) return server;
      } catch {}
    }
    return null;
  }

  // Fade helper
  async function setLoadingMessage(el, msg, duration = 600) {
    if (!el) return;
    el.classList.add("fade-out");
    await new Promise((r) => setTimeout(r, duration));
    el.textContent = msg;
    el.classList.remove("fade-out");
  }

  // ---------- UI / login helpers ----------
  function updateLoginLinks() {
    const isLoggedIn = !!localStorage.getItem("userData");
    const mobileLoginLink = document.querySelector(
      "#mobileNavbarMenu .nav-link.loginLinkMobile"
    );
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

  function cerrarSesion(e) {
    e && e.preventDefault();
    localStorage.removeItem("userData");
    updateLoginLinks();
    window.location.href = "index.html";
  }

  updateLoginLinks();

  // ---------- SSE manual con POST ----------
  async function connectSSEWithBody(server, username, password, onMessage) {
    const response = await fetch(`${server}/api/eventos-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let parts = buffer.split("\n\n");
      buffer = parts.pop();

      for (const part of parts) {
        if (part.trim() === "") continue;
        const lines = part.split("\n");
        let eventName = "message";
        let eventData = "";

        for (const line of lines) {
          // 🔹 FIX: Verificar que line sea una cadena antes de usar startsWith
          if (typeof line === 'string' && line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (typeof line === 'string' && line.startsWith("data:")) {
            eventData += line.slice(5).trim();
          }
        }

        if (eventData) {
          try {
            onMessage(eventName, JSON.parse(eventData));
          } catch (e) {
            console.error("Error parseando SSE:", e, eventData);
          }
        }
      }
    }
  }

  // ---------- Submit/login ----------
  loginBtn.addEventListener("click", () => loginForm.requestSubmit());

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

    const savedData = localStorage.getItem("userData");
    if (savedData) {
      const mensajesLocales = [
        "Conectando con datos guardados",
        "Cargando cursos",
        "Cargando actividades",
        "Listo 🚀",
      ];
      try {
        for (let i = 0; i < mensajesLocales.length; i++) {
          await setLoadingMessage(loadingTextElement, mensajesLocales[i], 350);
          await sleep(1000); // 🔹 FIX: Cambié de 10000 a 1000ms para que no tarde tanto
        }
      } finally {
        loaderOverlay.style.display = "none";
        modalBody.classList.remove("modal-loading");
        loginBtn.disabled = false;
        updateLoginLinks();
        try {
          const loginModal = bootstrap.Modal.getInstance(
            document.getElementById("loginModal")
          );
          if (loginModal) loginModal.hide();
        } catch {}
        showWelcome(localStorage.getItem("userData"));
      }
      return;
    }

    try {
      await setLoadingMessage(loadingTextElement, "Buscando servidor...", 250);
      const server = await getFreeServer();
      if (!server) {
        await setLoadingMessage(
          loadingTextElement,
          "Todos los servidores están ocupados. Intenta más tarde.",
          250
        );
        loaderOverlay.style.display = "none";
        modalBody.classList.remove("modal-loading");
        loginBtn.disabled = false;
        return;
      }

      await setLoadingMessage(
        loadingTextElement,
        `Conectando a ${server}...`,
        250
      );

      let userData = {};

      await connectSSEWithBody(server, username, password, async (event, data) => {
        if (event === "estado") {
          await setLoadingMessage(
            loadingTextElement,
            data.mensaje || "Procesando...",
            250
          );
        }
        if (event === "nombre") {
          userData.nombreEstudiante = data.nombreEstudiante;
        }
        if (event === "semana") {
          userData.semanaInfo = data.semanaInfo;
        }
        if (event === "eventos") {
          userData.eventos = data.eventos;
        }
        if (event === "fin") {
          userData.success = true;
          localStorage.setItem("userData", JSON.stringify(userData));
          loaderOverlay.style.display = "none";
          updateLoginLinks();
          try {
            const loginModal = bootstrap.Modal.getInstance(
              document.getElementById("loginModal")
            );
            if (loginModal) loginModal.hide();
          } catch {}
          showWelcome(localStorage.getItem("userData"));
        }
        if (event === "error") {
          alert("Error en el login: " + (data.mensaje || "desconocido"));
        }
      });
    } catch (error) {
      console.error("Login flow error:", error);
      loaderOverlay.style.display = "none";
      alert("Error al iniciar sesión, revisa tus credenciales.");
    } finally {
      modalBody.classList.remove("modal-loading");
      loginBtn.disabled = false;
    }
  });

  loginForm.dataset.listenerAdded = "true";
}

// ---------- showWelcome ----------
export function showWelcome(userData) {
  try {
    const data = typeof userData === "string" ? JSON.parse(userData) : userData;
    if (!data) return;

    const nombre = data.nombreEstudiante || "Estudiante";
    const eventos = data.eventos || [];

    const hoy = new Date().toISOString().split("T")[0];
    const clasesHoy = eventos.filter((e) => e.tipo === "Clase" && e.fecha === hoy);
    const tieneClase = clasesHoy.length > 0;

    const actividadesPend = eventos.filter(
      (e) => e.tipo === "Actividad" && e.estado !== "Entregada"
    );

    const msg = `Hola ${nombre}.`;
    const submsg = tieneClase
      ? `Hoy tienes clase. Te quedan por hacer ${actividadesPend.length} actividades.`
      : `No tienes clase hoy. Te quedan por hacer ${actividadesPend.length} actividades.`;

    const elMsg = document.getElementById("welcome-msg");
    const elSub = document.getElementById("welcome-submsg");
    if (elMsg) elMsg.textContent = msg;
    if (elSub) elSub.textContent = submsg;

    const welcome = document.getElementById("welcome-screen");
    if (!welcome) return;
    welcome.classList.remove("hidden");
    void welcome.offsetWidth;
    welcome.classList.add("show");

    const goBtn = document.getElementById("goDashboardBtn");
    if (goBtn) {
      goBtn.onclick = () => {
        welcome.classList.remove("show");
        setTimeout(() => welcome.classList.add("hidden"), 500);
      };
    }
  } catch (err) {
    console.error("Error en showWelcome:", err);
  }
}