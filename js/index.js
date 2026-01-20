import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // BOTONES
  // ============================

  const btnCatalog = document.getElementById("btn-catalog");
  const btnAdd = document.getElementById("btn-add");
  const btnTheme = document.getElementById("toggle-theme");
  const btnRandom = document.getElementById("btn-random"); // <-- NUEVO

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
  // ¿QUÉ VEMOS HOY?
  // ============================

  btnRandom.addEventListener("click", async () => {
    try {
      const snap = await getDocs(collection(db, "peliculas"));
      const peliculas = snap.docs;

      if (peliculas.length === 0) {
        mostrarToast("No hay películas en la colección.");
        return;
      }

      const random = peliculas[Math.floor(Math.random() * peliculas.length)];
      const id = random.id;

      window.location.href = `movie.html?id=${id}`;
    } catch (error) {
      console.error(error);
      mostrarToast("Error al obtener una película aleatoria.");
    }
  });

  // ============================
  // MODO OSCURO / CLARO
  // ============================

  const temaGuardado = localStorage.getItem("tema");

  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
    btnTheme.textContent = "☀️";
  } else {
    btnTheme.textContent = "🌙";
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
