// ==============================
// 📌 TASKS.JS - VERSIÓN CON INTEGRACIÓN IA
// ==============================

const API_URL = "https://utpschedulebackendjava.onrender.com/api/tasks";
const selectedCourseId = localStorage.getItem("selectedCourseId");
let allTasks = [];
let currentFilter = 'all';

// ---- Mostrar notificación toast ----
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('toast-notification');
  const toastBody = toastEl.querySelector('.toast-body');
  const toastIcon = toastEl.querySelector('.toast-header i');
  
  toastBody.textContent = message;
  
  if (type === 'success') {
    toastIcon.className = 'bi bi-check-circle-fill text-success me-2';
  } else if (type === 'error') {
    toastIcon.className = 'bi bi-exclamation-circle-fill text-danger me-2';
  } else if (type === 'info') {
    toastIcon.className = 'bi bi-info-circle-fill text-primary me-2';
  }
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ---- Mostrar skeleton loader ----
function showSkeletonLoader() {
  document.getElementById('skeleton-loader').style.display = 'block';
  document.getElementById('tasks-content').style.display = 'none';
  document.getElementById('empty-state').style.display = 'none';
}

// ---- Ocultar skeleton loader ----
function hideSkeletonLoader() {
  document.getElementById('skeleton-loader').style.display = 'none';
}

// ---- Actualizar estadísticas ----
function updateStats(tasks) {
  const statsContainer = document.getElementById('tasks-stats');
  const pending = tasks.filter(t => t.estado === 'pendiente').length;
  const inProgress = tasks.filter(t => t.estado === 'en-proceso').length;
  const completed = tasks.filter(t => t.estado === 'completado').length;
  
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-in-progress').textContent = inProgress;
  document.getElementById('stat-completed').textContent = completed;
  
  statsContainer.style.display = tasks.length > 0 ? 'flex' : 'none';
}

// ---- Obtener icono y color según estado ----
function getStatusConfig(status) {
  const configs = {
    'pendiente': {
      icon: 'bi-hourglass-split',
      color: '#f59e0b',
      bg: '#f59e0b15',
      label: 'Pendiente'
    },
    'en-proceso': {
      icon: 'bi-clock-history',
      color: '#06b6d4',
      bg: '#06b6d415',
      label: 'En Proceso'
    },
    'completado': {
      icon: 'bi-check-circle-fill',
      color: '#22c55e',
      bg: '#22c55e15',
      label: 'Completada'
    }
  };
  return configs[status] || configs['pendiente'];
}

// ---- Obtener configuración de prioridad ----
function getPriorityConfig(priority) {
  const configs = {
    'alta': {
      icon: 'bi-exclamation-triangle-fill',
      color: '#ef4444',
      bg: '#ef444415',
      label: 'Alta'
    },
    'media': {
      icon: 'bi-flag-fill',
      color: '#f59e0b',
      bg: '#f59e0b15',
      label: 'Media'
    },
    'baja': {
      icon: 'bi-flag',
      color: '#22c55e',
      bg: '#22c55e15',
      label: 'Baja'
    }
  };
  return configs[priority] || configs['baja'];
}

// ---- Formatear fecha ----
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Resetear horas para comparación de días
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) {
    return 'Hoy';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Mañana';
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  }
}

// ---- Verificar si la tarea está vencida ----
function isOverdue(dateString, status) {
  if (status === 'completado') return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);
  return taskDate < today;
}

