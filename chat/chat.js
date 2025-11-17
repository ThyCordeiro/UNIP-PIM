



//  Código principal do chat com iteração

//Import Firebase//

//API Firestone//
// Configuração API Firebase//

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


// CONFIGURAÇÃO DO FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyAZmgg-f8qCRNKuS3gcDY3doWfQuvpspFg",
  authDomain: "agoravai-566cc.firebaseapp.com",
  projectId: "agoravai-566cc",
  storageBucket: "agorvai-566cc.appspot.com",
  messagingSenderId: "1069921242357",
  appId: "1:1069921242357:web:1f54c5037f4c8c551409bc",
  measurementId: "G-78CWHP9PQK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userData = null;

///////
//Verifica usuário autenticado
///////
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuário logado:", user.uid);

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      userData = userDoc.data();
      console.log("Dados do Firestore:", userData);
    } else {
      console.log("Documento não encontrado!");
    }
  } else {
    console.log("Nenhum usuário logado!");
    window.location.href = "../login/index.html";
  }
});

/////////
// Chave api openai
/////////
const apiKey = "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";

//////
//Chamado api
/////
async function chamaMessage() {
  var message = document.querySelector('.mensage_input');
  var status = document.querySelector('.status');
  var btnSubmit = document.querySelector('.btn_submit');

  if (!message.value) {
    message.style.border = '1px solid red';
    return;
  }

  if (!userData) {
    alert("Usuário não carregado ainda, tente novamente.");
    return;
  }

  message.style.border = 'none';
  status.innerHTML = 'Buscando resposta...';
  btnSubmit.disabled = true;
  btnSubmit.style.cursor = 'not-allowed';
  message.disabled = true;

  const aulasInfo = (userData && userData.aulas)
    ? userData.aulas.map(a => `Matéria: ${a.materia}, Sala: ${a.sala}, Horário: ${a.horario}, Nota: ${a.nota}, Faltas: ${a.faltas}`).join(" | ")
    : "Nenhuma aula cadastrada";

  fetch("https://api.openai.com/v1/chat/completions", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é um mestrado de faculdade responda sobre o que o usuário perguntar.As informações do usuário são:
          - Nome: ${userData.nome} 
          - Email: ${userData.email} 
          - Curso: ${userData.curso} 
          - Data de Nascimento: ${userData.dataNascimento} 
          - Gênero: ${userData.genero} 
          - Aulas: ${aulasInfo}
          - Início das Aulas: ${userData?.inicioAulas || "Não informado"} `

        },
        {
          role: "user",
          content: message.value
        }
      ],
      max_tokens: 400,
      temperature: 0.7
    })
  })
    .then((response) => response.json())
    .then((response) => {
      let resposta = response.choices[0].message.content;
      mostrarHistoric(message.value, resposta);
    })
    .catch((e) => {
      console.error("Erro ao chamar a API:", e);
      status.innerHTML = 'Erro ao carregar resposta.';
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.style.cursor = 'pointer';
      message.disabled = false;
    });
}

//////
// Envio com Botao submit
/////
document.getElementById("btn_submit").addEventListener("click", chamaMessage);

/////
// Validaçao com botao Enter 
////
document.querySelector('.mensage_input').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    chamaMessage();
  }
});

///////
// Mostrar Histórico
//////

function mostrarHistoric(message, response) {
  var historic = document.querySelector('.historic');

  var boxMyMessage = document.createElement('div');
  boxMyMessage.className = 'box-my-message';

  var myMessage = document.createElement('p');
  myMessage.className = 'my-message';
  myMessage.innerText = message;
  boxMyMessage.appendChild(myMessage);

  var boxRespostaMessage = document.createElement('div');
  boxRespostaMessage.className = 'box-response-message';

  var chatResposta = document.createElement('p');
  chatResposta.className = 'chat-message';
  chatResposta.innerText = response;
  boxRespostaMessage.appendChild(chatResposta);

  historic.appendChild(boxMyMessage);
  historic.appendChild(boxRespostaMessage);

  document.querySelector('.mensage_input').value = '';
  document.querySelector('.status').innerHTML = 'Pronto!';
  historic.scrollTop = historic.scrollHeight;

  ///// Texto com audio
  const utterance = new SpeechSynthesisUtterance(response);
  utterance.lang = 'pt-BR';
  speechSynthesis.speak(utterance);
}

///////
// Botões Perguntas e respostas
//////
document.querySelectorAll('.perg_btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pergunta = btn.innerText;
    document.querySelector('.mensage_input').value = pergunta;
    chamaMessage();
  });
});

///////

//Reconhecimento Voz/

//////

const audioBtn = document.getElementById("btn_audio");
const recognition = ('webkitSpeechRecognition' in window) ? new webkitSpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  audioBtn.addEventListener("click", () => {
    recognition.start();
    document.querySelector('.status').innerText = "Ouvindo...";
  });

  recognition.onresult = function (event) {
    const textoFalado = event.results[0][0].transcript;
    document.querySelector('.mensage_input').value = textoFalado;
    chamaMessage();
  };

  recognition.onerror = function (event) {
    console.error("Erro no reconhecimento de voz:", event.error);
    document.querySelector('.status').innerText = "Erro ao ouvir.";
  };

  recognition.onend = function () {
    document.querySelector('.status').innerText = "Pronto!";
  };
} else {
  audioBtn.disabled = true;
  alert("Seu navegador não suporta reconhecimento de voz.");
}








/*


// ===============================
// 🔹 IMPORTS DO FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===============================
// 🔹 CONFIGURAÇÃO DO FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAZmgg-f8qCRNKuS3gcDY3doWfQuvpspFg",
  authDomain: "agoravai-566cc.firebaseapp.com",
  projectId: "agoravai-566cc",
  storageBucket: "agorvai-566cc.appspot.com",
  messagingSenderId: "1069921242357",
  appId: "1:1069921242357:web:1f54c5037f4c8c551409bc",
  measurementId: "G-78CWHP9PQK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userData = null; // variável global para guardar os dados do Firestore

// 🔹 Pega o usuário que está no cache do Google (se já logou antes)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuário logado:", user.uid);

    // Busca os dados dele no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      userData = userDoc.data();
      console.log("Dados do Firestore:", userData);
    } else {
      console.log("Documento não encontrado!");
    }
  } else {
    console.log("Nenhum usuário logado!");
    window.location.href = "../login/index.html"; // redireciona se não estiver logado
  }
});

const apiKey = "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"; // mantenha sua chave aqui

// ===============================
// 🔹 Função para chamar a API e responder
// ===============================
async function chamaMessage() {
  var message = document.querySelector('.mensage_input');
  var status = document.querySelector('.status');
  var btnSubmit = document.querySelector('.btn_submit');

  if (!message.value) {
    message.style.border = '1px solid red';
    return;
  }

  if (!userData) {
    alert("Usuário não carregado ainda, tente novamente.");
    return;
  }

  message.style.border = 'none';
  status.innerHTML = 'Buscando resposta...';
  btnSubmit.disabled = true;
  btnSubmit.style.cursor = 'not-allowed';
  message.disabled = true;

  fetch("https://api.openai.com/v1/chat/completions", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: ` Responda como se fosse um mestrado de faculdade sobre o que o usuário perguntar. As informações do usuário são: nota ${userData.nota}, nome: ${userData.nome}, email: ${userData.email}, faltas: ${userData.faltas}. Se perguntar sobre o início das aulas, diga que começaram no dia 2 de fevereiro de 2026, na sala 9. A apresentação do PIM será no dia 03 de novembro. A fórmula para média escolar é: (P1 * 4 + P2 * 4 + PIM * 2) / 10.`
        },
        {
          role: "user",
          content: message.value
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
  })
    .then((response) => response.json())
    .then((response) => {
      let resposta = response.choices[0].message.content;
      mostrarHistoric(message.value, resposta);
    })
    .catch((e) => {
      console.error("Erro ao chamar a API:", e);
      status.innerHTML = 'Erro ao carregar resposta.';
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.style.cursor = 'pointer';
      message.disabled = false;
    });
}

// ===============================
// 🔹 Enviar com botão
// ===============================
document.getElementById("btn_submit").addEventListener("click", chamaMessage);

// ===============================
// 🔹 Enviar com tecla Enter
// ===============================
document.querySelector('.mensage_input').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // evita quebra de linha
    chamaMessage();
  }
});

// ===============================
// 🔹 Mostrar pergunta/resposta no histórico
// ===============================
function mostrarHistoric(message, response) {
  var historic = document.querySelector('.historic');

  var boxMyMessage = document.createElement('div');
  boxMyMessage.className = 'box-my-message';

  var myMessage = document.createElement('p');
  myMessage.className = 'my-message';
  myMessage.innerText = message;
  boxMyMessage.appendChild(myMessage);

  var boxRespostaMessage = document.createElement('div');
  boxRespostaMessage.className = 'box-response-message';

  var chatResposta = document.createElement('p');
  chatResposta.className = 'chat-message';
  chatResposta.innerText = response;
  boxRespostaMessage.appendChild(chatResposta);

  historic.appendChild(boxMyMessage);
  historic.appendChild(boxRespostaMessage);

  document.querySelector('.mensage_input').value = '';
  document.querySelector('.status').innerHTML = 'Pronto!';
  historic.scrollTop = historic.scrollHeight;
}

// ===============================
// 🔹 Botões de perguntas frequentes
// ===============================
document.querySelectorAll('.perg_btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pergunta = btn.innerText;
    document.querySelector('.mensage_input').value = pergunta;
    chamaMessage();
  });
});



*/






/*
// ===============================
// 🔹 IMPORTS DO FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===============================
// 🔹 CONFIGURAÇÃO DO FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAZmgg-f8qCRNKuS3gcDY3doWfQuvpspFg",
  authDomain: "agoravai-566cc.firebaseapp.com",
  projectId: "agoravai-566cc",
  storageBucket: "agorvai-566cc.appspot.com",
  messagingSenderId: "1069921242357",
  appId: "1:1069921242357:web:1f54c5037f4c8c551409bc",
  measurementId: "G-78CWHP9PQK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userData = null; // variável global para guardar os dados do Firestore

// 🔹 Pega o usuário que está no cache do Google (se já logou antes)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuário logado:", user.uid);

    // Busca os dados dele no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      userData = userDoc.data();
      console.log("Dados do Firestore:", userData);
    } else {
      console.log("Documento não encontrado!");
    }
  } else {
    console.log("Nenhum usuário logado!");
    window.location.href = "../login/index.html"; // redireciona se não estiver logado
  }
});
const apiKey = "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"; // mantenha sua chave aqui

// ===============================
// 🔹 EVENTO DO BOTÃO DE ENVIAR MENSAGEM
// ===============================
document.getElementById("btn_submit").addEventListener("click", async () => {
  var message = document.querySelector('.mensage_input');
  var status = document.querySelector('.status');
  var btnSubmit = document.querySelector('.btn_submit');

  if (!message.value) {
    message.style.border = '1px solid red';
    return;
  }

  if (!userData) {
    alert("Usuário não carregado ainda, tente novamente.");
    return;
  }

  message.style.border = 'none';
  status.innerHTML = 'Buscando resposta...';
  btnSubmit.disabled = true;
  btnSubmit.style.cursor = 'not-allowed';
  message.disabled = true;

  fetch("https://api.openai.com/v1/chat/completions", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Se apresente como assistente agiliza facul  Responda como você fosse um mestrado de faculdade sobre o que o usuário perguntar as informações do usuário são: nota ${userData.nota}, nome:  ${userData.nome}, email: ${userData.email}, faltas: ${userData.faltas} se perguntar sobre o inicio das aulas. as aulas começaram no dia 2 de fevereiro de 2026 e a  sala 9. a apresentação do pim será no dia 03 de novembro. a formula para media escolares P1 * 4 P2 * 4 Pim * 2 dividido por 10`
        },
        {
          role: "user",
          content: message.value
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
  })
    .then((response) => response.json())
    .then((response) => {
      let resposta = response.choices[0].message.content;
      mostrarHistoric(message.value, resposta);
    })
    .catch((e) => {
      console.error("Erro ao chamar a API:", e);
      status.innerHTML = 'Erro ao carregar resposta.';
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.style.cursor = 'pointer';
      message.disabled = false;
    });
});



