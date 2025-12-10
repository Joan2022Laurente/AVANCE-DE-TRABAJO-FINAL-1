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

    for (const server of servers) {
      try {
        const res = await fetchWithTimeout(`${server}/status`, {}, 7000);
        const data = await res.json();
        if (!data.busy) return server;
      } catch (err) {
        // ignorar
      }
    }
    return null;
  }

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
    const mobileLoginLink = document.querySelector("#navbarMenu .nav-link.loginLinkMobile");
    const sidebarLoginLink = document.querySelector("#sidebar .loginLinkDesktop");

    if (isLoggedIn) {
      if (mobileLoginLink) {
        mobileLoginLink.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión';
        mobileLoginLink.removeAttribute("data-bs-toggle");
        mobileLoginLink.removeAttribute("data-bs-target");
        mobileLoginLink.onclick = cerrarSesion;
      }
      if (sidebarLoginLink) {
        sidebarLoginLink.innerHTML = '<i class="bi bi-box-arrow-right"></i><span class="link-text">Cerrar sesión</span>';
        sidebarLoginLink.removeAttribute("data-bs-toggle");
        sidebarLoginLink.removeAttribute("data-bs-target");
        sidebarLoginLink.onclick = cerrarSesion;
      }
    } else {
      if (mobileLoginLink) {
        mobileLoginLink.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Login';
        mobileLoginLink.setAttribute("data-bs-toggle", "modal");
        mobileLoginLink.setAttribute("data-bs-target", "#loginModal");
        mobileLoginLink.onclick = null;
      }
      if (sidebarLoginLink) {
        sidebarLoginLink.innerHTML = '<i class="bi bi-box-arrow-in-right"></i><span class="link-text">Login</span>';
        sidebarLoginLink.setAttribute("data-bs-toggle", "modal");
        sidebarLoginLink.setAttribute("data-bs-target", "#loginModal");
        sidebarLoginLink.onclick = null;
      }
    }
  }

  function cerrarSesion(e) {
    e && e.preventDefault();
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    updateLoginLinks();
    window.location.href = "index.html";
  }

  updateLoginLinks();

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

    // =====================================================================
    // 🔥 MODO DEMO / PRESENTACIÓN (BYPASS)
    // =====================================================================
    if (username.toLowerCase() === "u23307609") {
        try {
            await setLoadingMessage(loadingTextElement, "Modo Presentación detectado 🚀", 400);
            await sleep(800); // Pequeña pausa para que se vea bonito
            
            // Data Hardcodeada provista por ti
            const demoResponse = {
                "userId": "1",
                "userData": "{\"clases\":[{\"tipo\":\"Clase\",\"curso\":\"Marcos de Desarrollo Web (28601) ( Semana 17 ) Lunes\",\"hora\":\"06:30 p.m. - 08:00 p.m.\",\"modalidad\":\"Presencial\",\"dia\":\"Lun 01\",\"fecha\":\"2025-12-01\"},{\"tipo\":\"Clase\",\"curso\":\"Negociacion y Narrativa (44038) ( Semana 17 ) Martes\",\"hora\":\"06:30 p.m. - 08:00 p.m.\",\"modalidad\":\"Virtual en vivo\",\"dia\":\"Mar 02\",\"fecha\":\"2025-12-02\"},{\"tipo\":\"Clase\",\"curso\":\"Marcos de Desarrollo Web (28601) ( Semana 17 ) Miércoles\",\"hora\":\"06:30 p.m. - 08:00 p.m.\",\"modalidad\":\"Presencial\",\"dia\":\"Mié 03\",\"fecha\":\"2025-12-03\"},{\"tipo\":\"Clase\",\"curso\":\"Algoritmos y Estructuras de Da (29277) ( Semana 17 ) Jueves\",\"hora\":\"06:30 p.m. - 08:00 p.m.\",\"modalidad\":\"Presencial\",\"dia\":\"Jue 04\",\"fecha\":\"2025-12-04\"},{\"tipo\":\"Clase\",\"curso\":\"Marcos de Desarrollo Web (28601) ( Semana 17 ) Viernes\",\"hora\":\"06:30 p.m. - 08:00 p.m.\",\"modalidad\":\"Presencial\",\"dia\":\"Vie 05\",\"fecha\":\"2025-12-05\"},{\"tipo\":\"Clase\",\"curso\":\"Herramientas de Prototipado (35816) ( Semana 17 ) Sábado\",\"hora\":\"06:00 p.m. - 07:30 p.m.\",\"modalidad\":\"Virtual en vivo\",\"dia\":\"Sáb 06\",\"fecha\":\"2025-12-06\"},{\"tipo\":\"Clase\",\"curso\":\"Algoritmos y Estructuras de Da (29277) ( Semana 17 ) Sábado\",\"hora\":\"03:00 p.m. - 04:30 p.m.\",\"modalidad\":\"Presencial\",\"dia\":\"Sáb 06\",\"fecha\":\"2025-12-06\"},{\"tipo\":\"Clase\",\"curso\":\"Herramientas de Prototipado (35816) ( Semana 17 ) Domingo\",\"hora\":\"01:15 p.m. - 02:45 p.m.\",\"modalidad\":\"Virtual en vivo\",\"dia\":\"Dom\\n07\",\"fecha\":\"2025-12-07\"}],\"actividades\":[{\"nombreActividad\":\"Foro de Consultas - Semana 17\",\"tipo\":\"Foro no calificado\",\"curso\":\"NEGOCIACIÓN Y NARRATIVA\",\"estado\":\"Por entregar\",\"fechaLimite\":\"Vence: 07/12/2025 a las 11:55 PM\",\"link\":\"https://class.utp.edu.pe/student/courses/76834a91-9b6a-51ea-82ed-63c50e9e33c6/section/21efac45-e321-507c-8bdb-41dad97f0cd7/learnv2/week/17/unit/21efac45-e321-507c-8bdb-41dad97f0cd7/theme/ff102718-9f31-50b0-807e-9d9fc5302a0a/content/543372d7-c3fd-571b-95c1-66882eae1413/forum/543372d7-c3fd-571b-95c1-66882eae1413\"},{\"nombreActividad\":\"Trabajo Final\",\"tipo\":\"Tarea calificada\",\"curso\":\"HERRAMIENTAS DE PROTOTIPADO\",\"estado\":\"Por entregar\",\"fechaLimite\":\"Vence: 07/12/2025 a las 11:59 PM\",\"link\":\"https://class.utp.edu.pe/student/courses/50673cb8-04f5-5d58-b614-cf972d8c78d7/section/0ecbc512-7590-550b-860d-2086bdf2a3d3/learnv2/week/17/unit/0ecbc512-7590-550b-860d-2086bdf2a3d3/theme/94cc7198-2061-49a3-a8f2-971de3c14d42/content/5f74a6ea-9b52-4d05-9fb3-edee52a322ad/homework/0d3b716b-15ae-4b0c-acce-ffab4367f028\"},{\"nombreActividad\":\"Foro de Consulta\",\"tipo\":\"Foro no calificado\",\"curso\":\"ALGORITMOS Y ESTRUCTURAS DE DATOS\",\"estado\":\"Por entregar\",\"fechaLimite\":\"Vence: 09/12/2025 a las 11:55 PM\",\"link\":\"https://class.utp.edu.pe/student/courses/4bb1748d-4aa8-55a8-bf4b-ac92aa4bdf80/section/f426643a-a5b0-5025-be2b-8b9a68c8ecfa/learnv2/week/0/unit/f426643a-a5b0-5025-be2b-8b9a68c8ecfa/theme/4737dd4b-a6bd-5b05-85c1-884b2cee6e5c/content/10726396-81bd-525e-bedf-6120a89d5639/forum/10726396-81bd-525e-bedf-6120a89d5639\"},{\"nombreActividad\":\"Foro de Consulta\",\"tipo\":\"Foro no calificado\",\"curso\":\"MARCOS DE DESARROLLO WEB\",\"estado\":\"Por entregar\",\"fechaLimite\":\"Vence: 09/12/2025 a las 11:55 PM\",\"link\":\"https://class.utp.edu.pe/student/courses/1ab19d14-b9cc-52bb-8926-d064c3e9945b/section/aa50e0e6-89ab-5f35-93d1-36ee4309eedd/learnv2/week/0/unit/aa50e0e6-89ab-5f35-93d1-36ee4309eedd/theme/1874eabe-4522-51a2-a2d6-f02675b989d7/content/d0188cab-1dce-5f0d-b70c-b95bf56274a2/forum/d0188cab-1dce-5f0d-b70c-b95bf56274a2\"},{\"nombreActividad\":\"🔴 (AC-S18-EXFN) – Examen Final\",\"tipo\":\"Evaluación calificada\",\"curso\":\"SEGURIDAD INFORMÁTICA\",\"estado\":\"Programada\",\"fechaLimite\":\"Desde: 08/12/2025 a las 12:00 AM\",\"link\":\"https://class.utp.edu.pe/student/courses/d2c0d1f3-4eb4-5a5a-bf75-dbec6a825f96/section/3192ca9c-8d83-51b3-b9c8-bffe40470446/learnv2/week/18/unit/3192ca9c-8d83-51b3-b9c8-bffe40470446/theme/0ff7ff25-e948-557f-b3c7-3e896b92af41/content/f8cf8e4c-2014-5406-a055-b167b8c7dd65/evaluation/f8cf8e4c-2014-5406-a055-b167b8c7dd65\"}],\"cursos\":[{\"nombre\":\"Algoritmos y Estructuras de Datos\",\"modalidad\":\"Presencial\",\"docente\":\"Juan Francisco Vera Castillo\"},{\"nombre\":\"Herramientas de Prototipado\",\"modalidad\":\"Virtual en vivo\",\"docente\":\"Jeymi Melanie Valdivia Eguiluz\"},{\"nombre\":\"Marcos de Desarrollo Web\",\"modalidad\":\"Presencial\",\"docente\":\"Juan Carlos Tovar Ueda\"},{\"nombre\":\"Negociación y Narrativa\",\"modalidad\":\"Virtual en vivo\",\"docente\":\"Edgar Coaquira Torres\"},{\"nombre\":\"Seguridad Informática\",\"modalidad\":\"Virtual 24/7\",\"docente\":\"Fernando Ignacio Diaz Sanchez\"}],\"semanaInfo\":{\"ciclo\":\"2025 - Ciclo 2 Agosto\",\"semanaActual\":\"Semana actual: 17 -\",\"fechas\":\"Del 1 al 7 de diciembre\"},\"nombreEstudiante\":\"Joan Joaquin\",\"success\":true,\"codigo\":\"u23307609\"}"
            };

            await setLoadingMessage(loadingTextElement, "Cargando actividades...", 500);

            // Guardamos en LocalStorage
            localStorage.setItem("userId", demoResponse.userId);
            localStorage.setItem("userData", demoResponse.userData);

            // Limpieza UI
            loaderOverlay.style.display = "none";
            modalBody.classList.remove("modal-loading");
            loginBtn.disabled = false;
            updateLoginLinks();

            // Cerrar modal
            try {
                const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
                if (loginModal) loginModal.hide();
            } catch (err) {}

            // Mostrar bienvenida
            showWelcome(localStorage.getItem("userData"));
            
            return; // 🛑 DETIENE EL RESTO DE LA FUNCIÓN PARA NO LLAMAR AL SERVER
        } catch (e) {
            console.error("Error en demo bypass", e);
        }
    }
    // =====================================================================
    // FIN MODO DEMO
    // =====================================================================


    // Si ya hay datos guardados (para otros usuarios)
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      const mensajesLocales = [
        "Conectando con datos guardados",
        "Cargando cursos...",
        "Listo 🚀",
      ];
      try {
        for (let i = 0; i < mensajesLocales.length; i++) {
          await setLoadingMessage(loadingTextElement, mensajesLocales[i], 350);
          // HE CORREGIDO EL SLEEP DE 10000 a 300 PARA QUE SEA RÁPIDO
          await sleep(300); 
        }
      } catch (err) {
        console.error("Error al mostrar mensajes locales:", err);
      } finally {
        loaderOverlay.style.display = "none";
        modalBody.classList.remove("modal-loading");
        loginBtn.disabled = false;
        updateLoginLinks();
        try {
          const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
          if (loginModal) loginModal.hide();
        } catch (err) {}
        showWelcome(localStorage.getItem("userData"));
      }
      return;
    }

    // --------- Flujo Normal (SSE) ----------
    try {
      await setLoadingMessage(loadingTextElement, "Buscando servidor disponible", 250);

      const server = await getFreeServer();
      if (!server) {
        await setLoadingMessage(loadingTextElement, "Todos los servidores están ocupados. Intenta más tarde.", 250);
        loaderOverlay.style.display = "none";
        modalBody.classList.remove("modal-loading");
        loginBtn.disabled = false;
        return;
      }

      await setLoadingMessage(loadingTextElement, `Conectando a servidor`, 250);

      const url = `${server}/api/eventos-stream?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      
      const evtSource = new EventSource(url);
      let userData = {
          clases: [],
          actividades: [],
          cursos: [],
          semanaInfo: {}
      };

      evtSource.addEventListener("estado", async (event) => {
        try {
          const data = JSON.parse(event.data);
          await setLoadingMessage(loadingTextElement, data.mensaje || "Procesando", 250);
        } catch (err) { console.warn("estado error", err); }
      });

      evtSource.addEventListener("nombre", (event) => {
        try { userData.nombreEstudiante = JSON.parse(event.data).nombreEstudiante; } catch (err) {}
      });

      evtSource.addEventListener("cursos", (event) => {
        try { userData.cursos = JSON.parse(event.data).cursos; } catch (err) {}
      });

      evtSource.addEventListener("actividades", (event) => {
        try { userData.actividades = JSON.parse(event.data).actividades || []; } catch (err) {}
      });

      evtSource.addEventListener("eventos", (event) => {
        try {
          const data = JSON.parse(event.data);
          const nuevasClases = data.eventos.filter((e) => e.tipo === "Clase");
          userData.clases = nuevasClases;
        } catch (err) {}
      });

      evtSource.addEventListener("semana", (event) => {
        try { userData.semanaInfo = JSON.parse(event.data).semanaInfo; } catch (err) {}
      });

      evtSource.addEventListener("fin", async () => {
        try {
          userData.success = true;
          userData.codigo = username;
          localStorage.setItem("userData", JSON.stringify(userData));
          loaderOverlay.style.display = "none";
          evtSource.close();
          updateLoginLinks();
          
          if (userData.nombreEstudiante) {
            try {
              const payload = {
                codigo: username,
                nombre: userData.nombreEstudiante,
                courses: (userData.cursos || []).map((c) => ({
                  nombre: c.nombre,
                  docente: c.docente,
                })),
              };
              const response = await fetch("https://utpschedulebackendjava.onrender.com/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const savedUser = await response.json();
              localStorage.setItem("userId", savedUser.id);
            } catch (error) { console.error("Error registro usuario", error); }
          }

          try {
            const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            if (loginModal) loginModal.hide();
          } catch (err) {}

          showWelcome(localStorage.getItem("userData"));
        } catch (err) { console.error("fin error", err); }
      });

      evtSource.addEventListener("error", (err) => {
        console.error("SSE error:", err);
        loaderOverlay.style.display = "none";
        try { evtSource.close(); } catch (e) {}
        alert("Error al iniciar sesión o credenciales inválidas.");
      });

    } catch (error) {
      console.error("Login flow error:", error);
      loaderOverlay.style.display = "none";
      alert("Error general al iniciar sesión.");
    } finally {
      modalBody.classList.remove("modal-loading");
      loginBtn.disabled = false;
    }
  });

  loginForm.dataset.listenerAdded = "true";
}
// La función showWelcome se mantiene igual, ya que userData.actividades y userData.clases
// siguen existiendo en el objeto final, solo que ahora vienen de fuentes más precisas.
export function showWelcome(userData) {
  try {
    const data = typeof userData === "string" ? JSON.parse(userData) : userData;
    if (!data) {
      console.warn("showWelcome: userData vacío o inválido");
      return;
    }

    const nombre = data.nombreEstudiante || "Estudiante";
    const hoy = new Date().toISOString().split("T")[0];
    const clasesHoy = data.clases?.filter((e) => e.fecha === hoy) || [];
    
    // Filtramos actividades que no estén "Entregadas".
    // Nota: El nuevo scraper devuelve estados como "Por entregar" o "Programada", 
    // así que la lógica !== "Entregada" funciona correctamente.
    const actividadesPend =
      data.actividades?.filter((e) => e.estado !== "Entregada") || [];

    // Lógica para mensajes dinámicos
    const tieneClase = clasesHoy.length > 0;
    const tieneActividades = actividadesPend.length > 0;
    let submsg = "";
    if (tieneClase && tieneActividades) {
      submsg = `Hoy tienes ${clasesHoy.length} clase(s). Te quedan ${actividadesPend.length} actividad(es) pendiente(s).`;
    } else if (tieneClase) {
      submsg = `Hoy tienes ${clasesHoy.length} clase(s). ¡No tienes actividades pendientes!`;
    } else if (tieneActividades) {
      submsg = `No tienes clase hoy. Te quedan ${actividadesPend.length} actividad(es) pendiente(s).`;
    } else {
      submsg =
        "No tienes clases ni actividades pendientes hoy. ¡Disfruta tu día!";
    }

    // Actualizar DOM
    const elMsg = document.getElementById("welcome-msg");
    const elSub = document.getElementById("welcome-submsg");
    const welcome = document.getElementById("welcome-screen");

    if (!welcome) {
      console.error("Elemento #welcome-screen no encontrado");
      return;
    }
    if (elMsg) elMsg.textContent = `Hola ${nombre}.`;
    if (elSub) elSub.textContent = submsg;

    // Mostrar pantalla de bienvenida
    welcome.classList.remove("hidden");
    void welcome.offsetWidth;
    welcome.classList.add("show");

    // Función para recargar la página
    const reloadPage = () => {
      window.location.reload();
    };

    // Botón "Dashboard"
    const goBtn = document.getElementById("goDashboardBtn");
    if (goBtn) {
      goBtn.onclick = reloadPage;
    }

    // Botón de cierre (X)
    const closeBtn = document.getElementById("closeWelcomeBtn");
    if (closeBtn) {
      closeBtn.onclick = reloadPage;
    }
  } catch (err) {
    console.error("Error en showWelcome:", err);
  }
}