let albums = [];
let filtered = [];
let currentAlbum = null;
let modalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    modalInstance = new bootstrap.Modal(document.getElementById("exampleModal"));

    loadAlbums();
    setupSearch();
    setupSort();
    setupBackToTop();
});

function loadAlbums() {
    fetch("library.json")
        .then(res => res.json())
        .then(data => {
            albums = data;
            filtered = [...albums];
            renderAlbums(filtered);
        })
        .catch(err => console.error("Error loading library.json", err));
}

function renderAlbums(list) {
    const grid = document.getElementById("albumGrid");
    grid.innerHTML = "";

    list.forEach(album => {
        const col = document.createElement("div");
        col.className = "col-xl-2 col-md-3 col-sm-6 col-12 mb-4";

        col.innerHTML = `
            <div class="card h-100">
                <div class="position-relative">
                    <img src="assets/img/${album.thumbnail}" class="card-img-top" alt="${album.album}">
                    <div class="card-img-overlay-title">
                        ${album.album}
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${album.artist}</h5>
                    <p class="card-text mb-2">${album.album}</p>
                </div>
                <div class="card-footer bg-transparent border-0 pt-0">
                    <button class="btn btn-primary btn-sm view-tracklist-btn" data-id="${album.id}">
                        View Tracklist
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(col);
    });

    attachCardListeners();
}

function attachCardListeners() {
    document.querySelectorAll(".view-tracklist-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const album = filtered.find(a => a.id === id);
            if (album) openModal(album);
        });
    });
}

function openModal(album) {
    currentAlbum = album;

    const titleEl = document.getElementById("exampleModalLabel");
    const statsEl = document.getElementById("trackStats");
    const bodyEl = document.getElementById("modalBody");
    const playBtn = document.getElementById("playBtn");

    titleEl.textContent = `${album.artist} - ${album.album}`;

    const stats = computeTrackStats(album.tracklist);
    statsEl.innerHTML = `
        <p class="mb-1"><strong>Total tracks:</strong> ${stats.totalTracks}</p>
        <p class="mb-1"><strong>Total duration:</strong> ${stats.totalFormatted}</p>
        <p class="mb-1"><strong>Average track length:</strong> ${stats.avgFormatted}</p>
        <p class="mb-1"><strong>Shortest:</strong> ${stats.shortest.title} (${stats.shortest.length})</p>
        <p class="mb-3"><strong>Longest:</strong> ${stats.longest.title} (${stats.longest.length})</p>
    `;

    let html = `
        <div class="table-responsive">
            <table class="table table-striped align-middle">
                <thead>
                    <tr>
                        <th style="width: 10%;">#</th>
                        <th>Track</th>
                        <th style="width: 15%;">Length</th>
                    </tr>
                </thead>
                <tbody>
    `;

    album.tracklist.forEach(track => {
        html += `
            <tr>
                <td>${track.number}</td>
                <td>
                    <a href="${track.url}" target="_blank"
                       class="link-primary text-decoration-none">
                        ${track.title}
                    </a>
                </td>
                <td>${track.trackLength}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    bodyEl.innerHTML = html;

    playBtn.onclick = () => {
        if (album.tracklist.length > 0) {
            window.open(album.tracklist[0].url, "_blank");
        }
    };

    modalInstance.show();
}

function setupSearch() {
    const input = document.getElementById("searchInput");

    input.addEventListener("input", () => {
        const q = input.value.toLowerCase();

        filtered = albums.filter(a =>
            a.artist.toLowerCase().includes(q) ||
            a.album.toLowerCase().includes(q)
        );

        renderAlbums(filtered);
    });
}

function setupSort() {
    const select = document.getElementById("sortSelect");

    select.addEventListener("change", () => {
        const value = select.value;

        if (value === "artist") {
            filtered.sort((a, b) => a.artist.localeCompare(b.artist));
        } else if (value === "album") {
            filtered.sort((a, b) => a.album.localeCompare(b.album));
        } else if (value === "tracks-asc") {
            filtered.sort((a, b) => a.tracklist.length - b.tracklist.length);
        } else if (value === "tracks-desc") {
            filtered.sort((a, b) => b.tracklist.length - a.tracklist.length);
        } else {
            filtered = [...albums];
        }

        renderAlbums(filtered);
    });
}



function computeTrackStats(tracklist) {
    let totalSeconds = 0;
    let shortest = null;
    let longest = null;

    tracklist.forEach(track => {
        const seconds = timeToSeconds(track.trackLength);
        totalSeconds += seconds;

        if (!shortest || seconds < shortest.seconds) {
            shortest = { title: track.title, length: track.trackLength, seconds };
        }

        if (!longest || seconds > longest.seconds) {
            longest = { title: track.title, length: track.trackLength, seconds };
        }
    });

    const totalTracks = tracklist.length;
    const avgSeconds = totalTracks > 0 ? totalSeconds / totalTracks : 0;

    return {
        totalTracks,
        totalFormatted: secondsToTime(totalSeconds),
        avgFormatted: secondsToTime(Math.round(avgSeconds)),
        shortest,
        longest
    };
}

function timeToSeconds(timeStr) {
    const [minStr, secStr] = timeStr.split(":");
    const minutes = parseInt(minStr, 10) || 0;
    const seconds = parseInt(secStr, 10) || 0;
    return minutes * 60 + seconds;
}

function secondsToTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}


function setupBackToTop() {
    const btn = document.getElementById("backToTopBtn");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
