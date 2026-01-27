import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // VARIABLES GLOBALES
  // ============================================================

  let peliculas = [];
  let peliculasFiltradas = [];

  const catalogo = document.getElementById("catalogo");
  const inputBusqueda = document.getElementById("input-busqueda");

  const filtroGenero = document.getElementById("filtro-genero");
  const filtroFormato = document.getElementById("filtro-formato");
  const filtroDirector = document.getElementById("filtro-director");
  const filtroAño = document.getElementById("filtro-año");
  const ordenarPor = document.getElementById("ordenar-por");

  const contadorPeliculas = document.getElementById("contador-peliculas");
  const btnCambiarVista = document.getElementById("btn-cambiar-vista");

  let vistaActual = "lista";

  // ============================================================
  // MODO OSCURO
  // ============================================================

  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
  }

  // ============================================================
  // PARÁMETROS DE URL
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

      // ============================================================
      // RESTAURAR ESTADO DESDE LOCALSTORAGE
      // ============================================================

      const busquedaGuardada = localStorage.getItem("catalogo_busqueda");
      if (busquedaGuardada) inputBusqueda.value = busquedaGuardada;

      const generoGuardado = localStorage.getItem("catalogo_genero");
      if (generoGuardado) filtroGenero.value = generoGuardado;

      const formatoGuardado = localStorage.getItem("catalogo_formato");
      if (formatoGuardado) filtroFormato.value = formatoGuardado;

      const directorGuardado = localStorage.getItem("catalogo_director");
      if (directorGuardado) filtroDirector.value = directorGuardado;

      const añoGuardado = localStorage.getItem("catalogo_año");
      if (añoGuardado) filtroAño.value = añoGuardado;

      const ordenGuardado = localStorage.getItem("catalogo_orden");
      if (ordenGuardado) ordenarPor.value = ordenGuardado;

      // ============================================================
      // RESTAURAR VISTA
      // ============================================================

      const vistaGuardada = localStorage.getItem("catalogo_vista");
      if (vistaGuardada) {
        vistaActual = vistaGuardada;
        catalogo.classList.toggle("vista-cuadricula", vistaActual === "cuadricula");
        catalogo.classList.toggle("vista-lista", vistaActual === "lista");
      }

      // ============================================================
      // Edicion exacta
      // ============================================================

