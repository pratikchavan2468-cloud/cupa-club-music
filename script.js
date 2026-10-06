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

  resultsContainer.innerHTML =
    "<p>Finding the best match... 🎧</p>";

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

  // Use YouTube's top search result.
  const song = results[0];

  resultsContainer.innerHTML = "";

  const card = document.createElement("div");

  card.className = "song-card";

  card.innerHTML = `
    <div class="song-info">
      <h3>${escapeHTML(song.title)}</h3>
      <p>${escapeHTML(song.channel)}</p>
    </div>

    <button class="request-button">
      Request Song
    </button>
  `;

  const requestButton =
    card.querySelector(".request-button");

  requestButton.addEventListener("click", () => {
    requestSong(song, requestButton);
  });

  resultsContainer.appendChild(card);
}

async function requestSong(song, button) {
  button.disabled = true;
  button.textContent = "Sending...";

  try {
    const response = await fetch(
      `${WORKER_URL}/request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          videoId: song.videoId,
          title: song.title,
          channel: song.channel
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not request song"
      );
    }

    resultsContainer.innerHTML = `
      <div class="request-success">
        <h3>Song requested! 🎧</h3>
        <p>${escapeHTML(song.title)}</p>
        <small>
          Your song has been sent to Cupa Club Radio.
        </small>
      </div>
    `;

    // Customer phone does NOT play the song.
    playerContainer.innerHTML = "";

  } catch (error) {
    console.error(error);

    button.disabled = false;
    button.textContent = "Request Song";

    alert(
      "Couldn't send the request. Please try again."
    );
  }
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
