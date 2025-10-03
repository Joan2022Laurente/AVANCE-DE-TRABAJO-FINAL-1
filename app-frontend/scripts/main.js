// scripts/main.js
document.addEventListener("DOMContentLoaded", async () => {
  // Ocultar contenido mientras cargamos
  document.body.style.opacity = '0';

  try {
    // Import dinámico para capturar fallos de carga de módulos
    const [appModule, navbarModule, tasksModule] = await Promise.all([
      import('./app.js').catch(e => { throw new Error('Error cargando app.js: ' + e.message); }),
      import('./navbar.js').catch(e => { throw new Error('Error cargando navbar.js: ' + e.message); }),
      import('./tasks.js').catch(e => { throw new Error('Error cargando tasks.js: ' + e.message); }),
    ]);

    // Validar exports esperados
    const UniversityScheduleApp = appModule.UniversityScheduleApp ?? appModule.default;
    const loadNavbarAndHeader = navbarModule.loadNavbarAndHeader ?? navbarModule.default;
    const renderTasks = tasksModule.renderTasks ?? tasksModule.default;

    if (typeof loadNavbarAndHeader !== 'function') throw new Error('loadNavbarAndHeader no es una función exportada correctamente.');
    if (typeof renderTasks !== 'function') throw new Error('renderTasks no es una función exportada correctamente.');
    if (typeof UniversityScheduleApp !== 'function') throw new Error('UniversityScheduleApp no está exportado correctamente.');

    // Ejecutar cargas asíncronas
    await Promise.all([
      loadNavbarAndHeader(),
      renderTasks()
    ]);

    // Inicializar app
    window.app = new UniversityScheduleApp();

  } catch (error) {
    console.error('Error al inicializar la app:', error);
    // Mostrar mensaje de error visible al usuario
    const statusEl = document.getElementById('home-status');
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-danger">Error al cargar la aplicación: ${error.message}</div>`;
    }
  } finally {
    // Mostrar la página aunque haya fallado para que el usuario vea el error
    document.body.style.opacity = '1';
  }
});
