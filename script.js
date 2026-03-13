const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MjQ2Y2VkZWMzYjgyMWI5ZmE1NmEyN2M4OTI2MGZhNyIsIm5iZiI6MTc3MzM0MjA5Mi44MTc5OTk4LCJzdWIiOiI2OWIzMGQ4Y2M1YjViMjQyNTI5ZDYyMzUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Jw4RlP8eAxrpjKMYw8h5r3bIpGQU2kJHl990F2OgL_I",
  },
};

let currentType = "movie";
let searchTimeout;

async function loadContent(type = "movie") {
  currentType = type;
  const url = `https://api.themoviedb.org/3/${type}/popular?language=pt-BR`;
  const titlePage = document.querySelector(".card-container h2");
  titlePage.innerText =
    type === "movie" ? "Filmes Populares" : "Séries Populares";

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    renderGrid(data.results);
  } catch (err) {
    console.error("Erro ao carregar:", err);
  }
}

async function searchMedia(query) {
  if (query.length === 0) {
    loadContent(currentType);
    return;
  }
  if (query.length < 3) return;

  const url = `https://api.themoviedb.org/3/search/${currentType}?query=${encodeURIComponent(query)}&language=pt-BR`;

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    renderGrid(data.results);
  } catch (err) {
    console.error("Erro na busca:", err);
  }
}

function renderGrid(list) {
  const grid = document.querySelector(".movie-grid");
  const htmlCards = list
    .map((item) => {
      const title = item.title || item.name;
      const image = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=Sem+Poster";

      return `
        <article class="movie-card" onclick="loadModal(${item.id}, '${currentType}')">
            <img src="${image}" alt="${title}">
            <h3 class="tittle-movie">${title}</h3>
            <span class="desc-movie">⭐ ${item.vote_average.toFixed(1)}</span>
        </article>
    `;
    })
    .join("");

  grid.innerHTML =
    htmlCards ||
    `<p style="text-align:center; width:100%">Nenhum resultado encontrado.</p>`;
}

async function loadModal(id, type) {
  // Usamos o type para a URL ficar dinâmica (movie ou tv)
  const url = `https://api.themoviedb.org/3/${type}/${id}?language=pt-BR`;

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Em vez de .map(), pegamos os elementos do Modal e preenchemos:
    const modalBody = document.querySelector("#modal-body");

    modalBody.innerHTML = `
            <div class="modal-header">
                <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title || data.name}">
                <div class="modal-info">
                    <h2>${data.title || data.name}</h2>
                    <p><strong>Sinopse:</strong> ${data.overview}</p>
                    <p><strong>Duração:</strong> ${data.runtime || data.episode_run_time[0]} min</p>
                    <p><strong>Nota:</strong> ⭐ ${data.vote_average.toFixed(1)}</p>
                </div>
            </div>
        `;

    // Aqui você daria o comando para o modal aparecer (mudar o CSS)
    document.querySelector("#modal-overlay").style.display = "flex";
  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
  }
}

function closeModal(){
    const modalOverlay = document.querySelector(".modal-overlay");
    modalOverlay.style.display = 'none'
}

// Eventos de Clique no Menu
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const type = e.currentTarget.getAttribute("data-type");
    document.querySelector(".search-box input").value = "";
    loadContent(type);
  });
});

// Evento de Busca com Debounce
document.querySelector(".search-box input").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchMedia(e.target.value), 300);
});

// Inicialização
loadContent("movie");
