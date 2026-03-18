// SimpleNote - script.js
// Notizen anzeigen, erstellen, bearbeiten, löschen - via Backend API


// Backend-URL (läuft in einem separaten Container)
var API_BASE_URL = "http://localhost:8080/notes";

// Welche Notiz gerade bearbeitet wird (null = neue Notiz)
var selectedNote = null;

// Farben für die Notizkarten
var noteColors = [
    "#F4845F",
    "#FFD166",
    "#F4A261",
    "#B5A8D5",
    "#C5E063",
    "#4ECDC4"
];

// Gibt die Farbe für eine Karte anhand ihrer Position zurück
function getNoteColor(index) {
    return noteColors[index % noteColors.length];
}


// Alle Notizen vom Backend laden und anzeigen
function renderNotes() {
    var grid = document.getElementById("notesGrid");
    var searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();

    grid.innerHTML = "";

    fetch(API_BASE_URL)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Fehler beim Laden der Notizen");
            }
            return response.json();
        })
        .then(function(notes) {
            // Notizen nach Suchbegriff filtern
            var filteredNotes = [];
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];
                var titelPasst = note.title.toLowerCase().indexOf(searchTerm) !== -1;
                var inhaltPasst = (note.content || "").toLowerCase().indexOf(searchTerm) !== -1;

                if (titelPasst || inhaltPasst) {
                    filteredNotes.push(note);
                }
            }

            // Keine Notizen gefunden: Hinweis anzeigen
            if (filteredNotes.length === 0) {
                var hinweis = document.createElement("div");
                hinweis.className = "empty-message";

                if (searchTerm !== "") {
                    hinweis.textContent = 'Keine Notizen für "' + searchTerm + '" gefunden.';
                } else {
                    hinweis.textContent = "Noch keine Notizen vorhanden. Klicke auf + um deine erste zu erstellen!";
                }

                grid.appendChild(hinweis);
                return;
            }

            // Jede Notiz als Karte einfügen
            for (var j = 0; j < filteredNotes.length; j++) {
                var karte = createNoteCard(filteredNotes[j], j);
                grid.appendChild(karte);
            }
        })
        .catch(function(error) {
            var hinweis = document.createElement("div");
            hinweis.className = "empty-message";
            hinweis.textContent = "Notizen konnten nicht geladen werden. Bitte Backend prüfen.";
            grid.appendChild(hinweis);
        });
}

// Erstellt eine einzelne Notizkarte und gibt sie zurück
function createNoteCard(note, farbIndex) {
    var karte = document.createElement("div");
    karte.className = "note-card";
    karte.style.backgroundColor = getNoteColor(farbIndex);
    karte.setAttribute("data-note-id", note.id);

    // Titel
    var titelEl = document.createElement("h3");
    titelEl.className = "note-card-title";
    titelEl.textContent = note.title;

    // Inhalts-Vorschau (maximal 120 Zeichen)
    var vorschau = note.content || "";
    if (vorschau.length > 120) {
        vorschau = vorschau.substring(0, 120) + "...";
    }
    var inhaltEl = document.createElement("p");
    inhaltEl.className = "note-card-content";
    inhaltEl.textContent = vorschau;

    // Fußzeile mit Buttons
    var fusszeileEl = document.createElement("div");
    fusszeileEl.className = "note-card-footer";

    var buttonContainer = document.createElement("div");
    buttonContainer.className = "note-card-buttons";

    // Bearbeiten-Button
    var bearbeitenBtn = document.createElement("button");
    bearbeitenBtn.className = "note-btn edit-btn";
    bearbeitenBtn.title = "Notiz bearbeiten";
    bearbeitenBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>' +
        '<path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
        "</svg>";

    // noteId in Variable, damit onclick richtig funktioniert
    var noteId = note.id;
    var noteTitle = note.title;
    var noteContent = note.content || "";

    bearbeitenBtn.onclick = function() {
        openEditModal({ id: noteId, title: noteTitle, content: noteContent });
    };

    // Löschen-Button
    var loeschenBtn = document.createElement("button");
    loeschenBtn.className = "note-btn delete-btn";
    loeschenBtn.title = "Notiz löschen";
    loeschenBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>' +
        '<path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>' +
        "</svg>";

    loeschenBtn.onclick = function() {
        deleteNote(noteId);
    };

    buttonContainer.appendChild(bearbeitenBtn);
    buttonContainer.appendChild(loeschenBtn);
    fusszeileEl.appendChild(buttonContainer);
    karte.appendChild(titelEl);
    karte.appendChild(inhaltEl);
    karte.appendChild(fusszeileEl);

    return karte;
}


