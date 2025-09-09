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
    })
    .catch((error) => console.error("Error al cargar el sidebar:", error));

  // Cargar header
  fetch("header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header").innerHTML = html;
      // 👇 Aquí ya existe el loginForm en el DOM
      initLogin();
    });
}
