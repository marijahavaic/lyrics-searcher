// DOM elements
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');
const loading = document.getElementById('loader');


const apiURL = 'https://api.lyrics.ovh';

// Search song or artist
async function searchSongs(term) {
    const res = await fetch(`${apiURL}/suggest/${term}`);
    const data = await res.json();

    showData(data);
}

// Show song and artist in DOM
function showData(data) {
    loading.classList.add('show');

    // Show loader
    setTimeout(() => {
        loading.classList.remove('show');

        result.innerHTML = `
        <ul class="songs">
            ${data.data.map(song => 
                `
                <li>
                    <div class="container-song">
                        <div class="song-details">
                            <img src=${song.artist.picture_medium} />
                            <span><strong>${song.artist.name}</strong> - ${song.title}</span>
                        </div>
                        <div class="song-audio">
                            <audio controls><source src=${song.preview} type="audio/mp3">Song</audio> 
                            <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
                        </div>                           
                    </div>
                </li>
                `)
                .join('')
        }
        </ul>
        `;

     
        if(data.prev || data.next) {
            more.innerHTML = `
                ${data.prev ? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>` : ''}
                ${data.next ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>` : ''}
            `;
        } else {
            more.innerHTML = '';
        }
    }, 1000)

}


// Get more songs prev and next using Heroku
async function getMoreSongs(url) {
    const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
    const data = await res.json();
  
    showData(data);
  }

// Get lyrics for song
async function getLyrics(artist, songTitle) {

    try {
        const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
        const data = await res.json();
        const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

        result.innerHTML = `
        <div class="get-lyrics">
            <div class="lyrics">
                <h2><strong>${artist}</strong> - ${songTitle}</h2>
                <span>${lyrics}</span>
            <div>
        </div>
        `;
    
        more.innerHTML = '';
    }
    catch (err) {
        console.error(err);
        result.innerHTML = `<h3 class="centered">Sorry, we don't have this one!</h3>`;
        more.innerHTML = '';
    } 
}


// Event listeners

    // Search song by artist or name
    form.addEventListener('submit', e => {
        e.preventDefault();

        const searchTerm = search.value.trim();

        if(!searchTerm) {
            alert ('Please type in a search term');
        } else {
        searchSongs(searchTerm);
        }
    });

    // Get lyrics button click
    result.addEventListener('click', e => {
        const clickedEl = e.target;

        if(clickedEl.tagName === 'BUTTON') {
            const artist = clickedEl.getAttribute('data-artist');
            const songTitle = clickedEl.getAttribute('data-songtitle');

         
                getLyrics(artist, songTitle);
            

        }
    })