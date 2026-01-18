import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

  // ============================
  // MODO OSCURO
  // ============================
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
  }

  // ============================
  // OBTENER ID
  // ============================
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get("id");

  if (!idPelicula) {
    mostrarToast("No se ha especificado ninguna película para editar.");
    return;
  }

  // ============================
  // REFERENCIAS
  // ============================
  const form = document.getElementById("form-edit");

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
  // CARGAR PELÍCULA REAL
  // ============================
  const ref = doc(db, "peliculas", idPelicula);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    mostrarToast("Película no encontrada.");
    window.location.href = "catalog.html";
    return;
  }

  const pelicula = snap.data();

  // ============================
  // RELLENAR FORMULARIO
  // ============================
  inputTitulo.value = pelicula.titulo;
  inputAño.value = pelicula.año;
  inputDirector.value = pelicula.director.join(", ");
  inputGeneros.value = pelicula.generos.join(", ");
  selectFormato.value = pelicula.formato;
  selectEdicionEspecial.value = pelicula.edicionEspecial ? "true" : "false";
  inputNotas.value = pelicula.notas;
  inputPortada.value = pelicula.portada || "";

  if (pelicula.saga.esParte) {
    selectEsParteSaga.value = "true";
    camposSaga.style.display = "block";
    inputNombreSaga.value = pelicula.saga.nombre;
    inputNumeroSaga.value = pelicula.saga.numero;
    inputTotalSaga.value = pelicula.saga.totalsaga;
    inputNombreSaga.required = true;
    inputNumeroSaga.required = true;
    inputTotalSaga.required = true;
  } else {
    selectEsParteSaga.value = "false";
    camposSaga.style.display = "none";
  }

  // ============================
  // MOSTRAR/OCULTAR SAGA
  // ============================
  selectEsParteSaga.addEventListener("change", () => {
    if (selectEsParteSaga.value === "true") {
      camposSaga.style.display = "block";
      inputNumeroSaga.required = true;
      inputTotalSaga.required = true;
    } else {
      camposSaga.style.display = "none";
      inputNumeroSaga.required = false;
      inputTotalSaga.required = false;
      inputNumeroSaga.value = "";
      inputTotalSaga.value = "";
    }
  });

  // ============================
  // GUARDAR CAMBIOS
  // ============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      mostrarToast("Por favor, completa todos los campos obligatorios.");
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

    const portadaFinal = inputPortada.value.trim() || pelicula.portada;

    await updateDoc(ref, {
      titulo: inputTitulo.value.trim(),
      año: Number(inputAño.value),
      director: directores,
      generos: generos,
      formato: selectFormato.value,
      edicionEspecial: edicionEspecial,
      saga: saga,
      notas: inputNotas.value.trim(),
      portada: portadaFinal
    });

    mostrarToast("Cambios guardados correctamente.");
    window.location.href = `movie.html?id=${idPelicula}`;
  });

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2500);
}
});
