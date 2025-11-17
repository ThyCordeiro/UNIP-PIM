const form = document.getElementById("formVideo");
const lista = document.getElementById("listaVideos");

// Carrega vídeos do localStorage ao abrir a página
const videos = JSON.parse(localStorage.getItem("videos")) || [];
renderizarVideos();

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const url = document.getElementById("url").value;

  // Extrai o ID do vídeo do YouTube
  const videoID = extrairVideoID(url);
  if (!videoID) {
    alert("URL inválida do YouTube!");
    return;
  }

  const video = { titulo, videoID };
  videos.push(video);
  localStorage.setItem("videos", JSON.stringify(videos));
  renderizarVideos();
  form.reset();
});

function extrairVideoID(url) {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function renderizarVideos() {
  lista.innerHTML = "";
  videos.forEach(video => {
    const container = document.createElement("div");

    const tituloEl = document.createElement("h3");
    tituloEl.textContent = video.titulo;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${video.videoID}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    container.appendChild(tituloEl);
    container.appendChild(iframe);
    lista.appendChild(container);
  });
}
function renderizarVideos() {
  lista.innerHTML = "";
  videos.forEach((video, index) => {
    const container = document.createElement("div");

    const tituloEl = document.createElement("h3");
    tituloEl.textContent = video.titulo;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${video.videoID}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.style.marginTop = "10px";
    botaoRemover.addEventListener("click", () => {
      videos.splice(index, 1); // remove 1 item na posição "index"
      localStorage.setItem("videos", JSON.stringify(videos));
      renderizarVideos();
    });

    container.appendChild(tituloEl);
    container.appendChild(iframe);
    container.appendChild(botaoRemover);
    lista.appendChild(container);
  });
}
