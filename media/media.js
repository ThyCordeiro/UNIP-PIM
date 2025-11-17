const { addEventListener } = require("expo-linking");

function calcularMedia() {
  const p1 = parseFloat(document.getElementById("p1").value);
  const p2 = parseFloat(document.getElementById("p2").value);
  const pim = parseFloat(document.getElementById("pim").value);
  const mediaFinal = document.getElementById("mediaFinal");
  const mensagem = document.getElementById("mensagem");

  if (isNaN(p1) || isNaN(p2) || isNaN(pim)) {
    alert("Preencha todas as notas corretamente.");
    return;
  }

  const soma = (p1 * 4) + (p2 * 4) + (pim * 2);
  const media = soma / 10;

  mediaFinal.textContent = media.toFixed(2);

  if (media >= 7) {
    mensagem.textContent = "Parabéns! Você foi aprovado.";
    mensagem.className = "aprovado";
  } else {
    mensagem.textContent = "Sua média foi menor que 7. Você precisará fazer exame.";
    mensagem.className = "reprovado";
  }
}