function mostrarHistoric(message, response) {
  var historic = document.querySelector('.historic');

  var boxMyMessage = document.createElement('div');
  boxMyMessage.className = 'box-my-message';

  var myMessage = document.createElement('p');
  myMessage.className = 'my-message';

  myMessage.innerText = message;
  boxMyMessage.appendChild(myMessage);

  var boxRespostaMessage = document.createElement('div');
  boxRespostaMessage.className = 'box-response-message';

  var chatResposta = document.createElement('p');
  chatResposta.className = 'chat-message';
  chatResposta.innerText = response;
  boxRespostaMessage.appendChild(chatResposta);

  historic.appendChild(boxMyMessage);
  historic.appendChild(boxRespostaMessage);

  document.querySelector('.mensage_input').value = '';
  document.querySelector('.status').innerHTML = 'Pronto!';
  historic.scrollTop = historic.scrollHeight;
}

document.querySelector('.mensage_input').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {

  }
});

// Lidar com cliques nos botões de perguntas frequentes
document.querySelectorAll('.perg_btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pergunta = btn.innerText;
    document.querySelector('.mensage_input').value = pergunta;
    chamaMessage(); // envia direto a pergunta para o assistente
  });
});
// perguntas e respostas
*/

//`Você é um mestrado de faculdade responda sobre o que o usuário perguntar. As informações do usuário são: nota ${userData.nota}, nome: ${userData.nome}, email: ${userData.email}, faltas: ${userData.faltas}. Se perguntar sobre o início das aulas, diga que começaram no dia 2 de fevereiro de 2026, na sala 9. A apresentação do PIM será no dia 20 de outubro. A fórmula para média escolar é: (P1 * 4 + P2 * 4 + PIM * 2) / 10.`