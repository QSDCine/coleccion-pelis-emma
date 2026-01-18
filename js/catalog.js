import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // VARIABLES GLOBALES
  // ============================================================

  let peliculas = [];          // Películas reales desde Firestore
  let peliculasFiltradas = []; // Resultado tras filtros/búsqueda/ordenación
 


  const catalogo = document.getElementById("catalogo");
  const inputBusqueda = document.getElementById("input-busqueda");

  const filtroGenero = document.getElementById("filtro-genero");
  const filtroFormato = document.getElementById("filtro-formato");
  const filtroDirector = document.getElementById("filtro-director");
  const filtroAño = document.getElementById("filtro-año");
  const ordenarPor = document.getElementById("ordenar-por");

  const contadorPeliculas = document.getElementById("contador-peliculas");
  const btnCambiarVista = document.getElementById("btn-cambiar-vista");

  let vistaActual = "lista"; // "lista" o "cuadricula"


  // ============================================================
  // MODO OSCURO (persistente)
  // ============================================================

  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
  }
  
// ============================================================
// LECTURA DE PARÁMETRO "titulo" DESDE LA URL
// ============================================================
const params = new URLSearchParams(window.location.search);
const tituloBuscado = params.get("titulo");
  const sagaBuscada = params.get("saga");
  const edicionExacta = params.get("edicionExacta");

if (tituloBuscado) {
  inputBusqueda.value = tituloBuscado;
}

  // ============================================================
  // CARGA REAL DESDE FIRESTORE
  // ============================================================

  async function cargarPeliculas() {
    try {
      const querySnapshot = await getDocs(collection(db, "peliculas"));

      peliculas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      peliculasFiltradas = [...peliculas];

      rellenarFiltros();
      
      // Si venimos desde movie.html con ?edicionExacta=...
if (edicionExacta) {
  peliculasFiltradas = peliculas.filter(
    p => p.titulo === edicionExacta
  );

  renderizarCatalogo();
  return;
}
      
// Si venimos desde movie.html con ?saga=...
if (sagaBuscada) {
  peliculasFiltradas = peliculas
    .filter(p => p.saga.esParte && p.saga.nombre === sagaBuscada)
    .sort((a, b) => a.saga.numero - b.saga.numero);

  renderizarCatalogo();
  return; // importante: no seguir con el flujo normal
}
      
// Si venimos desde movie.html con ?titulo=...
if (tituloBuscado) {
  aplicarFiltros(); // esto ejecuta la búsqueda automáticamente
} else {
  renderizarCatalogo();
}


    } catch (error) {
      console.error("Error al cargar películas:", error);
      alert("Error al cargar el catálogo.");
    }
  }


  // ============================================================
  // RELLENAR FILTROS DINÁMICAMENTE
  // ============================================================

  function rellenarFiltros() {
    const generos = new Set();
    const formatos = new Set();
    const directores = new Set();
    const años = new Set();

    peliculas.forEach(p => {
      p.generos.forEach(g => generos.add(g));
      p.director.forEach(d => directores.add(d));
      formatos.add(p.formato);
      años.add(p.año);
    });

    rellenarSelect(filtroGenero, generos);
    rellenarSelect(filtroFormato, formatos);
    rellenarSelect(filtroDirector, directores);
    rellenarSelect(filtroAño, años);
  }

  function rellenarSelect(select, valores) {
    valores = Array.from(valores).sort();
    valores.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  }


// ============================================================
// BÚSQUEDA
// ============================================================

inputBusqueda.addEventListener("input", aplicarFiltros);

function normalizar(texto) {
  return texto
    .toLowerCase()
    .replace(/&/g, "n")               // & → n
    .normalize("NFD")                 // separa acentos
    .replace(/[\u0300-\u036f]/g, "")  // elimina acentos
    .replace(/[^a-z0-9 ]/g, "")       // elimina símbolos (& / - ' etc.)
    .trim();
}

