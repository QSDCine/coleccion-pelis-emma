import { db } from "./firebase.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

  // ============================================================
  // MODO OSCURO (persistente)
  // ============================================================
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
  }

  // ============================================================
  // OBTENER ID DE LA URL
  // ============================================================
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get("id");

  if (!idPelicula) {
    alert("No se ha especificado ninguna película.");
    return;
  }

  // ============================================================
  // CARGAR PELÍCULA REAL DESDE FIRESTORE
  // ============================================================
  const ref = doc(db, "peliculas", idPelicula);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Película no encontrada.");
    window.location.href = "catalog.html";
    return;
  }

  const pelicula = snap.data();

  // ============================================================
  // RELLENAR LA PÁGINA
  // ============================================================
  document.getElementById("titulo-pelicula").textContent = pelicula.titulo;

  const portada = document.getElementById("portada");
  portada.src = pelicula.portada;
  portada.alt = pelicula.titulo;

  document.getElementById("año").textContent = pelicula.año;
  document.getElementById("director").textContent = pelicula.director.join(", ");
  document.getElementById("generos").textContent = pelicula.generos.join(", ");
  document.getElementById("formato").textContent = pelicula.formato;
  document.getElementById("edicionEspecial").textContent =
    pelicula.edicionEspecial ? "Sí" : "No";

  const sagaSpan = document.getElementById("saga");
  sagaSpan.textContent = pelicula.saga.esParte ?
     `Película ${pelicula.saga.numero} de ${pelicula.saga.totalsaga}`
    : "No pertenece a ninguna saga";

  document.getElementById("notas").textContent = pelicula.notas;

  // ============================================================
// BOTÓN "VER SAGA"
// ============================================================
const btnSaga = document.getElementById("btn-ver-saga");

if (
  pelicula.saga?.esParte &&
  pelicula.saga.nombre &&
  pelicula.saga.nombre.trim() !== ""
) {
  btnSaga.classList.remove("oculto"); // mostrar
  btnSaga.addEventListener("click", () => {
    window.location.href =
      `catalog.html?saga=${encodeURIComponent(pelicula.saga.nombre)}`;
  });
} else {
  btnSaga.classList.add("oculto"); // ocultar
}


  // ============================================================
  // BOTÓN "VER OTRAS EDICIONES"
  // ============================================================
  document.getElementById("btn-otras-ediciones").addEventListener("click", () => {
    window.location.href = `catalog.html?edicionExacta=${encodeURIComponent(pelicula.titulo)}`;
  });

  // ============================================================
  // BOTÓN ATRÁS
  // ============================================================
  document.getElementById("btn-atras").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  // ============================================================
  // BOTÓN EDITAR
  // ============================================================
  document.getElementById("btn-editar").addEventListener("click", () => {
    window.location.href = `edit.html?id=${idPelicula}`;
  });

  // ============================================================
  // BOTÓN ELIMINAR (REAL)
  // ============================================================
  document.getElementById("btn-eliminar").addEventListener("click", async () => {
    const confirmar = confirm("¿Seguro que quieres eliminar esta película?");

    if (!confirmar) return;

    try {
      await deleteDoc(ref);
      alert("Película eliminada correctamente.");
      window.location.href = "catalog.html";
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la película.");
    }
  });


});




