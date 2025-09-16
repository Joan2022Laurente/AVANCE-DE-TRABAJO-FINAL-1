import { initLogin } from "./login.js";
export function loadNavbarAndHeader() {
  // Cargar el navbar (sidebar)
  fetch("navbar.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
      const collapseBtn = document.getElementById("collapseBtn");
      const sidebar = document.getElementById("sidebar");
      const main = document.querySelector("main");

      if (collapseBtn) {
        collapseBtn.addEventListener("click", () => {
          sidebar.classList.toggle("collapsed");
          main.classList.toggle("collapsed");
        });
      }

      // Cerrar dropdowns al hacer clic fuera
      document.addEventListener("click", (e) => {
        if (
          !e.target.closest(".dropdown") &&
          !e.target.closest(".dropdown-toggle")
        ) {
          document
            .querySelectorAll(".dropdown-menu.show")
            .forEach((dropdown) => {
              dropdown.classList.remove("show");
            });
        }
      });

      initLogin();
    })
    .catch((error) => console.error("Error al cargar el sidebar:", error));

  // Cargar header
  fetch("header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header").innerHTML = html;

      renderHeaderUserInfo();
    });
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
      userInfoDiv.className = "me-2 text-end d-none d-sm-block";
      userInfoDiv.innerHTML = `
        <div class="fw-bold">${nombre}</div>
        <small class="text-muted">${rol}</small>
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
