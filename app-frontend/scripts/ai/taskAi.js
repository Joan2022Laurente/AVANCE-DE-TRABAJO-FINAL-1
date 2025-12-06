// ==============================
// 🤖 TASK AI - ASISTENTE INTELIGENTE
// ==============================

const AI_API_URL = "https://backednexamn.onrender.com/generate-text";
const TASKS_API_URL = "https://utpschedulebackendjava.onrender.com/api/tasks";

class TaskAIAssistant {
  constructor() {
    this.tasks = [];
    this.insights = [];
    this.isAnalyzing = false;
    this.panelOpen = false;
    this.selectedCourseId = localStorage.getItem("selectedCourseId");

    this.init();
  }

  // ============================================
  // 🎯 INICIALIZACIÓN
  // ============================================

  init() {
    this.createUI();
    this.attachEventListeners();
    console.log("🤖 AI Assistant inicializado");
  }

  // ============================================
  // 🎨 CREAR INTERFAZ
  // ============================================

  createUI() {
    const container = document.createElement("div");
    container.className = "ai-assistant-container";
    container.innerHTML = `
      <div class="ai-badge-trigger" id="ai-badge">
        <i class="bi bi-stars ai-icon"></i>
        <span class="ai-notification-badge" id="ai-notification" style="display: none;">0</span>
      </div>
      
      <div class="ai-panel" id="ai-panel">
        <div class="ai-panel-header">
          <div class="ai-panel-title">
            <i class="bi bi-stars"></i>
            <h3>Asistente IA</h3>
          </div>
          <button class="ai-panel-close" id="ai-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="ai-panel-content" id="ai-content">
          <div class="ai-loading">
            <div class="ai-loading-spinner"></div>
            <span class="ai-loading-text">Analizando tus tareas...</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  // ============================================
  // 🔌 EVENTOS
  // ============================================

  attachEventListeners() {
    const badge = document.getElementById("ai-badge");
    const panel = document.getElementById("ai-panel");
    const closeBtn = document.getElementById("ai-close");

    badge.addEventListener("click", () => this.togglePanel());
    closeBtn.addEventListener("click", () => this.closePanel());

    // Cerrar al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (
        this.panelOpen &&
        !panel.contains(e.target) &&
        !badge.contains(e.target)
      ) {
        this.closePanel();
      }
    });
  }

  togglePanel() {
    if (this.panelOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    const panel = document.getElementById("ai-panel");
    const badge = document.getElementById("ai-badge");

    panel.classList.add("active");
    badge.classList.remove("has-insights");
    this.panelOpen = true;

    // Analizar si aún no hay insights
    if (this.insights.length === 0) {
      this.analyzeAndGenerateInsights();
    }
  }

  closePanel() {
    const panel = document.getElementById("ai-panel");
    panel.classList.remove("active");
    this.panelOpen = false;
  }

  // ============================================
  // 📊 ANÁLISIS DE TAREAS
  // ============================================

  async loadTasks() {
    try {
      const response = await fetch(
        `${TASKS_API_URL}/curso/${this.selectedCourseId}`
      );
      if (!response.ok) throw new Error("Error al cargar tareas");

      this.tasks = await response.json();
      console.log("📋 Tareas cargadas para análisis:", this.tasks.length);
      return this.tasks;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  analyzeTasksLocally() {
    const analysis = {
      total: this.tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: [],
      dueSoon: [],
      highPriority: [],
      lowPriority: [],
      noDescription: [],
      sameDay: {},
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    this.tasks.forEach((task) => {
      // Estados
      if (task.estado === "pendiente") analysis.pending++;
      else if (task.estado === "en-proceso") analysis.inProgress++;
      else if (task.estado === "completado") analysis.completed++;

      // Fechas
      const taskDate = new Date(task.fechaEntrega);
      taskDate.setHours(0, 0, 0, 0);

      // Vencidas
      if (taskDate < today && task.estado !== "completado") {
        analysis.overdue.push(task);
      }

      // Próximas a vencer (3 días)
      if (
        taskDate >= today &&
        taskDate <= threeDaysFromNow &&
        task.estado !== "completado"
      ) {
        analysis.dueSoon.push(task);
      }

      // Prioridades
      if (task.prioridad === "alta") analysis.highPriority.push(task);
      else if (task.prioridad === "baja") analysis.lowPriority.push(task);

      // Sin descripción
      if (!task.descripcion || task.descripcion.trim() === "") {
        analysis.noDescription.push(task);
      }

      // Tareas el mismo día
      const dateKey = taskDate.toISOString().split("T")[0];
      if (!analysis.sameDay[dateKey]) {
        analysis.sameDay[dateKey] = [];
      }
      if (task.estado !== "completado") {
        analysis.sameDay[dateKey].push(task);
      }
    });

    return analysis;
  }

  // ============================================
  // 🤖 GENERAR INSIGHTS CON IA
  // ============================================

  async analyzeAndGenerateInsights() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.showLoading();

    try {
      await this.loadTasks();

      if (this.tasks.length === 0) {
        this.showEmptyState();
        return;
      }

      const localAnalysis = this.analyzeTasksLocally();
      const aiInsights = await this.generateAIInsights(localAnalysis);

      this.insights = aiInsights;
      this.renderInsights();
      this.updateBadge();
      this.addBadgesToTaskCards();
    } catch (error) {
      console.error("Error en análisis:", error);
      this.showError();
    } finally {
      this.isAnalyzing = false;
    }
  }

  async generateAIInsights(analysis) {
    const prompt = this.buildAnalysisPrompt(analysis);

    try {
      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Error en API de IA");

      const data = await response.json();
      const aiResponse = data.response;

      // Parsear respuesta de IA
      return this.parseAIResponse(aiResponse, analysis);
    } catch (error) {
      console.error("Error llamando a IA:", error);
      // Fallback a insights locales
      return this.generateLocalInsights(analysis);
    }
  }

  buildAnalysisPrompt(analysis) {
    return `Eres un asistente inteligente de productividad académica. Analiza estas tareas y genera insights accionables en formato JSON.

DATOS:
- Total de tareas: ${analysis.total}
- Pendientes: ${analysis.pending}
- En proceso: ${analysis.inProgress}
- Completadas: ${analysis.completed}
- Tareas vencidas: ${analysis.overdue.length}
- Tareas que vencen pronto (3 días): ${analysis.dueSoon.length}
- Tareas de alta prioridad: ${analysis.highPriority.length}
- Tareas sin descripción: ${analysis.noDescription.length}

TAREAS VENCIDAS:
${analysis.overdue
  .map((t) => `- "${t.titulo}" (vencida el ${t.fechaEntrega})`)
  .join("\n")}

TAREAS PRÓXIMAS:
${analysis.dueSoon
  .map((t) => `- "${t.titulo}" (vence el ${t.fechaEntrega})`)
  .join("\n")}

INSTRUCCIONES:
1. Genera 3-5 insights ESPECÍFICOS y ACCIONABLES
2. Prioriza los problemas más urgentes
3. Sé conciso y directo
4. Usa un tono amigable pero profesional

Responde SOLO con un array JSON con esta estructura:
[
  {
    "type": "danger|warning|success|info",
    "icon": "bi-[icon-name]",
    "title": "Título corto",
    "message": "Mensaje específico con datos reales"
  }
]

NO incluyas explicaciones adicionales, SOLO el JSON.`;
  }

  parseAIResponse(aiResponse, analysis) {
    try {
      // Limpiar respuesta (remover markdown si existe)
      let cleanResponse = aiResponse.trim();
      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      const insights = JSON.parse(cleanResponse);

      // Validar estructura
      if (Array.isArray(insights) && insights.length > 0) {
        return insights;
      }

      throw new Error("Formato inválido");
    } catch (error) {
      console.log("⚠️ Error parseando respuesta IA, usando fallback");
      return this.generateLocalInsights(analysis);
    }
  }

  generateLocalInsights(analysis) {
    const insights = [];

    // Tareas vencidas
    if (analysis.overdue.length > 0) {
      insights.push({
        type: "danger",
        icon: "bi-exclamation-triangle-fill",
        title: `${analysis.overdue.length} tarea${
          analysis.overdue.length > 1 ? "s" : ""
        } vencida${analysis.overdue.length > 1 ? "s" : ""}`,
        message: `Tienes tareas atrasadas. Prioriza: "${analysis.overdue[0].titulo}"`,
      });
    }

    // Tareas próximas a vencer
    if (analysis.dueSoon.length > 0) {
      insights.push({
        type: "warning",
        icon: "bi-clock-history",
        title: `${analysis.dueSoon.length} tarea${
          analysis.dueSoon.length > 1 ? "s" : ""
        } vence${analysis.dueSoon.length > 1 ? "n" : ""} pronto`,
        message: `Próximas entregas en los siguientes 3 días. Prepárate con tiempo.`,
      });
    }

    // Múltiples tareas el mismo día
    const sameDayWarnings = Object.entries(analysis.sameDay)
      .filter(([date, tasks]) => tasks.length >= 3)
      .sort((a, b) => b[1].length - a[1].length);

    if (sameDayWarnings.length > 0) {
      const [date, tasks] = sameDayWarnings[0];
      insights.push({
        type: "warning",
        icon: "bi-calendar-x",
        title: `${tasks.length} tareas el mismo día`,
        message: `Tienes múltiples entregas programadas. Considera adelantar trabajo.`,
      });
    }

    // Alta carga de trabajo
    if (analysis.highPriority.length >= 3) {
      insights.push({
        type: "info",
        icon: "bi-flag-fill",
        title: "Alta carga de prioridades",
        message: `${analysis.highPriority.length} tareas de alta prioridad. Organiza tu tiempo sabiamente.`,
      });
    }

    // Buen progreso
    if (analysis.completed > 0 && analysis.completed >= analysis.total * 0.3) {
      const percentage = Math.round(
        (analysis.completed / analysis.total) * 100
      );
      insights.push({
        type: "success",
        icon: "bi-trophy-fill",
        title: `${percentage}% completado`,
        message: `¡Excelente progreso! Sigue así y alcanzarás tus metas.`,
      });
    }

    // Sin tareas pendientes
    if (
      analysis.pending === 0 &&
      analysis.inProgress === 0 &&
      analysis.completed > 0
    ) {
      insights.push({
        type: "success",
        icon: "bi-check-circle-fill",
        title: "¡Todo al día!",
        message:
          "No tienes tareas pendientes. Momento perfecto para planificar adelante.",
      });
    }

    return insights.slice(0, 5); // Máximo 5 insights
  }

  // ============================================
  // 🎨 RENDERIZADO
  // ============================================

  showLoading() {
    const content = document.getElementById("ai-content");
    content.innerHTML = `
      <div class="ai-loading">
        <div class="ai-loading-spinner"></div>
        <span class="ai-loading-text">Analizando tus tareas...</span>
      </div>
    `;
  }

  showEmptyState() {
    const content = document.getElementById("ai-content");
    content.innerHTML = `
      <div class="ai-empty-state">
        <i class="bi bi-journal-check ai-empty-icon"></i>
        <p class="ai-empty-text">
          No hay tareas para analizar.<br>
          Agrega tareas para obtener insights personalizados.
        </p>
      </div>
    `;
  }

  showError() {
    const content = document.getElementById("ai-content");
    content.innerHTML = `
      <div class="ai-insight-card danger">
        <div class="ai-insight-header">
          <div class="ai-insight-icon">
            <i class="bi bi-exclamation-circle"></i>
          </div>
          <h4 class="ai-insight-title">Error al analizar</h4>
        </div>
        <p class="ai-insight-body">
          No se pudo completar el análisis. Intenta nuevamente.
        </p>
      </div>
    `;
  }

  renderInsights() {
    const content = document.getElementById("ai-content");

    if (this.insights.length === 0) {
      this.showEmptyState();
      return;
    }

    content.innerHTML = this.insights
      .map(
        (insight, index) => `
      <div class="ai-insight-card ${insight.type}" style="animation-delay: ${
          index * 0.1
        }s">
        <div class="ai-insight-header">
          <div class="ai-insight-icon">
            <i class="bi ${insight.icon}"></i>
          </div>
          <h4 class="ai-insight-title">${insight.title}</h4>
        </div>
        <p class="ai-insight-body">${insight.message}</p>
      </div>
    `
      )
      .join("");
  }

  updateBadge() {
    const badge = document.getElementById("ai-badge");
    const notification = document.getElementById("ai-notification");

    const importantInsights = this.insights.filter(
      (i) => i.type === "danger" || i.type === "warning"
    ).length;

    if (importantInsights > 0) {
      notification.textContent = importantInsights;
      notification.style.display = "flex";
      badge.classList.add("has-insights");
    } else {
      notification.style.display = "none";
      badge.classList.remove("has-insights");
    }
  }

  // ============================================
  // 🏷️ BADGES EN TARJETAS
  // ============================================

  addBadgesToTaskCards() {
    const analysis = this.analyzeTasksLocally();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Remover badges existentes
    document.querySelectorAll(".task-ai-badge").forEach((el) => el.remove());

    this.tasks.forEach((task) => {
      const taskCard = document
        .querySelector(`[data-task-id="${task.id}"]`)
        ?.closest(".task-card");
      if (!taskCard) return;

      const taskDate = new Date(task.fechaEntrega);
      taskDate.setHours(0, 0, 0, 0);

      let badgeConfig = null;

      // Vencida
      if (taskDate < today && task.estado !== "completado") {
        badgeConfig = {
          type: "danger",
          icon: "bi-exclamation-triangle-fill",
          tooltip: "¡Tarea vencida! Atiéndela lo antes posible",
        };
      }
      // Vence hoy o mañana
      else if (
        taskDate <= today.getTime() + 86400000 &&
        task.estado !== "completado"
      ) {
        badgeConfig = {
          type: "warning",
          icon: "bi-alarm-fill",
          tooltip: "Vence pronto. Asegúrate de completarla a tiempo",
        };
      }
      // Alta prioridad sin empezar
      else if (task.prioridad === "alta" && task.estado === "pendiente") {
        badgeConfig = {
          type: "warning",
          icon: "bi-flag-fill",
          tooltip: "Prioridad alta. Considera empezarla pronto",
        };
      }
      // Sin descripción
      else if (!task.descripcion || task.descripcion.trim() === "") {
        badgeConfig = {
          type: "info",
          icon: "bi-info-circle",
          tooltip: "Agrega una descripción para mejor organización",
        };
      }

      if (badgeConfig) {
        this.addBadgeToCard(taskCard, badgeConfig);
      }
    });
  }

  addBadgeToCard(card, config) {
    // Asegurar que la tarjeta tenga position relative
    if (getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }

    const badge = document.createElement("div");
    badge.className = `task-ai-badge ${config.type}`;
    badge.innerHTML = `
      <i class="bi ${config.icon}"></i>
      <div class="task-ai-tooltip">${config.tooltip}</div>
    `;

    card.appendChild(badge);
  }

  // ============================================
  // 🔄 ACTUALIZACIÓN
  // ============================================

  refresh() {
    this.insights = [];
    this.analyzeAndGenerateInsights();
  }
}

// ============================================
// 🚀 INICIALIZACIÓN GLOBAL
// ============================================

let taskAI;

function initTaskAI() {
  taskAI = new TaskAIAssistant();

  // Auto-analizar después de cargar tareas
  setTimeout(() => {
    taskAI.analyzeAndGenerateInsights();
  }, 1500);
}

// Exportar para uso global
window.taskAI = taskAI;
window.refreshTaskAI = () => taskAI?.refresh();

// Auto-inicializar si estamos en la página de tareas
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTaskAI);
} else {
  initTaskAI();
}

export { TaskAIAssistant, initTaskAI };
