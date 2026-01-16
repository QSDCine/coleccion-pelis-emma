import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // MODO OSCURO
  // ============================
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
  }

  // ============================
  // REFERENCIAS
  // ============================
  const form = document.getElementById("form-add");

  const inputTitulo = document.getElementById("titulo");
  const inputAño = document.getElementById("año");
  const inputDirector = document.getElementById("director");
  const inputGeneros = document.getElementById("generos");
  const selectFormato = document.getElementById("formato");
  const selectEdicionEspecial = document.getElementById("edicionEspecial");
  const selectEsParteSaga = document.getElementById("esParteSaga");

  const camposSaga = document.getElementById("campos-saga");
  const inputNombreSaga = document.getElementById("nombreSaga");
  const inputNumeroSaga = document.getElementById("numeroSaga");
  const inputTotalSaga = document.getElementById("totalSaga");

  const inputNotas = document.getElementById("notas");
  const inputPortada = document.getElementById("portada");

  // ============================
  // MOSTRAR/OCULTAR SAGA
  // ============================
selectEsParteSaga.addEventListener("change", () => {
  if (selectEsParteSaga.value === "true") {
    camposSaga.style.display = "block";
    inputNombreSaga.required = true;
    inputNumeroSaga.required = true;
    inputTotalSaga.required = true;
  } else {
    camposSaga.style.display = "none";
    inputNombreSaga.required = false;
    inputNumeroSaga.required = false;
    inputTotalSaga.required = false;
    inputNombreSaga.value = "";
    inputNumeroSaga.value = "";
    inputTotalSaga.value = "";
  }
});

  // ============================
  // GUARDAR PELÍCULA
  // ============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const directores = inputDirector.value
      .split(",")
      .map(d => d.trim())
      .filter(d => d !== "");

    const generos = inputGeneros.value
      .split(",")
      .map(g => g.trim())
      .filter(g => g !== "");

    const edicionEspecial = selectEdicionEspecial.value === "true";

const saga = {
  esParte: selectEsParteSaga.value === "true",
  nombre: selectEsParteSaga.value === "true" ? inputNombreSaga.value.trim() : "",
  numero: selectEsParteSaga.value === "true" ? Number(inputNumeroSaga.value) : null,
  totalsaga: selectEsParteSaga.value === "true" ? Number(inputTotalSaga.value) : null
};

    const portadaFinal = inputPortada.value.trim() || "https://qsdcine.github.io/coleccion-pelis-dan/img/default.jpg";

    const nuevaPelicula = {
      titulo: inputTitulo.value.trim(),
      año: Number(inputAño.value),
      director: directores,
      generos: generos,
      formato: selectFormato.value,
      edicionEspecial: edicionEspecial,
      saga: saga,
      notas: inputNotas.value.trim(),
      portada: portadaFinal
    };

    try {
      const ref = await addDoc(collection(db, "peliculas"), nuevaPelicula);
      alert("Película añadida correctamente.");
      window.location.href = `movie.html?id=${ref.id}`;
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la película.");
    }
  });


});

