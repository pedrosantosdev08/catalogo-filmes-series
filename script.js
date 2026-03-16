const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MjQ2Y2VkZWMzYjgyMWI5ZmE1NmEyN2M4OTI2MGZhNyIsIm5iZiI6MTc3MzM0MjA5Mi44MTc5OTk4LCJzdWIiOiI2OWIzMGQ4Y2M1YjViMjQyNTI5ZDYyMzUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Jw4RlP8eAxrpjKMYw8h5r3bIpGQU2kJHl990F2OgL_I",
  },
};

const btn = document.querySelector("#btn-menu");
const menuBar = document.getElementById("menu-bar");

const icone = btn.querySelector("i");

btn.addEventListener("click", () => {
  menuBar.classList.toggle("show");

  if (icone.classList.contains("fa-bars")) {
    icone.classList.replace("fa-bars", "fa-xmark");
  } else {
    icone.classList.replace("fa-xmark", "fa-bars");
  }
});

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
  const url = `https://api.themoviedb.org/3/${type}/${id}?language=pt-BR&append_to_response=watch/providers`;

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const modalBody = document.querySelector("#modal-body");

    // Lógica dos Provedores (Streamings)
    const providers = data["watch/providers"]?.results?.BR?.flatrate;
    let providersHtml = "";

    if (providers && providers.length > 0) {
      providersHtml = `
        <div class="providers-container">
          <p><strong>Disponível em:</strong></p>
          <div class="providers-list">
            ${providers.map(p => `
              <div class="provider-badge">
                <img src="https://image.tmdb.org/t/p/w154${p.logo_path}" 
                     title="${p.provider_name}" 
                     alt="${p.provider_name}">
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // Conteúdo Principal
    let htmlContent = `
        <div class="modal-header">
            <img class="modal-poster" src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title || data.name}">
            <div class="modal-info">
                <h2>${data.title || data.name}</h2>
                <p class="overview"><strong>Sinopse:</strong> ${data.overview || "Sem sinopse disponível."}</p>
                <div class="meta-info">
                  <span><strong>Duração:</strong> ${data.runtime || (data.episode_run_time ? data.episode_run_time[0] : "--")} min</span>
                  <span><strong>Nota:</strong> ⭐ ${data.vote_average.toFixed(1)}</span>
                </div>
                ${providersHtml} 
            </div>
        </div>
    `;

    // Lógica das Temporadas
    if (type === "tv" && data.seasons) {
      htmlContent += `
        <div class="seasons-section">
          <h3>Temporadas</h3>
          <div class="seasons-grid">
            ${data.seasons
              .filter(s => s.season_number > 0)
              .map(season => `
                <div class="season-card">
                   <span class="season-name">${season.name}</span>
                   <span class="season-count">${season.episode_count} episódios</span>
                </div>
              `).join("")}
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = htmlContent;
    document.querySelector("#modal-overlay").style.display = "flex";
  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
  }
}

function closeModal() {
  document.querySelector("#modal-overlay").style.display = "none";
}

document.querySelectorAll("#nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const type = e.currentTarget.getAttribute("data-type");
    document.querySelector(".search-box input").value = "";
    loadContent(type);
  });
});

document.querySelector(".search-box input").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchMedia(e.target.value), 300);
});

loadContent("movie");