function coincideBusqueda(pelicula, texto) {
  const tTitulo = normalizar(pelicula.titulo);
  const tokens = normalizar(texto).split(" ").filter(t => t.length > 0);

  // Cada palabra buscada debe aparecer en el título, en cualquier orden
  return tokens.every(t => tTitulo.includes(t));
}


  // ============================================================
  // FILTROS
  // ============================================================

  filtroGenero.addEventListener("change", aplicarFiltros);
  filtroFormato.addEventListener("change", aplicarFiltros);
  filtroDirector.addEventListener("change", aplicarFiltros);
  filtroAño.addEventListener("change", aplicarFiltros);
  ordenarPor.addEventListener("change", aplicarFiltros);

  function aplicarFiltros() {
    const texto = inputBusqueda.value.trim().toLowerCase();

    peliculasFiltradas = peliculas.filter(p => {

      if (texto && !coincideBusqueda(p, texto)) return false;

      if (filtroGenero.value && !p.generos.includes(filtroGenero.value)) return false;

      if (filtroFormato.value && p.formato !== filtroFormato.value) return false;

      if (filtroDirector.value && !p.director.includes(filtroDirector.value)) return false;

      if (filtroAño.value && p.año.toString() !== filtroAño.value) return false;

      return true;
    });

    ordenarPeliculas();
    renderizarCatalogo();
  }


  // ============================================================
  // ORDENACIÓN
  // ============================================================

  function ordenarPeliculas() {
    const criterio = ordenarPor.value;

    peliculasFiltradas.sort((a, b) => {
      if (criterio === "titulo") return a.titulo.localeCompare(b.titulo);
      if (criterio === "año") return a.año - b.año;
      if (criterio === "formato") return a.formato.localeCompare(b.formato);
    });
  }


  // ============================================================
  // RENDERIZADO DEL CATÁLOGO
  // ============================================================

  function renderizarCatalogo() {
    catalogo.innerHTML = "";

    peliculasFiltradas.forEach(p => {
      const card = vistaActual === "lista" ?
         crearCardLista(p)
        : crearCardCuadricula(p);

      catalogo.appendChild(card);
    });

    contadorPeliculas.textContent = `Total: ${peliculasFiltradas.length} películas`;
  }


  // --- Vista lista ---
  function crearCardLista(p) {
    const div = document.createElement("div");
    div.className = "pelicula-lista";
    div.addEventListener("click", () => abrirDetalle(p.id));

    div.innerHTML = `
      <img src="${p.portada}" alt="${p.titulo}">
      <div class="info">
        <span class="titulo">${p.titulo}</span>
        <span class="detalle">${p.año} • ${p.formato}</span>
      </div>
    `;

    return div;
  }

  // --- Vista cuadrícula ---
  function crearCardCuadricula(p) {
    const div = document.createElement("div");
    div.className = "pelicula-cuadricula";
    div.addEventListener("click", () => abrirDetalle(p.id));

    div.innerHTML = `
      <img src="${p.portada}" alt="${p.titulo}">
      <span class="titulo">${p.titulo}</span>
      <span class="detalle">${p.año}</span>
    `;

    return div;
  }


  // ============================================================
  // ABRIR DETALLE
  // ============================================================

  function abrirDetalle(id) {
    window.location.href = `movie.html?id=${id}`;
  }


  // ============================================================
  // CAMBIO DE VISTA (lista/cuadrícula)
  // ============================================================
btnCambiarVista.style.position = "fixed";
btnCambiarVista.style.left = "calc(100% - 80px)";
btnCambiarVista.style.top = "calc(100% - 80px)";
  
btnCambiarVista.addEventListener("click", () => {
  if (movido) return; // si se arrastró, NO cambiar vista

  vistaActual = vistaActual === "lista" ? "cuadricula" : "lista";

  catalogo.classList.toggle("vista-lista");
  catalogo.classList.toggle("vista-cuadricula");

  renderizarCatalogo();
});


 // ============================================================
// BOTÓN FLOTANTE ARRASTRABLE (PC + MÓVIL)
// ============================================================

let movido = false;
let arrastrando = false;
let offsetX = 0;
let offsetY = 0;

function iniciarMovimiento(e) {
  arrastrando = true;
  movido = false;

  const punto = e.touches ? e.touches[0] : e;

  offsetX = punto.clientX - btnCambiarVista.offsetLeft;
  offsetY = punto.clientY - btnCambiarVista.offsetTop;
}

function mover(e) {
  if (!arrastrando) return;

  const punto = e.touches ? e.touches[0] : e;

  movido = true;

  btnCambiarVista.style.left = `${punto.clientX - offsetX}px`;
  btnCambiarVista.style.top = `${punto.clientY - offsetY}px`;
  btnCambiarVista.style.position = "fixed";
}

function terminarMovimiento() {
  arrastrando = false;
}

// Ratón
btnCambiarVista.addEventListener("mousedown", iniciarMovimiento);
document.addEventListener("mousemove", mover);
document.addEventListener("mouseup", terminarMovimiento);

// Táctil
btnCambiarVista.addEventListener("touchstart", iniciarMovimiento);
document.addEventListener("touchmove", mover);
document.addEventListener("touchend", terminarMovimiento);

  // ============================================================
// BOTONES DEL HEADER
// ============================================================

document.getElementById("btn-volver-index").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("btn-reset").addEventListener("click", () => {
  // Limpiar búsqueda
  inputBusqueda.value = "";

  // Resetear selects
  filtroGenero.value = "";
  filtroFormato.value = "";
  filtroDirector.value = "";
  filtroAño.value = "";
  ordenarPor.value = "titulo";

  // Restaurar catálogo completo
  peliculasFiltradas = [...peliculas];
  renderizarCatalogo();
});

  // ============================================================
  // INICIO
  // ============================================================

  cargarPeliculas();


});









