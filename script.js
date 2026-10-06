const WORKER_URL =
  "https://cupa-club-radio.pratikchavan2468.workers.dev";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");
const playerContainer = document.getElementById("player-container");

async function searchSongs() {
  const query = searchInput.value.trim();

  if (!query) {
    return;
  }

  resultsContainer.innerHTML = "<p>Finding the best match... 🎧</p>";

  try {
    const response = await fetch(
      `${WORKER_URL}/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Search failed");
    }

    displayBestResult(data.results || []);
  } catch (error) {
    console.error(error);

    resultsContainer.innerHTML =
      "<p>Something went wrong. Please try again.</p>";
  }
}

function displayBestResult(results) {
  if (!results.length) {
    resultsContainer.innerHTML =
      "<p>No song found. Try another search.</p>";
    return;
  }

  // For now, use YouTube's top search result.
  const song = results[0];

  resultsContainer.innerHTML = "";

  const card = document.createElement("button");

  card.className = "song-card";

  card.innerHTML = `
    <div class="song-info">
      <h3>${escapeHTML(song.title)}</h3>
      <p>${escapeHTML(song.channel)}</p>
    </div>
    <span class="play-icon">▶</span>
  `;

  card.addEventListener("click", () => {
    playSong(song.videoId);
  });

  resultsContainer.appendChild(card);
}

function playSong(videoId) {
  playerContainer.innerHTML = `
    <div class="player-wrapper">
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        title="Cupa Club Radio"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  `;

  playerContainer.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

searchButton.addEventListener("click", searchSongs);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchSongs();
  }
});
