// app.js

// =============================
// ELEMENTOS DEL DOM
// =============================

// ---- tareas ----
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

// ---- memoria ----
const memoryInput = document.getElementById("memoryInput");
const saveMemoryButton = document.getElementById("saveMemoryButton");
const memoryList = document.getElementById("memoryList");

// ---- favoritos ----
const favoriteList = document.getElementById("favoriteList");
const MAX_FAVORITOS = 8;

// ---- extras tareas (deben existir en HTML) ----
const taskCounter = document.getElementById("taskCounter");
const clearCompletedButton = document.getElementById("clearCompletedButton");
const showAllButton = document.getElementById("showAll");
const showPendingButton = document.getElementById("showPending");
const showCompletedButton = document.getElementById("showCompleted");

// =============================
// ESTADO DE LA APP
// =============================

let tasks = [];
let memories = [];
let currentFilter = "all";

// =============================
// LOCAL STORAGE
// =============================

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("memories", JSON.stringify(memories));
  localStorage.setItem("currentFilter", currentFilter);
}

function loadData() {
  const savedTasks = localStorage.getItem("tasks");
  const savedMemories = localStorage.getItem("memories");
  const savedFilter = localStorage.getItem("currentFilter");

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }

  if (savedMemories) {
    memories = JSON.parse(savedMemories);
  }

  if (savedFilter) {
    currentFilter = savedFilter;
  }
}

// =============================
// HELPERS
// =============================

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function makeKey(kind, id) {
  return `${kind}__${id}`;
}

// =============================
// TAREAS
// =============================

function addTask(text) {
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: getCurrentTime(),
    isFavorite: false,
    favoritedAt: null
  };

  tasks.unshift(newTask);
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function getPendingTasksCount() {
  return tasks.filter((task) => !task.completed).length;
}

// =============================
// MEMORIAS
// =============================

function addMemory(text) {
  const newMemory = {
    id: Date.now(),
    text: text,
    isFavorite: false,
    favoritedAt: null
  };

  memories.unshift(newMemory);
}

function deleteMemory(id) {
  memories = memories.filter((memory) => memory.id !== id);
}

// =============================
// FAVORITOS
// =============================

function toggleFavorite(kind, id) {
  if (kind === "task") {
    tasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            isFavorite: !task.isFavorite,
            favoritedAt: !task.isFavorite ? Date.now() : null
          }
        : task
    );
  }

  if (kind === "memory") {
    memories = memories.map((memory) =>
      memory.id === id
        ? {
            ...memory,
            isFavorite: !memory.isFavorite,
            favoritedAt: !memory.isFavorite ? Date.now() : null
          }
        : memory
    );
  }
}

function getFavorites() {
  const taskFavorites = tasks
    .filter((task) => task.isFavorite)
    .map((task) => ({
      key: makeKey("task", task.id),
      text: task.text,
      colorClass: "item-azul",
      favoritedAt: task.favoritedAt ?? 0
    }));

  const memoryFavorites = memories
    .filter((memory) => memory.isFavorite)
    .map((memory) => ({
      key: makeKey("memory", memory.id),
      text: memory.text,
      colorClass: "item-magenta",
      favoritedAt: memory.favoritedAt ?? 0
    }));

  return [...taskFavorites, ...memoryFavorites]
    .sort((a, b) => b.favoritedAt - a.favoritedAt)
    .slice(0, MAX_FAVORITOS);
}

// =============================
// RENDER
// =============================

function renderTaskCounter() {
  if (!taskCounter) return;
  const pending = getPendingTasksCount();
  taskCounter.textContent = `Tareas pendientes: ${pending}`;
}

function renderFilterButtons() {
  if (!showAllButton || !showPendingButton || !showCompletedButton) return;

  showAllButton.classList.toggle("active-filter", currentFilter === "all");
  showPendingButton.classList.toggle("active-filter", currentFilter === "pending");
  showCompletedButton.classList.toggle("active-filter", currentFilter === "completed");
}

