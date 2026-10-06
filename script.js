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
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const resultArea =
    document.getElementById("result");

const messageArea =
    document.getElementById("message");


// ---------------------------------
// BASIC HELPERS
// ---------------------------------

function showMessage(message) {

    if (messageArea) {
        messageArea.textContent =
            message;
    }

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ---------------------------------
// CHECK SESSION
// ---------------------------------

async function validateSession() {

    if (!sessionToken) {

        showMessage(
            "Please scan the Cupa Club QR code first."
        );

        if (searchButton) {
            searchButton.disabled = true;
        }

        if (searchInput) {
            searchInput.disabled = true;
        }

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

            if (searchButton) {
                searchButton.disabled = true;
            }

            if (searchInput) {
                searchInput.disabled = true;
            }

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
// SEARCH
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


        resultArea.innerHTML = `

            <div class="song-result">

                <div class="song-title">
                    ${escapeHTML(
                        song.title
                    )}
                </div>

                <div class="song-channel">
                    ${escapeHTML(
                        song.channel || ""
                    )}
                </div>

                <button
                    id="requestButton"
                    type="button"
                >
                    Request this song ☕
                </button>

            </div>

        `;


        document
            .getElementById(
                "requestButton"
            )
            .addEventListener(
                "click",
                () => requestSong(song)
            );


        showMessage(
            "Found it. Ready to request?"
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
            "requestButton"
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
        // SESSION EXPIRED / USED
        // ---------------------------------

        if (
            response.status === 403 ||
            response.status === 410
        ) {

            showMessage(
                "This QR session has expired. Please scan the new Cupa Club QR."
            );

            if (searchButton) {
                searchButton.disabled = true;
            }

            if (searchInput) {
                searchInput.disabled = true;
            }

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
            `Your song is in the queue! 🎧 You're #${data.position || "next"} in line.`
        );


        /*
         * This QR session is now used.
         * Prevent another request from
         * this customer page.
         */

        if (searchButton) {
            searchButton.disabled = true;
        }

        if (searchInput) {
            searchInput.disabled = true;
        }

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
// EVENTS
// ---------------------------------

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchSongs
    );

}


if (searchInput) {

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

}


// ---------------------------------
// START
// ---------------------------------

validateSession();