if (edicionExacta) {

  // 1. Resetear búsqueda
  inputBusqueda.value = "";
  localStorage.removeItem("catalogo_busqueda");

  // 2. Resetear selects
  filtroGenero.value = "";
  filtroFormato.value = "";
  filtroDirector.value = "";
  filtroAño.value = "";
  ordenarPor.value = "";

  localStorage.removeItem("catalogo_genero");
  localStorage.removeItem("catalogo_formato");
  localStorage.removeItem("catalogo_director");
  localStorage.removeItem("catalogo_año");
  localStorage.removeItem("catalogo_orden");

  // 3. Resetear estado interno
  peliculasFiltradas = [...peliculas];

  // 4. Aplicar filtro exacto
  peliculasFiltradas = peliculas.filter(p => p.titulo === edicionExacta);

  // 5. Renderizar
  renderizarCatalogo();
  return;
}


      
      // ============================================================
      // SAGA TEMPORAL (sessionStorage)
      // ============================================================

      const sagaTemporal = sessionStorage.getItem("catalogo_saga");

      if (sagaBuscada || sagaTemporal) {
        const nombreSaga = sagaBuscada || sagaTemporal;

        peliculasFiltradas = peliculas
          .filter(p => p.saga.esParte && p.saga.nombre === nombreSaga)
          .sort((a, b) => a.saga.numero - b.saga.numero);

        renderizarCatalogo();
        return;
      }

      // ============================================================
      // SI HAY ESTADO GUARDADO, APLICARLO Y SALIR
      // ============================================================

      if (
        busquedaGuardada ||
        generoGuardado ||
        formatoGuardado ||
        directorGuardado ||
        añoGuardado ||
        ordenGuardado
      ) {
        aplicarFiltros();
        return;
      }

      // ============================================================
      // FLUJOS ESPECIALES DESDE movie.html
      // ============================================================



      if (tituloBuscado) {
        aplicarFiltros();
      } else {
        renderizarCatalogo();
      }

    } catch (error) {
      console.error("Error al cargar películas:", error);
      alert("Error al cargar el catálogo.");
    }
  }

  // ============================================================
  // RELLENAR FILTROS
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
  // GUARDAR ESTADO EN LOCALSTORAGE
  // ============================================================

  inputBusqueda.addEventListener("input", () => {
    localStorage.setItem("catalogo_busqueda", inputBusqueda.value);
  });

  filtroGenero.addEventListener("change", () => {
    localStorage.setItem("catalogo_genero", filtroGenero.value);
  });

  filtroFormato.addEventListener("change", () => {
    localStorage.setItem("catalogo_formato", filtroFormato.value);
  });

  filtroDirector.addEventListener("change", () => {
    localStorage.setItem("catalogo_director", filtroDirector.value);
  });

  filtroAño.addEventListener("change", () => {
    localStorage.setItem("catalogo_año", filtroAño.value);
  });

  ordenarPor.addEventListener("change", () => {
    localStorage.setItem("catalogo_orden", ordenarPor.value);
  });

  // ============================================================
  // BÚSQUEDA + FILTROS
  // ============================================================

  inputBusqueda.addEventListener("input", aplicarFiltros);
  filtroGenero.addEventListener("change", aplicarFiltros);
  filtroFormato.addEventListener("change", aplicarFiltros);
  filtroDirector.addEventListener("change", aplicarFiltros);
  filtroAño.addEventListener("change", aplicarFiltros);
  ordenarPor.addEventListener("change", aplicarFiltros);

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .replace(/&/g, "n")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim();
  }

  function coincideBusqueda(pelicula, texto) {
    const tTitulo = normalizar(pelicula.titulo);
    const tokens = normalizar(texto).split(" ").filter(t => t.length > 0);
    return tokens.every(t => tTitulo.includes(t));
  }

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
  // RENDERIZADO
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
  // CAMBIO DE VISTA
  // ============================================================

  btnCambiarVista.style.position = "fixed";
  btnCambiarVista.style.left = "calc(100% - 80px)";
  btnCambiarVista.style.top = "calc(100% - 80px)";

  btnCambiarVista.addEventListener("click", () => {
    if (movido) return;

    vistaActual = vistaActual === "lista" ? "cuadricula" : "lista";
    localStorage.setItem("catalogo_vista", vistaActual);

    catalogo.classList.toggle("vista-lista");
    catalogo.classList.toggle("vista-cuadricula");

    renderizarCatalogo();
  });

  // ============================================================
  // BOTÓN FLOTANTE ARRASTRABLE
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

  btnCambiarVista.addEventListener("mousedown", iniciarMovimiento);
  document.addEventListener("mousemove", mover);
  document.addEventListener("mouseup", terminarMovimiento);

  btnCambiarVista.addEventListener("touchstart", iniciarMovimiento);
  document.addEventListener("touchmove", mover);
  document.addEventListener("touchend", terminarMovimiento);

  // ============================================================
  // BOTONES DEL HEADER
  // ============================================================

  document.getElementById("btn-volver-index").addEventListener("click", () => {

      // Reset total del catálogo
  localStorage.removeItem("catalogo_busqueda");
  localStorage.removeItem("catalogo_genero");
  localStorage.removeItem("catalogo_formato");
  localStorage.removeItem("catalogo_director");
  localStorage.removeItem("catalogo_año");
  localStorage.removeItem("catalogo_orden");
  localStorage.removeItem("catalogo_vista");

  sessionStorage.removeItem("catalogo_saga");

    
    window.location.href = "index.html";
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    inputBusqueda.value = "";
    filtroGenero.value = "";
    filtroFormato.value = "";
    filtroDirector.value = "";
    filtroAño.value = "";
    ordenarPor.value = "";

    localStorage.removeItem("catalogo_busqueda");
    localStorage.removeItem("catalogo_genero");
    localStorage.removeItem("catalogo_formato");
    localStorage.removeItem("catalogo_director");
    localStorage.removeItem("catalogo_año");
    localStorage.removeItem("catalogo_orden");
    localStorage.removeItem("catalogo_vista");

    sessionStorage.removeItem("catalogo_saga");

    peliculasFiltradas = [...peliculas];
    renderizarCatalogo();
  });

  // ============================================================
  // INICIO
  // ============================================================

  cargarPeliculas();

});
