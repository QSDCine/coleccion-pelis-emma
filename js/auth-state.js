import { getAuth, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// Detectar si hay usuario logueado
onAuthStateChanged(auth, user => {
  if (user) {
    // Usuario autenticado → activar modo admin
    document.body.classList.add("admin");
  } else {
    // Usuario NO autenticado → modo normal
    document.body.classList.remove("admin");
  }
});
