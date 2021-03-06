// DOM elements
const form = document.getElementById("form");
const search = document.getElementById("search");
const result = document.getElementById("searchResult");
const more = document.getElementById("more");
const loading = document.getElementById("loader");

const apiURL = "https://api.lyrics.ovh";

// Search song or artist
async function searchSongs(term) {
    // Remove list of songs and add loader
    result.innerHTML = `<div class="loader show" id="loader"><div></div><div></div><div></div><div></div></div>`;
    more.innerHTML = "";

    const res = await fetch(`${apiURL}/suggest/${term}`);
    const data = await res.json();

    showData(data);
}

// Show song and artist in DOM
function showData(data) {
    result.innerHTML = `
        <ul class="songs">
            ${data.data
                .map(
                    (song) =>
                        `
                <li>
                    <div class="container-song">
                        <div class="song-details">
                            <img src=${song.artist.picture_medium} />
                            <span><strong>${song.artist.name}</strong> - ${song.title}</span>
                        </div>
                        <div class="song-audio">
                            <audio controls><source src=${song.preview} type="audio/mp3">Song</audio> 
                            <button class="btn" 
                                data-artist="${song.artist.name}" data-songtitle="${song.title}"
                                data-picture-medium="${song.artist.picture_medium}"
                                >
                                Get Lyrics</button>
                        </div>                           
                    </div>
                </li>
                `
                )
                .join("")}
        </ul>
        `;

    if (data.prev || data.next) {
        more.innerHTML = `
                ${
                    data.prev
                        ? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>`
                        : ""
                }
                ${
                    data.next
                        ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>`
                        : ""
                }
            `;
    } else {
        more.innerHTML = "";
    }
}

// Get more songs prev and next using Heroku
async function getMoreSongs(url) {
    const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
    const data = await res.json();

    showData(data);
}

// Get lyrics for song
async function getLyrics(artist, songTitle, pictureMedium) {
    // Remove list of songs and add loader
    result.innerHTML = `<div class="loader show" id="loader"><div></div><div></div><div></div><div></div></div>`;
    more.innerHTML = "";
    // Fetch the lyrics

    const controller = new AbortController();
    const id = setTimeout(() => {
        result.innerHTML = `<h3 class="centered">Request took too long.</h3>`;
        controller.abort();
    }, 5000);
    const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`, {
        signal: controller.signal,
    });
    clearTimeout(id);

    if (res.ok) {
        const data = await res.json();
        const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
        result.innerHTML = `
                    <div class="lyrics-container">
                        <div class="artist">
                            <img src=${pictureMedium} />
                            <h2><strong>${artist}</strong></h2>
                        </div>
                        <div class="lyrics">
                            <h2><strong>${artist}</strong> - ${songTitle}</h2>
                            <span>${lyrics}</span>
                        <div>
                    </div>
                    `;
    } else if (res.status == 404) {
        result.innerHTML = `<h3 class="centered">Sorry, we don't have this one!</h3>`;
    } else {
        result.innerHTML = `<h3 class="centered">Something went wrong :(</h3>`;
    }
}

// Event listeners

// Search song by artist or name
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const searchTerm = search.value.trim();

    if (!searchTerm) {
        alert("Please type in a search term");
    } else {
        searchSongs(searchTerm);
    }
    // Clear search text
    search.value = "";
});

// Get lyrics button click
result.addEventListener("click", (e) => {
    const clickedEl = e.target;

    if (clickedEl.tagName === "BUTTON") {
        const artist = clickedEl.getAttribute("data-artist");
        const songTitle = clickedEl.getAttribute("data-songtitle");
        const pictureMedium = clickedEl.getAttribute("data-picture-medium");

        getLyrics(artist, songTitle, pictureMedium);
    }
});