// Modal zum Erstellen einer neuen Notiz öffnen
function openCreateModal() {
    selectedNote = null;

    document.getElementById("modalTitle").value = "";
    document.getElementById("modalContent").value = "";

    showModal();
}

// Modal zum Bearbeiten einer bestehenden Notiz öffnen
function openEditModal(note) {
    selectedNote = note;

    document.getElementById("modalTitle").value = note.title;
    document.getElementById("modalContent").value = note.content;

    showModal();
}

// Notiz speichern: POST (neu) oder PUT (aktualisieren) via fetch
function saveNote() {
    var titelInput = document.getElementById("modalTitle");
    var inhaltInput = document.getElementById("modalContent");

    var titel = titelInput.value.trim();
    var inhalt = inhaltInput.value.trim();

    // Titel darf nicht leer sein
    if (titel === "") {
        titelInput.focus();
        return;
    }

    var dto = { title: titel, content: inhalt };

    if (selectedNote === null) {
        // Neue Notiz erstellen: POST /notes
        fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("Fehler beim Erstellen der Notiz");
                }
                return response.json();
            })
            .then(function() {
                closeModal();
                renderNotes();
            })
            .catch(function(error) {
                alert("Notiz konnte nicht gespeichert werden. Bitte Backend prüfen. (" + error.message + ")");
            });
    } else {
        // Bestehende Notiz aktualisieren: PUT /notes/{id}
        fetch(API_BASE_URL + "/" + selectedNote.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("Fehler beim Aktualisieren der Notiz");
                }
                return response.json();
            })
            .then(function() {
                closeModal();
                renderNotes();
            })
            .catch(function(error) {
                alert("Notiz konnte nicht aktualisiert werden. Bitte Backend prüfen. (" + error.message + ")");
            });
    }
}

// Notiz löschen: DELETE /notes/{id} via fetch
function deleteNote(noteId) {
    var bestaetigt = confirm("Möchtest du diese Notiz wirklich löschen?");
    if (!bestaetigt) {
        return;
    }

    fetch(API_BASE_URL + "/" + noteId, {
        method: "DELETE"
    })
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Fehler beim Löschen der Notiz");
            }
            renderNotes();
        })
        .catch(function(error) {
            alert("Notiz konnte nicht gelöscht werden. Bitte Backend prüfen. (" + error.message + ")");
        });
}


// Modal einblenden
function showModal() {
    var overlay = document.getElementById("modalOverlay");
    overlay.classList.add("active");
    document.getElementById("modalTitle").focus();
}

// Modal ausblenden
function closeModal() {
    var overlay = document.getElementById("modalOverlay");
    overlay.classList.remove("active");
    selectedNote = null;
}


// Event Listener

document.getElementById("searchInput").addEventListener("input", function() {
    renderNotes();
});

document.getElementById("addNoteBtn").addEventListener("click", function() {
    openCreateModal();
});

document.getElementById("saveBtn").addEventListener("click", function() {
    saveNote();
});

document.getElementById("cancelBtn").addEventListener("click", function() {
    closeModal();
});

document.getElementById("modalOverlay").addEventListener("click", function(event) {
    if (event.target === this) {
        closeModal();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        var overlay = document.getElementById("modalOverlay");
        if (overlay.classList.contains("active")) {
            closeModal();
        }
    }
});


// App starten
renderNotes();
