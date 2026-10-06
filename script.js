const WORKER_URL =
  "https://cupa-club-radio.pratikchavan2468.workers.dev";

const searchInput =
  document.getElementById("search-input");

const searchButton =
  document.getElementById("search-button");

const resultsContainer =
  document.getElementById("results");

const playerContainer =
  document.getElementById("player-container");


async function searchSongs() {

  const query =
    searchInput.value.trim();

  if (!query) {
    return;
  }

  resultsContainer.innerHTML =
    "<p>Finding the best match... 🎧</p>";

  try {

    const response =
      await fetch(
        `${WORKER_URL}/search?q=${encodeURIComponent(
          query
        )}`
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Search failed"
      );

    }

    displayBestResult(
      data.results || []
    );

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

  const song =
    results[0];

  resultsContainer.innerHTML =
    "";

  const card =
    document.createElement("div");

  card.className =
    "song-card";

  card.innerHTML = `
    <div class="song-info">
      <h3>${escapeHTML(
        song.title
      )}</h3>

      <p>${escapeHTML(
        song.channel
      )}</p>
    </div>

    <button class="request-button">
      Request Song
    </button>
  `;


  const requestButton =
    card.querySelector(
      ".request-button"
    );


  requestButton.addEventListener(
    "click",
    () => {

      requestSong(
        song,
        requestButton
      );

    }
  );


  resultsContainer.appendChild(
    card
  );

}


async function requestSong(
  song,
  button
) {

  button.disabled =
    true;

  button.textContent =
    "Sending...";


  try {

    const response =
      await fetch(
        `${WORKER_URL}/request`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            videoId:
              song.videoId,

            title:
              song.title,

            channel:
              song.channel

          })

        }
      );


    const data =
      await response.json();


    /*
     * QUEUE FULL
     */

    if (
      response.status === 429
    ) {

      resultsContainer.innerHTML = `
        <div class="request-success">

          <h3>
            Current queue is full ☕
          </h3>

          <p>
            We've already got 5 songs lined up.
          </p>

          <small>
            Thanks for understanding. Try again
            in a little while. 🎧
          </small>

        </div>
      `;

      return;

    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Could not request song"
      );

    }


    /*
     * SUCCESS
     */

    const position =
      data.queuePosition;


    resultsContainer.innerHTML = `
      <div class="request-success">

        <h3>
          Song requested! 🎧
        </h3>

        <p>
          ${escapeHTML(
            song.title
          )}
        </p>

        <small>
          You're #${position} in the queue.
        </small>

      </div>
    `;


    /*
     * Customer phone never plays
     * the song.
     */

    playerContainer.innerHTML =
      "";


  } catch (error) {

    console.error(error);

    button.disabled =
      false;

    button.textContent =
      "Request Song";


    resultsContainer.innerHTML = `
      <div class="request-success">

        <h3>
          Couldn't send request
        </h3>

        <p>
          Please try again in a moment.
        </p>

      </div>
    `;

  }

}


function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

  return div.innerHTML;

}


searchButton.addEventListener(
  "click",
  searchSongs
);


searchInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter"
    ) {

      searchSongs();

    }

  }
);