function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `list-item item-azul`;

    if (task.completed) {
      li.classList.add("completed");
    }

    const content = document.createElement("div");
    content.className = "item-content";

    const textSpan = document.createElement("span");
    textSpan.className = "item-text";
    textSpan.textContent = task.text;

    const timeSmall = document.createElement("small");
    timeSmall.className = "item-time";
    timeSmall.textContent = task.createdAt;

    // Click en el texto para marcar/desmarcar completada
    textSpan.addEventListener("click", () => {
      toggleTask(task.id);
      saveData();
      renderAll();
    });

    content.appendChild(textSpan);
    content.appendChild(timeSmall);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const completeBtn = document.createElement("button");
    completeBtn.className = "complete-btn";
    completeBtn.textContent = task.completed ? "↺" : "✓";
    completeBtn.title = task.completed ? "Marcar como pendiente" : "Marcar como completada";

    completeBtn.addEventListener("click", () => {
      toggleTask(task.id);
      saveData();
      renderAll();
    });

    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.textContent = task.isFavorite ? "★" : "☆";
    favBtn.title = "Añadir/Quitar de favoritos";

    favBtn.addEventListener("click", () => {
      toggleFavorite("task", task.id);
      saveData();
      renderAll();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Eliminar tarea";

    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
      saveData();
      renderAll();
    });

    actions.appendChild(completeBtn);
    actions.appendChild(favBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(content);
    li.appendChild(actions);

    taskList.appendChild(li);
  });

  renderTaskCounter();
  renderFilterButtons();
}

function renderMemories() {
  if (!memoryList) return;

  memoryList.innerHTML = "";

  memories.forEach((memory) => {
    const li = document.createElement("li");
    li.className = "list-item item-magenta";

    const span = document.createElement("span");
    span.className = "item-text";
    span.textContent = memory.text;

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.textContent = memory.isFavorite ? "★" : "☆";
    favBtn.title = "Añadir/Quitar de favoritos";

    favBtn.addEventListener("click", () => {
      toggleFavorite("memory", memory.id);
      saveData();
      renderAll();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Eliminar memoria";

    deleteBtn.addEventListener("click", () => {
      deleteMemory(memory.id);
      saveData();
      renderAll();
    });

    actions.appendChild(favBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);

    memoryList.appendChild(li);
  });
}

function renderFavorites() {
  if (!favoriteList) return;

  favoriteList.innerHTML = "";

  const favorites = getFavorites();

  favorites.forEach((fav) => {
    const li = document.createElement("li");
    li.className = `list-item ${fav.colorClass}`;
    li.dataset.key = fav.key;
    li.textContent = fav.text;
    favoriteList.appendChild(li);
  });
}

function renderAll() {
  renderTasks();
  renderMemories();
  renderFavorites();
}

// =============================
// EVENTOS
// =============================

// ---- añadir tarea ----
if (addButton) {
  addButton.addEventListener("click", () => {
    const text = taskInput.value.trim();

    if (text === "") return;

    addTask(text);
    saveData();
    renderAll();

    taskInput.value = "";
    taskInput.focus();
  });
}

if (taskInput) {
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = taskInput.value.trim();

      if (text === "") return;

      addTask(text);
      saveData();
      renderAll();

      taskInput.value = "";
      taskInput.focus();
    }
  });
}

// ---- añadir memoria ----
if (saveMemoryButton) {
  saveMemoryButton.addEventListener("click", () => {
    const text = memoryInput.value.trim();

    if (text === "") return;

    addMemory(text);
    saveData();
    renderAll();

    memoryInput.value = "";
    memoryInput.focus();
  });
}

if (memoryInput) {
  memoryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      const text = memoryInput.value.trim();

      if (text === "") return;

      addMemory(text);
      saveData();
      renderAll();

      memoryInput.value = "";
      memoryInput.focus();
    }
  });
}

// ---- limpiar completadas ----
if (clearCompletedButton) {
  clearCompletedButton.addEventListener("click", () => {
    clearCompletedTasks();
    saveData();
    renderAll();
  });
}

// ---- filtros ----
if (showAllButton) {
  showAllButton.addEventListener("click", () => {
    currentFilter = "all";
    saveData();
    renderAll();
  });
}

if (showPendingButton) {
  showPendingButton.addEventListener("click", () => {
    currentFilter = "pending";
    saveData();
    renderAll();
  });
}

if (showCompletedButton) {
  showCompletedButton.addEventListener("click", () => {
    currentFilter = "completed";
    saveData();
    renderAll();
  });
}

// =============================
// INICIO
// =============================

loadData();
renderAll();