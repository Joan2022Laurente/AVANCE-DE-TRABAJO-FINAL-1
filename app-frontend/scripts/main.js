import { UniversityScheduleApp } from "./app.js";
import { loadNavbarAndHeader } from "./navbar.js";
import { renderTasks } from "./tasks.js";
import { initLogin } from "./login.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar la app principal
  window.app = new UniversityScheduleApp();

  loadNavbarAndHeader();
  renderTasks();
  initLogin();
});
