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

  // 🔹 IMPROVED: Mejor verificación de servidor libre
  async function getFreeServer() {
    console.log("Checking server availability...");
    
    // Intentar todos en paralelo primero
    const checks = servers.map(async (server) => {
      try {
        const response = await fetchWithTimeout(`${server}/status`, {}, 3000);
        const data = await response.json();
        console.log(`Server ${server}: busy=${data.busy}, browser=${data.browserActive}`);
        return { server, data, available: !data.busy };
      } catch (err) {
        console.warn(`Server ${server} failed:`, err.name);
        return { server, data: null, available: false };
      }
    });

    const results = await Promise.all(checks);
    const availableServers = results.filter(r => r.available);
    
    if (availableServers.length > 0) {
      // Retornar un servidor disponible aleatorio para balancear carga
      const randomServer = availableServers[Math.floor(Math.random() * availableServers.length)];
      console.log(`Selected server: ${randomServer.server}`);
      return randomServer.server;
    }

    // Si ninguno está disponible, intentar secuencial con timeout más largo
    console.log("No servers available in parallel check, trying sequential...");
    for (const server of servers) {
      try {
        const res = await fetchWithTimeout(`${server}/status`, {}, 8000);
        const data = await res.json();
        if (!data.busy) {
          console.log(`Found available server: ${server}`);
          return server;
        }
      } catch (err) {
        console.warn(`Sequential check failed for ${server}:`, err.name);
      }
    }
    
    console.log("No servers available");
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
    console.log(`Attempting to connect to: ${server}`);
    
    const response = await fetch(`${server}/api/eventos-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // 🔹 IMPROVED: Manejo específico de servidor ocupado
    if (response.status === 503) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`SERVER_BUSY: ${errorData.error || "Servidor ocupado"}`);
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`BAD_REQUEST: ${errorData.error || "Credenciales inválidas"}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP_ERROR: ${response.status} - ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
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
            if (typeof line === "string" && line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (typeof line === "string" && line.startsWith("data:")) {
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
    } finally {
      try {
        reader.releaseLock();
      } catch (e) {
        // Ignore cleanup errors
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
          await sleep(800);
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

    // 🔹 IMPROVED: Reintentos inteligentes y mejor manejo de errores
    let lastError = null;
    let attemptCount = 0;
    const maxAttempts = 3;

    while (attemptCount < maxAttempts) {
      attemptCount++;
      
      try {
        await setLoadingMessage(
          loadingTextElement, 
          `Buscando servidor disponible... (${attemptCount}/${maxAttempts})`, 
          250
        );
        
        const server = await getFreeServer();
        
        if (!server) {
          if (attemptCount < maxAttempts) {
            await setLoadingMessage(
              loadingTextElement,
              `Servidores ocupados, reintentando en 3 segundos...`,
              250
            );
            await sleep(3000);
            continue;
          } else {
            await setLoadingMessage(
              loadingTextElement,
              "Todos los servidores están ocupados. Intenta más tarde.",
              250
            );
            await sleep(3000);
            break;
          }
        }

        await setLoadingMessage(
          loadingTextElement,
          `Conectando a servidor...`,
          250
        );

        let userData = {};
        let loginCompleted = false;

        await connectSSEWithBody(
          server,
          username,
          password,
          async (event, data) => {
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
              loginCompleted = true;
              
              loaderOverlay.style.display = "none";
              modalBody.classList.remove("modal-loading");
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
              throw new Error("LOGIN_ERROR: " + (data.mensaje || "Error desconocido"));
            }
          }
        );

        if (loginCompleted) {
          return; // Éxito, salir del bucle
        }

      } catch (error) {
        console.error(`Login attempt ${attemptCount} failed:`, error);
        lastError = error;

        if (error.message.includes('SERVER_BUSY')) {
          if (attemptCount < maxAttempts) {
            await setLoadingMessage(
              loadingTextElement,
              `Servidor ocupado, probando otro... (${attemptCount}/${maxAttempts})`,
              250
            );
            await sleep(2000);
            continue;
          }
        } else if (error.message.includes('BAD_REQUEST')) {
          await setLoadingMessage(
            loadingTextElement,
            "Credenciales incorrectas",
            250
          );
          await sleep(2000);
          break;
        } else if (error.message.includes('LOGIN_ERROR')) {
          await setLoadingMessage(
            loadingTextElement,
            error.message.replace('LOGIN_ERROR: ', ''),
            250
          );
          await sleep(2000);
          break;
        } else {
          if (attemptCount < maxAttempts) {
            await setLoadingMessage(
              loadingTextElement,
              `Error de conexión, reintentando... (${attemptCount}/${maxAttempts})`,
              250
            );
            await sleep(2000);
            continue;
          }
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    loaderOverlay.style.display = "none";
    modalBody.classList.remove("modal-loading");
    loginBtn.disabled = false;

    if (lastError) {
      let errorMsg = "Error al iniciar sesión. ";
      if (lastError.message.includes('SERVER_BUSY')) {
        errorMsg += "Todos los servidores están ocupados, intenta más tarde.";
      } else if (lastError.message.includes('BAD_REQUEST')) {
        errorMsg += "Revisa tus credenciales.";
      } else if (lastError.message.includes('LOGIN_ERROR')) {
        errorMsg += lastError.message.replace('LOGIN_ERROR: ', '');
      } else {
        errorMsg += "Revisa tu conexión a internet.";
      }
      alert(errorMsg);
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
    const clasesHoy = eventos.filter(
      (e) => e.tipo === "Clase" && e.fecha === hoy
    );
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