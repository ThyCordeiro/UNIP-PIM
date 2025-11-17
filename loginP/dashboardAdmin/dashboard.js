
// Import firebase//

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDocs, getDoc, collection, updateDoc, setDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// Config firebase

const firebaseConfig = {
  apiKey: "AIzaSyAZmgg-f8qCRNKuS3gcDY3doWfQuvpspFg",
  authDomain: "agoravai-566cc.firebaseapp.com",
  projectId: "agoravai-566cc",
  storageBucket: "agoravai-566cc.appspot.com",
  messagingSenderId: "1069921242357",
  appId: "1:1069921242357:web:1f54c5037f4c8c551409bc",
  measurementId: "G-78CWHP9PQK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);




// Trocar entre abas

window.mostrarSecao = function (tipo) {
  document.querySelectorAll(".secao").forEach(s => s.classList.remove("ativa"));
  document.getElementById(`secao-${tipo}`).classList.add("ativa");
};



// Alunos

async function carregarAlunos() {
  const tbody = document.getElementById("alunosTable");
  tbody.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "usuarios"));
  querySnapshot.forEach((docSnap) => {
    const aluno = docSnap.data();
    const uid = docSnap.id;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${aluno.nome || "Sem nome"}</td>
      <td>${aluno.email}</td>
      <td>
        ${(aluno.aulas || []).map((aula, index) => `
          <div>
            <b>${aula.materia}</b> (${aula.sala} - ${aula.horario})<br>
            Nota: <input type="number" id="nota-${uid}-${index}" value="${aula.nota || 0}" min="0" max="10">
            Faltas: <input type="number" id="faltas-${uid}-${index}" value="${aula.faltas || 0}" min="0">
          </div>
        `).join("<hr>")}
      </td>
      <td><button onclick="salvarAluno('${uid}')">Salvar</button></td>
    `;
    tbody.appendChild(tr);
  });
}


window.salvarAluno = async function (uid) {
  const alunoRef = doc(db, "usuarios", uid);
  const alunoSnap = await getDoc(alunoRef);
  if (!alunoSnap.exists()) return;

  const aluno = alunoSnap.data();
  const aulasAtualizadas = (aluno.aulas || []).map((aula, index) => ({
    ...aula,
    nota: Number(document.getElementById(`nota-${uid}-${index}`).value),
    faltas: Number(document.getElementById(`faltas-${uid}-${index}`).value)
  }));

  await updateDoc(alunoRef, { aulas: aulasAtualizadas });

  alert("Dados do aluno atualizados!");
  Window.location.reload();
};


// Aulas

async function carregarAulas() {
  const tbody = document.getElementById("aulasTable");
  tbody.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "materias"));
  querySnapshot.forEach((docSnap) => {
    const materia = docSnap.data();
    const id = docSnap.id;

    const tr = document.createElement("tr");
    tr.innerHTML = ` 
      <td>${materia.nome}</td>
      <td><button onclick="materia('${id}')">Editar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

let aulaAtualId = null;


// Editar aulas

window.materia = async function (id) {
  aulaAtualId = id;
  const docRef = doc(db, "materias", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return alert("Aula não encontrada!");

  const materia = docSnap.data();
  document.getElementById("editNome").value = materia.nome || "";
  document.getElementById("editHorario").value = materia.horario || "";
  document.getElementById("editSala").value = materia.sala || "";

  // Carregar alunos já matriculados na aula
  await carregarAlunosDaAula(materia.alunos || []);

  // Carregar opções de alunos que ainda não estão na aula
  await carregarSelectAlunos(materia.alunos || []);

  mostrarSecao("editar-aula");
};

// Mostrar alunos já matriculados
async function carregarAlunosDaAula(listaUids) {
  const tbody = document.getElementById("alunosDaAula");
  tbody.innerHTML = "";

  for (const uid of listaUids) {
    const alunoDoc = await getDoc(doc(db, "usuarios", uid));
    if (alunoDoc.exists()) {
      const aluno = alunoDoc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${aluno.nome}</td>
        <td>${aluno.email}</td>
        <td><button onclick="removerAlunoDaAula('${uid}')">Remover</button></td>
      `;
      tbody.appendChild(tr);
    }
  }
}

// Preencher select com alunos que ainda não estão na aula
async function carregarSelectAlunos(listaUids) {
  const select = document.getElementById("selectAluno");
  select.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "usuarios"));
  querySnapshot.forEach((docSnap) => {
    const aluno = docSnap.data();
    const uid = docSnap.id;

    if (!listaUids.includes(uid)) {
      const option = document.createElement("option");
      option.value = uid;
      option.textContent = `${aluno.nome} - ${aluno.email}`;
      select.appendChild(option);
    }
  });
}

// Adicionar aluno na aula
window.adicionarAlunoNaAula = async function () {
  const uid = document.getElementById("selectAluno").value;
  if (!uid) return;

  const aulaRef = doc(db, "materias", aulaAtualId);
  const aulaDoc = await getDoc(aulaRef);
  if (!aulaDoc.exists()) return;

  const sala = document.getElementById("editSala").value;
  const nomeMateria = document.getElementById("editNome").value;
  const horario = document.getElementById("editHorario").value;

  await updateDoc(aulaRef, { alunos: arrayUnion(uid) });

  const alunoRef = doc(db, "usuarios", uid);
  const alunoSnap = await getDoc(alunoRef);
  const alunoData = alunoSnap.exists() ? alunoSnap.data() : {};
  const aulasAtuais = alunoData.aulas || [];

  aulasAtuais.push({ materia: nomeMateria, sala, horario, nota: 0, faltas: 0 });
  await updateDoc(alunoRef, { aulas: aulasAtuais });

  alert("Aluno adicionado!");
  materia(aulaAtualId);
};


// Remover aluno da aula
window.removerAlunoDaAula = async function (uid) {
  const aulaRef = doc(db, "materias", aulaAtualId);
  await updateDoc(aulaRef, { alunos: arrayRemove(uid) });

  const alunoRef = doc(db, "usuarios", uid);
  const alunoSnap = await getDoc(alunoRef);
  if (alunoSnap.exists()) {
    const alunoData = alunoSnap.data();
    const aulasAtualizadas = (alunoData.aulas || []).filter(a => a.materia !== document.getElementById("editNome").value);
    await updateDoc(alunoRef, { aulas: aulasAtualizadas });
  }

  alert("Aluno removido!");
  materia(aulaAtualId);
};

document.getElementById("formEditarAula").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!aulaAtualId) return;

  const nomeMateria = document.getElementById("editNome").value;
  const horario = document.getElementById("editHorario").value;
  const sala = document.getElementById("editSala").value;

  const aulaRef = doc(db, "materias", aulaAtualId);
  const aulaDoc = await getDoc(aulaRef);
  if (!aulaDoc.exists()) return alert("Aula não encontrada!");

  const materia = aulaDoc.data();
  const alunosDaAula = materia.alunos || [];

  // Atualizar a aula
  await updateDoc(aulaRef, { horario, sala });

  // Atualizar cada aluno com várias aulas
  for (const uid of alunosDaAula) {
    const alunoRef = doc(db, "usuarios", uid);
    const alunoDoc = await getDoc(alunoRef);
    if (!alunoDoc.exists()) continue;

    const alunoData = alunoDoc.data();
    const aulasAtuais = alunoData.aulas || [];

    // Verificar se a aula já existe, se não, adicionar
    const index = aulasAtuais.findIndex(a => a.materia === nomeMateria);
    if (index >= 0) {
      // Atualizar aula existente
      aulasAtuais[index] = { materia: nomeMateria, sala, horario };
    } else {
      // Adicionar nova aula
      aulasAtuais.push({ materia: nomeMateria, sala, horario });
    }

    await updateDoc(alunoRef, { aulas: aulasAtuais });
  }

  alert("Aula e alunos atualizados com múltiplas aulas!");
  carregarAulas();
  mostrarSecao("aulas");
});



// Inicio das aulas

window.salvarInicioGlobal = async function () {
  const inicio = document.getElementById("inicioGlobal").value;
  if (!inicio) {
    alert("Defina uma data válida!");
    return;
  }

  await setDoc(doc(db, "config", "aulas"), {
    inicioAulas: inicio
  });

  const querySnapshot = await getDocs(collection(db, "usuarios"));
  for (const docSnap of querySnapshot.docs) {
    await updateDoc(doc(db, "usuarios", docSnap.id), {
      inicioAulas: inicio
    });
  }

  alert("Início das aulas atualizado para todos os alunos!");
};


// Professores

document.getElementById("formAddProfessor").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("profNome").value;
  const email = document.getElementById("profEmail").value;
  const senha = document.getElementById("profSenha").value;

  try {
    await setDoc(doc(db, "professores", email), {
      nome,
      email,
      senha,
      criadoEm: new Date().toISOString()
    });

    alert("Professor cadastrado!");
    carregarProfessores();
    e.target.reset();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

async function carregarProfessores() {
  const tbody = document.getElementById("professoresTable");
  tbody.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "professores"));
  querySnapshot.forEach((docSnap) => {
    const prof = docSnap.data();
    const id = docSnap.id;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prof.nome}</td>
      <td>${prof.email}</td>
      <td><button onclick="removerProfessor('${id}')">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });
}

window.removerProfessor = async function (email) {
  if (confirm("Deseja remover este professor?")) {
    await deleteDoc(doc(db, "professores", email));
    alert("Professor removido!");
    carregarProfessores();
  }
};


// Carregar abrir

carregarAlunos();
carregarProfessores();
carregarAulas();
