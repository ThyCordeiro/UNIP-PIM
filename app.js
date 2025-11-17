
// ===============================
// 🔹 IMPORTS DO FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===============================
// 🔹 CONFIGURAÇÃO DO FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAZmgg-f8qCRNKuS3gcDY3doWfQuvpspFg",
  authDomain: "agoravai-566cc.firebaseapp.com",
  projectId: "agoravai-566cc",
  storageBucket: "agoravai-566cc.appspot.com",
  messagingSenderId: "1069921242357",
  appId: "1:1069921242357:web:1f54c5037f4c8c551409bc",
  measurementId: "G-78CWHP9PQK"
};
// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// 🔹 CARREGAR CURSOS DO FIRESTORE
// ===============================
async function carregarCursos() {
  const selecionarCurso = document.getElementById("curso");
  selecionarCurso.innerHTML = "<option value='' disabled selected>Selecione o curso</option>";

  try {
    const querySnap = await getDocs(collection(db, "materias"));
    querySnap.forEach((docSnap) => {
      const data = docSnap.data();
      const opt = document.createElement("option");
      opt.value = data.nome;
      opt.textContent = data.nome;
      selecionarCurso.appendChild(opt);
    });
  } catch (error) {
    console.error("Erro ao carregar cursos:", error);
    selecionarCurso.innerHTML = "<option value='' disabled selected>Erro ao carregar cursos</option>";
  }
}




// ===============================
// 🔹 REGISTRAR NOVO USUÁRIO
// ===============================
document.getElementById("registerBtn").addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("senha").value;
  const nome = document.getElementById("nome").value.trim();
  const genero = document.getElementById("genero").value;
  const dataNascimento = document.getElementById("dataNascimento").value;
  const curso = document.getElementById("curso").value;


  if (!nome || !email || !password || !curso) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Conversão da data de nascimento (se válida)
    const dataConvertida = dataNascimento ? new Date(dataNascimento) : null;

    const userData = {
      email: user.email,
      nome: nome,
      genero: genero,
      curso: curso,
      createdAt: serverTimestamp()
    };

    if (dataConvertida && dataConvertida.getFullYear() >= 1900 && dataConvertida.getFullYear() <= 2025) {
      userData.dataNascimento = dataConvertida.toISOString();
    }

    // Salvar no Firestore
    await setDoc(doc(db, "usuarios", user.uid), userData);

    alert("Usuário cadastrado com sucesso!");
    document.getElementById("register").reset();

    // Redireciona já logado
    localStorage.setItem("usuarioLogado", JSON.stringify(userData));
    window.location.href = "../chat/chat.html";

  } catch (error) {
    console.error("Erro no cadastro:", error);
    alert("Erro no cadastro: " + error.message);
  }
});

// ===============================
// 🔹 LOGIN
// ===============================
document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginemail").value.trim();
  const password = document.getElementById("loginsenha").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Buscar dados do usuário no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();

      // Guardar no localStorage para usar no chat
      localStorage.setItem("usuarioLogado", JSON.stringify(data));

      alert(`Bem-vindo, ${data.nome}!`);
      window.location.href = "../chat/chat.html";
    } else {
      alert("Usuário logado, mas sem dados extras cadastrados.");
    }

    document.getElementById("login").reset();
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro no login: Usuário ou senha inválidos!");
  }
});

carregarCursos();
