console.log("Hello Bhaii ji ")
let songs;
let currentSong = new Audio()
let currFolder


function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as)
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // console.log(element.href.split(`/${currFolder}/`)[1])
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    //show all the song of the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""

    // console.log(songUl)
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li class="songtile">
                                <img class="invert" src="assets/svgs/music.svg" alt="">
                                <div class="song-info">
                                    <div>${(song.replaceAll("%20", " ")).replace(".mp3", "")}</div>
                                    <div>Artist</div>

                                </div>
                                <div class="play" id ="tile-play">
                                <img  src="assets/svgs/hoverplay.svg" alt=""></div>
                            </li>`
    }


    // Attach Event Listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", e => {
            // console.log(element.querySelector(".song-info").firstElementChild.innerHTML.trim())
            playMusic(element.querySelector(".song-info").firstElementChild.innerHTML.trim())
            highlightActiveTile(element.querySelector(".song-info").firstElementChild.innerHTML.trim())


        })
    });

    return songs;


}

function highlightActiveTile(songName) {
    document.querySelectorAll(".songtile").forEach((tile) => {
        const tileSong = tile.querySelector(".song-info div").textContent.trim();
        if (tileSong === songName) {
            tile.style.border = "1px solid #1fdf65c7";
        } else {
            tile.style.border = "1px solid #6e6981";
        }
    });
}



const playMusic = (track, pause = false) => {
    currentSong.src = (`/${currFolder}/` + track + ".mp3")
    if (!pause) {
        currentSong.play()
        play.src = "assets/svgs/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    // console.log(array)
    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < array.length; index++) {
        let element = array[index];
        if (element.href.includes("/songs")) {
            let folder = element.href.split("/").slice(-2)[0]
            // console.log(folder)

            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.png" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }


    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0].replace(".mp3", ""))
        });
    });
};




async function main() {
    await getSongs("songs/Karan-Aujla")
    playMusic((songs[0].replace(".mp3", "")), true)



    //dispplay all the albums
    await displayAlbums()



    // Attach Event Listener to Play,next,Pervious
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/svgs/pause.svg"


        } else {
            currentSong.pause()
            play.src = "assets/svgs/play.svg"
        }

    })


    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].replace(".mp3", ""))
        }
    })


    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].replace(".mp3", ""))
        }
    })





    // Event listener for time update
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    let percent = (currentSong.currentTime / currentSong.duration) * 100 || 0;
    document.querySelector(".circle").style.left = percent + "%";
    document.querySelector(".seekbar").style.background = `linear-gradient(to right, #1fdf64 0%, #1fdf64 ${percent}%, #2e2b3c ${percent}%, #2e2b3c 100%)`;
});


    //Event listener for song seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, #1fdf64 0%, #1fdf64 ${percent}%, #2e2b3c ${percent}%, #2e2b3c 100%)`;

    })


    // Event listener for menu bar
    document.querySelector(".logo").addEventListener("click", () => {
        const leftMenu = document.querySelector(".left");

        if (leftMenu.style.left === "0%") {
            leftMenu.style.left = "-110%"; // hide
        } else {
            leftMenu.style.left = "0%"; // show
        }
    });

    // Event listener for volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
    });

    // Add event listener to mute the track
    document.querySelector(".range>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })


}

main()