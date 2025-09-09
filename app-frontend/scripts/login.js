export function initLogin() {
  console.log("🔄 initLogin ejecutado...");
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    console.warn("⚠️ No se encontró el formulario de login (#loginForm)");
    return;
  }
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) {
    console.warn("⚠️ No se encontró el botón de login (#loginBtn)");
    return;
  }
  if (loginForm.dataset.listenerAdded === "true") {
    console.log("ℹ️ Listener de submit ya estaba agregado antes");
    return;
  }

  loginBtn.addEventListener("click", () => {
    console.log("👆 Click en loginBtn detectado → disparando submit");
    loginForm.requestSubmit();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📩 Evento submit detectado ✅");
    const username = document.getElementById("codigo")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
      alert("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    console.log("📝 Datos capturados:", { username, password });

    // Deshabilitar botón y mostrar overlay de carga
    loginBtn.disabled = true;
    const modalBody = loginForm.closest(".modal-body");
    const loaderOverlay = document.getElementById("modalLoaderOverlay");
    const loadingTextElement = document.getElementById("loadingText");

    loaderOverlay.style.display = "flex";
    modalBody.classList.add("modal-loading");

    try {
      console.log("🌐 Conectando con la API vía SSE...");

      // 🔹 Usamos EventSource en vez de fetch
      const evtSource = new EventSource(
        `https://apiutp-1.onrender.com/api/eventos-stream?username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`
      );

      let userData = {};

      // Mensajes de estado
      evtSource.addEventListener("estado", (event) => {
        const data = JSON.parse(event.data);
        console.log("📢 Estado:", data.mensaje);
        loadingTextElement.textContent = data.mensaje;
      });

      // Nombre del estudiante
      evtSource.addEventListener("nombre", (event) => {
        const data = JSON.parse(event.data);
        console.log("👤 Nombre estudiante:", data.nombreEstudiante);
        userData.nombreEstudiante = data.nombreEstudiante;
      });

      // Eventos del calendario
      evtSource.addEventListener("eventos", (event) => {
        const data = JSON.parse(event.data);
        console.log("📅 Eventos recibidos:", data.eventos);
        userData.eventos = data.eventos;
      });

      // Fin del scraping
      evtSource.addEventListener("fin", () => {
        console.log("✅ Scraping finalizado, guardando datos...");
        localStorage.setItem("userData", JSON.stringify(userData));
        evtSource.close();
        window.location.href = "schedule.html";
      });

      // Errores
      evtSource.addEventListener("error", (event) => {
        console.error("❌ Error en stream:", event);
        evtSource.close();
        alert("Error al iniciar sesión, revisa tus credenciales.");
      });
    } catch (error) {
      console.error("❌ Error en login:", error);
      alert("Error al iniciar sesión, revisa tus credenciales.");
    } finally {
      // Ocultar overlay de carga y reactivar botón al terminar
      loaderOverlay.style.display = "none";
      modalBody.classList.remove("modal-loading");
      loginBtn.disabled = false;
    }
  });

  loginForm.dataset.listenerAdded = "true";
  console.log("🎯 Listener de submit agregado correctamente");
}