// ---- Crear tarjeta de tarea ----
function createTaskCard(task, index) {
  const card = document.createElement('div');
  card.className = 'col-12 col-md-6';
  card.dataset.status = task.estado;
  card.dataset.title = task.titulo.toLowerCase();
  card.style.animationDelay = `${index * 0.05}s`;
  
  const statusConfig = getStatusConfig(task.estado);
  const priorityConfig = getPriorityConfig(task.prioridad || 'baja');
  const formattedDate = formatDate(task.fechaEntrega);
  const overdue = isOverdue(task.fechaEntrega, task.estado);
  
  card.innerHTML = `
    <div class="task-card ${task.estado === 'completado' ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
      <div class="task-card-header">
        <div class="task-status-badge" style="background: ${statusConfig.bg}; color: ${statusConfig.color};">
          <i class="bi ${statusConfig.icon}"></i>
          <span>${statusConfig.label}</span>
        </div>
        <div class="task-priority-badge" style="background: ${priorityConfig.bg}; color: ${priorityConfig.color};">
          <i class="bi ${priorityConfig.icon}"></i>
        </div>
      </div>
      
      <div class="task-card-body">
        <h3 class="task-title">${task.titulo}</h3>
        <p class="task-description">
          ${task.descripcion || 'Sin descripción'}
        </p>
        
        <div class="task-date ${overdue ? 'overdue' : ''}">
          <i class="bi bi-calendar-event"></i>
          <span>${formattedDate}</span>
          ${overdue ? '<span class="overdue-badge">Vencida</span>' : ''}
        </div>
      </div>
      
      <div class="task-card-footer">
        <select class="task-status-select" data-task-id="${task.id}">
          <option value="pendiente" ${task.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="en-proceso" ${task.estado === 'en-proceso' ? 'selected' : ''}>En Proceso</option>
          <option value="completado" ${task.estado === 'completado' ? 'selected' : ''}>Completada</option>
        </select>
        <button class="btn-delete-task" data-task-id="${task.id}" title="Eliminar tarea">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  return card;
}

// ---- Renderizar tareas ----
function renderTasks(tasks, animate = true) {
  const container = document.getElementById('tasks-content');
  const listContainer = document.getElementById('tasks-list');
  const emptyState = document.getElementById('empty-state');
  const filtersSection = document.getElementById('filters-section');
  const noResults = document.getElementById('no-results');
  
  listContainer.innerHTML = '';
  
  if (!tasks || tasks.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    filtersSection.style.display = 'none';
    noResults.style.display = 'none';
    updateStats([]);
    return;
  }
  
  emptyState.style.display = 'none';
  container.style.display = 'block';
  filtersSection.style.display = 'flex';
  
  // Aplicar filtros
  const filteredTasks = filterAndSearchTasks(tasks);
  
  if (filteredTasks.length === 0) {
    container.style.display = 'none';
    noResults.style.display = 'block';
    return;
  }
  
  noResults.style.display = 'none';
  
  // Ordenar por fecha (más próximas primero)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
  });
  
  sortedTasks.forEach((task, index) => {
    const card = createTaskCard(task, index);
    listContainer.appendChild(card);
  });
  
  updateStats(tasks);
  attachTaskEventListeners();
}

// ---- Filtrar y buscar tareas ----
function filterAndSearchTasks(tasks) {
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
  
  return tasks.filter(task => {
    const matchesFilter = currentFilter === 'all' || task.estado === currentFilter;
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm) ||
                         (task.descripcion || '').toLowerCase().includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });
}

// ---- Adjuntar eventos a las tareas ----
function attachTaskEventListeners() {
  // Selectores de estado
  document.querySelectorAll('.task-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const taskId = select.dataset.taskId;
      const newStatus = select.value;
      await updateTaskStatus(taskId, newStatus);
    });
  });
  
  // Botones de eliminar
  document.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.taskId;
      await deleteTask(taskId);
    });
  });
}

// ---- Cargar tareas ----
async function loadTasks() {
  if (!selectedCourseId) {
    showToast('Error: No se seleccionó un curso', 'error');
    document.getElementById('empty-state').style.display = 'block';
    return;
  }
  
  showSkeletonLoader();
  
  try {
    const response = await fetch(`${API_URL}/curso/${selectedCourseId}`);
    
    if (!response.ok) throw new Error('Error al obtener tareas');
    
    const tasks = await response.json();
    allTasks = tasks;
    
    console.log('📌 Tareas cargadas:', tasks);
    
    setTimeout(() => {
      hideSkeletonLoader();
      renderTasks(tasks);
      
      // 🤖 Actualizar análisis de IA
      refreshAI();
    }, 300);
    
  } catch (error) {
    hideSkeletonLoader();
    console.error('Error al cargar tareas:', error);
    showToast('Error al cargar las tareas', 'error');
  }
}

// ---- Actualizar estado de tarea ----
async function updateTaskStatus(taskId, newStatus) {
  try {
    const response = await fetch(
      `${API_URL}/${taskId}?estado=${encodeURIComponent(newStatus)}`,
      { method: 'PUT' }
    );
    
    if (!response.ok) throw new Error('Error al actualizar estado');
    
    console.log('✅ Estado actualizado');
    await loadTasks();
    
    const statusLabels = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En Proceso',
      'completado': 'Completada'
    };
    
    showToast(`Tarea marcada como: ${statusLabels[newStatus]}`, 'success');
    
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    showToast('No se pudo actualizar el estado', 'error');
  }
}

// ---- Eliminar tarea ----
async function deleteTask(taskId) {
  const confirmDelete = confirm('¿Estás seguro de eliminar esta tarea?\nEsta acción no se puede deshacer.');
  
  if (!confirmDelete) return;
  
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al eliminar tarea');
    
    console.log('🗑️ Tarea eliminada');
    await loadTasks();
    showToast('Tarea eliminada correctamente', 'success');
    
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    showToast('No se pudo eliminar la tarea', 'error');
  }
}

// ---- Crear nueva tarea ----
async function handleAddTask(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('task-title').value.trim();
  const descripcion = document.getElementById('task-description').value.trim();
  const fechaEntrega = document.getElementById('task-date').value;
  const prioridadInput = document.querySelector('input[name="priority"]:checked');
  const prioridad = prioridadInput ? prioridadInput.value : 'baja';
  
  if (!titulo || !fechaEntrega) {
    showToast('Por favor completa los campos obligatorios', 'error');
    return;
  }
  
  const taskData = {
    titulo,
    descripcion: descripcion || '',
    fechaEntrega,
    prioridad,
    estado: 'pendiente',
    course: { id: selectedCourseId }
  };
  
  const submitBtn = document.querySelector('button[form="add-task-form"][type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) throw new Error('Error al crear tarea');
    
    const saved = await response.json();
    console.log('✅ Tarea creada:', saved);
    
    await loadTasks();
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();
    
    // Limpiar formulario
    document.getElementById('add-task-form').reset();
    document.querySelectorAll('input[name="priority"]').forEach(input => input.checked = false);
    document.getElementById('priority-low').checked = true;
    
    showToast('Tarea creada exitosamente', 'success');
    
  } catch (error) {
    console.error('Error al crear tarea:', error);
    showToast('No se pudo crear la tarea', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ---- Configurar filtros ----
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.dataset.filter;
      renderTasks(allTasks, false);
    });
  });
}

// ---- Configurar búsqueda ----
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderTasks(allTasks, false);
      }, 300);
    });
  }
}

// ---- Volver a cursos ----
function goBackToCourses() {
  window.location.href = 'courses.html';
}

// ---- 🤖 Actualizar IA ----
function refreshAI() {
  if (window.refreshTaskAI) {
    console.log('🤖 Actualizando análisis de IA...');
    window.refreshTaskAI();
  }
}

// ---- Inicializar página ----
function initTasksPage() {
  const selectedCourseName = localStorage.getItem('selectedCourse');
  
  if (!selectedCourseId) {
    showToast('Error: no se seleccionó un curso', 'error');
    setTimeout(() => {
      window.location.href = 'courses.html';
    }, 1500);
    return;
  }
  
  // Actualizar títulos
  if (selectedCourseName) {
    const titleElement = document.getElementById('course-title');
    const breadcrumbElement = document.getElementById('course-name-breadcrumb');
    
    if (titleElement) titleElement.textContent = selectedCourseName;
    if (breadcrumbElement) breadcrumbElement.textContent = selectedCourseName;
  }
  
  // Event listeners
  document.getElementById('back-to-courses').addEventListener('click', goBackToCourses);
  document.getElementById('add-task-form').addEventListener('submit', handleAddTask);
  
  // Configurar filtros y búsqueda
  setupFilters();
  setupSearch();
  
  // Limpiar formulario al abrir modal
  const modal = document.getElementById('addTaskModal');
  modal.addEventListener('show.bs.modal', () => {
    document.getElementById('add-task-form').reset();
    document.getElementById('priority-low').checked = true;
  });
  
  // Cargar tareas
  loadTasks();
}

// ---- Ejecutar al cargar DOM ----
document.addEventListener('DOMContentLoaded', initTasksPage);