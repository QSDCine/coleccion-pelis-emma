// Importar Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Configuración del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyAElElz0_-JssGezueOE2L4kq5DfTJZWeg",
  authDomain: "pelis-emma.firebaseapp.com",
  projectId: "pelis-emma",
  messagingSenderId: "845271010367",
  appId: "1:845271010367:web:33018bbd9bf5e84861bc8a"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);




