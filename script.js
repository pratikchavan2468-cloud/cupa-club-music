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

  resultsContainer.innerHTML = "<p>Searching... 🎧</p>";

  try {
    const response = await fetch(
      `${WORKER_URL}/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Search failed");
    }

    displayResults(data.results || []);
  } catch (error) {
    console.error(error);
    resultsContainer.innerHTML =
      "<p>Something went wrong. Please try again.</p>";
  }
}

function displayResults(results) {
  if (!results.length) {
    resultsContainer.innerHTML =
      "<p>No songs found. Try another search.</p>";
    return;
  }

  resultsContainer.innerHTML = "";

  results.forEach((song) => {
    const card = document.createElement("button");

    card.className = "song-card";

    card.innerHTML = `
      <img src="${song.thumbnail}" alt="">
      <div class="song-info">
        <h3>${escapeHTML(song.title)}</h3>
        <p>${escapeHTML(song.channel)}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      playSong(song.videoId);
    });

    resultsContainer.appendChild(card);
  });
}

function playSong(videoId) {
  playerContainer.innerHTML = `
    <iframe
      width="100%"
      height="315"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
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
