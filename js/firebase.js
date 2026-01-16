// Importar Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Configuración del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBUMgkaWYaM8C43cSrJATPXZwT7-iW2UWI",
  authDomain: "pelis-dan.firebaseapp.com",
  projectId: "pelis-dan",
  messagingSenderId: "816169925364",
  appId: "1:816169925364:web:d063dd8db2d44b01c83ca1"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);



