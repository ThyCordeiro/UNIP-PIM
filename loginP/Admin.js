import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAZmgg-f8qCRNKuS3gcDY3doWfQuvpspFg",
  authDomain: "agorvai-566cc.firebaseapp.com",
  projectId: "agoravai-566cc",
  storageBucket: "agorvai-566cc.appspot.com",
  messagingSenderId: "1069921242357",
  appId: "1:1069921242357:web:1f54c5037f4c8c551409bc",
  measurementId: "G-78CWHP9PQK",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === LOGIN PROFESSOR ===
document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("Aloginemail").value.trim();
  const password = document.getElementById("Aloginsenha").value;

  try {
    // 🔹 Pega o doc do professor (use o email como ID do doc, sem espaços)
    const profDoc = await getDoc(doc(db, "professores", email));
    if (email == "thyagodanielc@gmail.com") {
      if (password == "123123") {
        alert(`Bem-vindo, Admin`);
        // Pode salvar no localStorage para usar depois
        window.location.href = "dashboardAdmin/dashboard.html";
      } else {
        alert(`senha incorreta!`);
      }
    } else {
      if (!profDoc.exists()) {
        alert("Esse e-mail não está cadastrado como professor!");
        return;
      }

      const data = profDoc.data();

      // 🔹 Valida senha
      if (data.senha === password) {
        alert(`Bem-vindo, ${data.nome}!`);
        // Pode salvar no localStorage para usar depois
        localStorage.setItem("professorEmail", email);
        window.location.href = "dashboardProfessor/dashboard.html";
      } else {
        alert("Senha incorreta!");
      }
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao tentar logar.");
  }
});
