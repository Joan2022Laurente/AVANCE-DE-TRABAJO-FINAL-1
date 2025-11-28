// scripts/main.js
document.addEventListener("DOMContentLoaded", async () => {
  document.body.style.opacity = '0';

  try {
    // Solo carga navbar.js
    const navbarModule = await import('./navbar.js').catch(e => {
      throw new Error('Error cargando navbar.js: ' + e.message);
    });

    const loadNavbarAndHeader = navbarModule.loadNavbarAndHeader ?? navbarModule.default;

    if (typeof loadNavbarAndHeader !== 'function')
      throw new Error('loadNavbarAndHeader no es una función exportada correctamente.');

    await loadNavbarAndHeader();

  } catch (error) {
    console.error('Error al inicializar la app:', error);

    const statusEl = document.getElementById('home-status');
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-danger">
        Error al cargar la aplicación: ${error.message}
      </div>`;
    }
  } finally {
    document.body.style.opacity = '1';
  }
});
