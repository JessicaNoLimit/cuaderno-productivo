// app.js

// ---- elementos tareas ----
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

// ---- elementos memoria ----
const memoryInput = document.getElementById("memoryInput");
const saveMemoryButton = document.getElementById("saveMemoryButton");
const memoryList = document.getElementById("memoryList");

// ---- favoritos ----
const favoriteList = document.getElementById("favoriteList");
const MAX_FAVORITOS = 8;

// Genera una clave única para identificar el favorito (texto + color)
function makeKey(texto, colorClase) {
  return `${colorClase}__${texto}`; // simple y suficiente para el ejercicio
}

// Busca un favorito existente por key
function findFavoriteByKey(key) {
  return favoriteList.querySelector(`[data-key="${CSS.escape(key)}"]`);
}

// Añadir a favoritos
function addFavorite(texto, colorClase) {
  const key = makeKey(texto, colorClase);

  // Si ya existe, no duplicar
  if (findFavoriteByKey(key)) return;

  const favItem = document.createElement("li");
  favItem.className = `list-item ${colorClase}`;
  favItem.dataset.key = key;
  favItem.textContent = texto;

  // Añadir arriba (historial)
  favoriteList.prepend(favItem);

  // Limitar a MAX_FAVORITOS
  while (favoriteList.children.length > MAX_FAVORITOS) {
    favoriteList.removeChild(favoriteList.lastElementChild);
  }
}

// Eliminar de favoritos
function removeFavorite(texto, colorClase) {
  const key = makeKey(texto, colorClase);
  const existing = findFavoriteByKey(key);
  if (existing) existing.remove();
}

// Crear item (tarea o memoria) con estrella toggle
function crearItem(texto, colorClase) {
  const li = document.createElement("li");
  li.className = `list-item ${colorClase}`;

  const span = document.createElement("span");
  span.textContent = texto;

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.textContent = "☆"; // por defecto no favorito
  favBtn.title = "Añadir/Quitar de favoritos";

  const updateStar = () => {
    const key = makeKey(texto, colorClase);
    const exists = !!findFavoriteByKey(key);
    favBtn.textContent = exists ? "★" : "☆";
  };

  // Click estrella: toggle
  favBtn.addEventListener("click", () => {
    const key = makeKey(texto, colorClase);
    const exists = !!findFavoriteByKey(key);

    if (exists) {
      removeFavorite(texto, colorClase);
    } else {
      addFavorite(texto, colorClase);
    }

    updateStar();
  });

  // Inicializa el estado de la estrella (por si ya existiera)
  updateStar();

  li.appendChild(span);
  li.appendChild(favBtn);

  return li;
}

// ---- acciones tareas ----
function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  const item = crearItem(text, "item-azul");
  taskList.prepend(item);

  taskInput.value = "";
  taskInput.focus();
}

addButton.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// ---- acciones memoria ----
function addMemory() {
  const text = memoryInput.value.trim();
  if (text === "") return;

  const item = crearItem(text, "item-magenta");
  memoryList.prepend(item);

  memoryInput.value = "";
  memoryInput.focus();
}

saveMemoryButton.addEventListener("click", addMemory);
memoryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addMemory();
});