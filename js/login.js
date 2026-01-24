import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2500);
}

const auth = getAuth();

// LOGIN
document.getElementById("btn-login").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      mostrarToast("Login realizado");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);
    })
    .catch(err => {
      mostrarToast("Error: login no realizado");
    });
});

// LOGOUT
document.getElementById("btn-logout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// CAMBIO DE ESTADO
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("btn-login").classList.add("oculto");
    document.getElementById("btn-logout").classList.remove("oculto");
    document.body.classList.add("admin");
  } else {
    document.getElementById("btn-login").classList.remove("oculto");
    document.getElementById("btn-logout").classList.add("oculto");
    document.body.classList.remove("admin");
  }
});
