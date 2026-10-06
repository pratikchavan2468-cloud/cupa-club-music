const WORKER_URL =
    "https://cupa-club-radio.pratikchavan2468.workers.dev";


// ---------------------------------
// SESSION
// ---------------------------------

const params =
    new URLSearchParams(
        window.location.search
    );

const sessionToken =
    params.get("session");


// ---------------------------------
// ELEMENTS
// ---------------------------------

const searchInput =
    document.getElementById(
        "search-input"
    );

const searchButton =
    document.getElementById(
        "search-button"
    );

const results =
    document.getElementById(
        "results"
    );


// ---------------------------------
// MESSAGE
// ---------------------------------

function showMessage(message) {

    results.innerHTML = `
        <div class="message">
            ${escapeHTML(message)}
        </div>
    `;

}


// ---------------------------------
// ESCAPE HTML
// ---------------------------------

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ---------------------------------
// VALIDATE QR SESSION
// ---------------------------------

async function validateSession() {

    if (!sessionToken) {

        showMessage(
            "Please scan the Cupa Club QR code first."
        );

        searchButton.disabled = true;
        searchInput.disabled = true;

        return false;

    }


    try {

        const response =
            await fetch(
                `${WORKER_URL}/qr/validate?token=${encodeURIComponent(
                    sessionToken
                )}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.valid
        ) {

            showMessage(
                "This QR session has expired. Please scan the new Cupa Club QR."
            );

            searchButton.disabled = true;
            searchInput.disabled = true;

            return false;

        }


        return true;


    } catch (error) {

        console.error(error);

        showMessage(
            "Couldn't connect to Cupa Club. Please try again."
        );

        return false;

    }

}


// ---------------------------------
// SEARCH SONGS
// ---------------------------------

async function searchSongs() {

    const query =
        searchInput.value.trim();


    if (!query) {

        showMessage(
            "Type a song name first."
        );

        return;

    }


    const sessionValid =
        await validateSession();


    if (!sessionValid) {
        return;
    }


    searchButton.disabled = true;


    showMessage(
        "Searching..."
    );


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
                "Search failed."
            );

        }


        if (
            !data.items ||
            data.items.length === 0
        ) {

            showMessage(
                "Couldn't find that song. Try another search."
            );

            searchButton.disabled = false;

            return;

        }


        const song =
            data.items[0];


        results.innerHTML = `

            <div class="song-result">

                <h3>
                    ${escapeHTML(
                        song.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        song.channel || ""
                    )}
                </p>

                <button
                    id="request-button"
                    type="button"
                >
                    Request this song ☕
                </button>

            </div>

        `;


        document
            .getElementById(
                "request-button"
            )
            .addEventListener(
                "click",
                () => requestSong(song)
            );


        searchButton.disabled = false;

    } catch (error) {

        console.error(error);

        showMessage(
            "Couldn't search right now. Please try again."
        );

        searchButton.disabled = false;

    }

}


// ---------------------------------
// REQUEST SONG
// ---------------------------------

async function requestSong(song) {

    const requestButton =
        document.getElementById(
            "request-button"
        );


    if (requestButton) {
        requestButton.disabled = true;
    }


    showMessage(
        "Sending your song to Cupa Club..."
    );


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
                            song.channel,

                        sessionToken:
                            sessionToken

                    })
                }
            );


        const data =
            await response.json();


        // ---------------------------------
        // QR SESSION EXPIRED / USED
        // ---------------------------------

        if (
            response.status === 403 ||
            response.status === 410
        ) {

            showMessage(
                "This QR session has expired. Please scan the new Cupa Club QR."
            );

            searchButton.disabled = true;
            searchInput.disabled = true;

            if (requestButton) {
                requestButton.disabled = true;
            }

            return;

        }


        // ---------------------------------
        // QUEUE FULL
        // ---------------------------------

        if (
            response.status === 429
        ) {

            showMessage(
                "We're full right now ☕ Please wait for a spot to open."
            );

            if (requestButton) {
                requestButton.disabled = false;
            }

            return;

        }


        // ---------------------------------
        // OTHER ERROR
        // ---------------------------------

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Request failed."
            );

        }


        // ---------------------------------
        // SUCCESS
        // ---------------------------------

        showMessage(
            "Your song is in the queue! 🎧"
        );


        /*
         * One QR session = one request.
         */

        searchButton.disabled = true;
        searchInput.disabled = true;

        if (requestButton) {
            requestButton.disabled = true;
        }


    } catch (error) {

        console.error(error);

        showMessage(
            "Couldn't send request. Please try again."
        );

        if (requestButton) {
            requestButton.disabled = false;
        }

    }

}


// ---------------------------------
// SEARCH BUTTON
// ---------------------------------

searchButton.addEventListener(
    "click",
    searchSongs
);


// ---------------------------------
// ENTER KEY
// ---------------------------------

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


// ---------------------------------
// START
// ---------------------------------

validateSession();
