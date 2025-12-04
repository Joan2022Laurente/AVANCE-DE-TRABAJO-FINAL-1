import { initLogin } from "./login.js";
export async function loadNavbarAndHeader() {
  try {
    // Cargar ambos en paralelo
    const [navbarRes, headerRes] = await Promise.all([
      fetch("navbar.html"),
      fetch("header.html"),
    ]);

    const [navbarHtml, headerHtml] = await Promise.all([
      navbarRes.text(),
      headerRes.text(),
    ]);

    // Insertar ambos
    document.getElementById("navbar").innerHTML = navbarHtml;
    document.getElementById("header").innerHTML = headerHtml;

    // Inicializaciones que dependen del DOM ya insertado
    const collapseBtn = document.getElementById("collapseBtn");
    // ✅ NUEVO: Referencia al icono dentro del botón
    const collapseIcon = document.getElementById("collapseIcon"); 
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector("main");

    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        main.classList.toggle("collapsed");

        // ✅ LÓGICA DE ICONO Y LIMPIEZA VISUAL
        if (collapseIcon) {
            if (sidebar.classList.contains("collapsed")) {
                // Cambiar flecha a "derecha"
                collapseIcon.classList.replace("bi-arrow-bar-left", "bi-arrow-bar-right");
                
                // Opcional pero recomendado: Cerrar cualquier dropdown abierto para que no flote
                document.querySelectorAll('.collapse.show').forEach(el => {
                    el.classList.remove('show');
                    // Si usas bootstrap JS puro, podrías necesitar: new bootstrap.Collapse(el).hide();
                });
            } else {
                // Cambiar flecha a "izquierda"
                collapseIcon.classList.replace("bi-arrow-bar-right", "bi-arrow-bar-left");
            }
        }
      });
    }

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".dropdown") &&
        !e.target.closest(".dropdown-toggle")
      ) {
        document.querySelectorAll(".dropdown-menu.show").forEach((dropdown) => {
          dropdown.classList.remove("show");
        });
      }
    });

    // Render del header (user info) y ocultar links según auth
    renderHeaderUserInfo();
    checkAuthAndHideElements();

    // Finalmente inicializar login (ahora sí encontrará el enlace móvil)
    initLogin();
  } catch (error) {
    console.error("Error cargando navbar + header:", error);
  }
}

function checkAuthAndHideElements() {
  const storedUser = localStorage.getItem("userData");
  if (!storedUser || storedUser === "[object Object]") {
    // Ocultar Dashboard en sidebar
    const dashboardLink = document.querySelector('a[href="dashboard.html"]');
    if (dashboardLink) {
      dashboardLink.closest("li.nav-item").style.display = "none";
    }
    // Ocultar dropdown de Gestión Académica en sidebar
    const academicDropdown = document.querySelector(
      'a[href="#"][id="academicDropdown"]'
    );
    if (academicDropdown) {
      academicDropdown.closest("li.nav-item").style.display = "none";
    }

    // Ocultar Dashboard en menú móvil
    const dashboardLinkMobile = document.querySelector(
      '#navbarMenu a[href="dashboard.html"]'
    );
    if (dashboardLinkMobile) {
      dashboardLinkMobile.closest("li.nav-item").style.display = "none";
    }
    // Ocultar dropdown de Gestión Académica en menú móvil
    const academicDropdownMobile = document.querySelector(
      '#navbarMenu a[id="academicDropdownMobile"]'
    );
    if (academicDropdownMobile) {
      academicDropdownMobile.closest("li.nav-item").style.display = "none";
    }
  }
}

function renderHeaderUserInfo() {
  const storedUser = localStorage.getItem("userData");
  if (!storedUser) return; // ❌ Nada → no renderizamos

  // Caso especial: se guardó mal como "[object Object]"
  if (storedUser === "[object Object]") {
    console.warn("userData inválido en localStorage:", storedUser);
    return;
  }

  try {
    const userData = JSON.parse(storedUser); // un solo parse
    const nombre = userData?.nombreEstudiante || "Usuario";
    const rol = "Estudiante";

    const userContainer = document.querySelector("#header .user-container");
    if (userContainer) {
      const userInfoDiv = document.createElement("div");
      userInfoDiv.className =
        "d-flex align-items-center gap-2 me-2 text-end d-none d-sm-flex";

      userInfoDiv.innerHTML = `
    <!-- Columna izquierda: nombre + rol -->
    <div class="text-end">
      <div class="fw-bold">${nombre}</div>
      <small class="text-muted">${rol}</small>
    </div>

    <!-- Columna derecha: avatar -->
    <img
      src="assets/user.svg"
      alt="Avatar"
      class="rounded-circle"
      width="40"
      height="40"
    />
  `;

      userContainer.prepend(userInfoDiv);
    }
  } catch (error) {
    console.error("Error al parsear userData:", error, storedUser);
  }
}
