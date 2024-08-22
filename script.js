document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cards');
    const sidebar = document.getElementById('sidebar');
    const closeButton = document.getElementById('closeSidebar');
    const songsList = document.querySelector('.songs-list');
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('play'); 
    const songInfo = document.querySelector('.songinfo');
    const songTime = document.querySelector('.songtime'); 

    let currentsong = new Audio();

    cards.forEach(card => {
        card.addEventListener('click', async () => {
            const artistId = card.getAttribute('data-artist-id');
            const songs = await fetchSongs(artistId);
            displaySongs(songs);
            sidebar.classList.add('show');
        });
    });

    closeButton.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    const fetchSongs = async (artistId) => {
        try {
            let response = await fetch(`http://127.0.0.1:5500/./artists/./${artistId}`);
            let textResponse = await response.text();

            let div = document.createElement('div');
            div.innerHTML = textResponse;

            let as = div.getElementsByTagName('a');
            let songs = [];

            for (let i = 0; i < as.length; i++) {
                if (as[i].href.endsWith(".mp3")) {
                    songs.push(as[i].href);
                }
            }
            return songs;
        } catch (error) {
            console.error('Error fetching songs:', error);
            return [];
        }
    };

    const displaySongs = (songs) => {
        songsList.innerHTML = ''; // Clear previous songs
        songs.forEach(song => {
            const listItem = document.createElement('li');
            listItem.classList.add('song-item');

            const songUrl = song;
            const songName = decodeURIComponent(song.split('/').pop().replaceAll('.mp3', ' '));
            const artistName = decodeURIComponent(song.split('/').pop().split('-')[1]?.replaceAll('%20', ' '));

            listItem.innerHTML = `
                <div class="song-info">
                    <span class="song-name">${songName}</span>
                    <span class="artist-name">${artistName}</span>
                </div>
            `;
            listItem.setAttribute('data-song-url', songUrl);
            listItem.addEventListener('click', () => {
                playSong(songUrl, songName);
            });
            songsList.appendChild(listItem);
        });
    };

    playButton.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playButton.src = "./images/pause.svg";
        } else {
            currentsong.pause();
            playButton.src = "./images/play.svg";
        }
    });

    // play the song

    const playSong = (track, songName) => {
        currentsong.src = track;
        currentsong.play().catch(error => {
            console.error('Error playing song:', error);
        });

        playButton.src = "./images/pause.svg";
        songInfo.innerHTML = songName;

        // Update time and duration
        currentsong.addEventListener("loadedmetadata", () => {
            updateSongTime();
        });

        currentsong.addEventListener("timeupdate", () => {
            updateSongTime();
        });
    };

    const secondToMinutesSeconds = (seconds) => {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    const updateSongTime = () => {
        const currentTime = secondToMinutesSeconds(currentsong.currentTime);
        const duration = secondToMinutesSeconds(currentsong.duration);

        songTime.innerHTML = `${currentTime} / ${duration}`;
    };

    // seekbar

    const seekbar = document.querySelector(".seekbar");
    const seekCircle = document.querySelector(".seek-circle");
    
// Update the seekbar circle as the song playing

    currentsong.addEventListener("timeupdate", () => {
        let percent = (currentsong.currentTime / currentsong.duration) * 100;
        seekCircle.style.left = percent + "%";
    });

// Handle click on the seekbar to move the song position

    seekbar.addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        seekCircle.style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    
});

