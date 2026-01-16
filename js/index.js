document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // BOTONES
  // ============================

  const btnCatalog = document.getElementById("btn-catalog");
  const btnAdd = document.getElementById("btn-add");
  const btnTheme = document.getElementById("toggle-theme");

  // ============================
  // NAVEGACIÓN ENTRE PÁGINAS
  // ============================

  btnCatalog.addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  btnAdd.addEventListener("click", () => {
    window.location.href = "add.html";
  });

  // ============================
  // MODO OSCURO / CLARO
  // ============================

// Cargar preferencia guardada
const temaGuardado = localStorage.getItem("tema");

if (temaGuardado === "oscuro") {
  document.body.classList.add("oscuro");
  btnTheme.textContent = "☀️"; // icono de sol
} else {
  btnTheme.textContent = "🌙"; // icono de luna
}

btnTheme.addEventListener("click", () => {
  document.body.classList.toggle("oscuro");

  if (document.body.classList.contains("oscuro")) {
    localStorage.setItem("tema", "oscuro");
    btnTheme.textContent = "☀️";
  } else {
    localStorage.setItem("tema", "claro");
    btnTheme.textContent = "🌙";
  }
});

});