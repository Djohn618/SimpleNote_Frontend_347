// ============================================================
// SimpleNote - script.js
// Logik der App: Notizen anzeigen, erstellen, bearbeiten, löschen
// ============================================================


// ============================================================
// DATEN
// Alle Notizen stehen in diesem Array.
// Jede Notiz hat: id, title, content, date
// ============================================================

var notes = [
    {
        id: 1,
        title: "Willkommen bei SimpleNote",
        content: "Das ist deine erste Notiz! Klicke auf den Bleistift-Button, um sie zu bearbeiten. Mit dem Papierkorb kannst du sie löschen. Und mit dem + links erstellst du neue Notizen.",
        date: "2024-05-21"
    },
    {
        id: 2,
        title: "Einkaufsliste",
        content: "Milch, Brot, Butter\nÄpfel, Bananen\nKaffee, Tee\nNudeln, Tomatensoße\nKäse, Joghurt",
        date: "2024-05-22"
    },
    {
        id: 3,
        title: "Projektideen für 2024",
        content: "Neue App Idee: Eine App, die Aufgaben automatisch priorisiert.\n\nNutzer gibt Aufgaben ein und die App sortiert sie nach Wichtigkeit und Deadline.\n\nNächste Schritte: Prototyp skizzieren, Tech-Stack festlegen.",
        date: "2024-05-25"
    },
    {
        id: 4,
        title: "Lernziele dieses Jahr",
        content: "JavaScript vertiefen\nCSS Animationen meistern\nHTML Semantik verbessern\nEin vollständiges Portfolio-Projekt bauen\nSQL Grundlagen wiederholen",
        date: "2024-05-26"
    },
    {
        id: 5,
        title: "Design Inspiration",
        content: "Dribbble und Behance regelmäßig anschauen. Interessante Farb-Paletten und Layouts für zukünftige Projekte notieren. Besonders: minimalistische UIs mit starken Typografien.",
        date: "2024-05-28"
    },
    {
        id: 6,
        title: "Meeting-Notizen",
        content: "Nächstes Meeting: Freitag 14:00 Uhr\nAgenda: Projektstand besprechen\nTeilnehmer: Team Alpha\nWichtig: Präsentation vorbereiten!",
        date: "2024-05-30"
    }
];

// Zähler für neue Notiz-IDs
var nextId = 7;

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


// ============================================================
// HILFSFUNKTIONEN
// ============================================================

// Gibt die Farbe für eine Karte anhand ihrer Position zurück
function getNoteColor(index) {
    return noteColors[index % noteColors.length];
}

// Formatiert ein Datum von "2024-05-21" zu "May 21, 2024"
function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var parts = dateString.split("-");
    var year = parts[0];
    var monthIndex = parseInt(parts[1], 10) - 1;
    var day = parseInt(parts[2], 10);

    return monthNames[monthIndex] + " " + day + ", " + year;
}

// Gibt das heutige Datum als "YYYY-MM-DD" zurück
function getTodayDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}


// ============================================================
// NOTIZEN ANZEIGEN
// Liest das notes-Array und baut die Karten im Grid
// ============================================================

function renderNotes() {
    var grid = document.getElementById("notesGrid");
    var searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();

    // Grid leeren
    grid.innerHTML = "";

    // Notizen nach Suchbegriff filtern
    var filteredNotes = [];
    for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        var titelPasst   = note.title.toLowerCase().indexOf(searchTerm) !== -1;
        var inhaltPasst  = note.content.toLowerCase().indexOf(searchTerm) !== -1;

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

        // Karten erscheinen nacheinander (Stagger-Effekt)
        var verzoegerung = j * 75;
        (function(karteElement, delay) {
            setTimeout(function() {
                karteElement.classList.add("visible");
            }, delay);
        })(karte, verzoegerung);
    }
}

// Erstellt eine einzelne Notizkarte und gibt sie zurück
function createNoteCard(note, farbIndex) {

    // Haupt-Container
    var karte = document.createElement("div");
    karte.className = "note-card";
    karte.style.backgroundColor = getNoteColor(farbIndex);
    karte.setAttribute("data-note-id", note.id);

    // Titel
    var titelEl = document.createElement("h3");
    titelEl.className = "note-card-title";
    titelEl.textContent = note.title;

    // Inhalts-Vorschau (maximal 120 Zeichen)
    var vorschau = note.content;
    if (vorschau.length > 120) {
        vorschau = vorschau.substring(0, 120) + "...";
    }
    var inhaltEl = document.createElement("p");
    inhaltEl.className = "note-card-content";
    inhaltEl.textContent = vorschau;

    // Fußzeile: Datum links, Buttons rechts
    var fusszeileEl = document.createElement("div");
    fusszeileEl.className = "note-card-footer";

    // Datum anzeigen
    var datumEl = document.createElement("span");
    datumEl.className = "note-card-date";
    datumEl.textContent = formatDate(note.date);

    // Button-Container
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

    bearbeitenBtn.onclick = function() {
        for (var k = 0; k < notes.length; k++) {
            if (notes[k].id === noteId) {
                openEditModal(notes[k]);
                break;
            }
        }
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

    // Alles zusammenbauen
    buttonContainer.appendChild(bearbeitenBtn);
    buttonContainer.appendChild(loeschenBtn);
    fusszeileEl.appendChild(datumEl);
    fusszeileEl.appendChild(buttonContainer);
    karte.appendChild(titelEl);
    karte.appendChild(inhaltEl);
    karte.appendChild(fusszeileEl);

    return karte;
}


// ============================================================
// CRUD-FUNKTIONEN
// Create, Read, Update, Delete
// ============================================================

// Modal zum Erstellen einer neuen Notiz öffnen
function openCreateModal() {
    selectedNote = null;

    // Felder leeren
    document.getElementById("modalTitle").value = "";
    document.getElementById("modalContent").value = "";

    showModal();
}

// Modal zum Bearbeiten einer bestehenden Notiz öffnen
function openEditModal(note) {
    selectedNote = note;

    // Felder mit Notiz-Daten befüllen
    document.getElementById("modalTitle").value = note.title;
    document.getElementById("modalContent").value = note.content;

    showModal();
}

// Notiz speichern (neu oder aktualisieren)
function saveNote() {
    var titelInput   = document.getElementById("modalTitle");
    var inhaltInput  = document.getElementById("modalContent");

    var titel   = titelInput.value.trim();
    var inhalt  = inhaltInput.value.trim();

    // Titel darf nicht leer sein
    if (titel === "") {
        // Schüttel-Animation als Hinweis
        titelInput.classList.add("shake");
        setTimeout(function() {
            titelInput.classList.remove("shake");
        }, 400);
        titelInput.focus();
        return;
    }

    if (selectedNote === null) {
        // Neue Notiz erstellen
        // Das Datum wird automatisch auf heute gesetzt
        var neueNotiz = {
            id:      nextId,
            title:   titel,
            content: inhalt,
            date:    getTodayDate()
        };

        nextId = nextId + 1;

        // Neue Notiz am Anfang des Arrays (neueste zuerst)
        notes.unshift(neueNotiz);

    } else {
        // Bestehende Notiz aktualisieren
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === selectedNote.id) {
                notes[i].title   = titel;
                notes[i].content = inhalt;
                // Datum bleibt unverändert
                break;
            }
        }
    }

    closeModal();
    renderNotes();
}

// Notiz löschen
function deleteNote(noteId) {
    var bestaetigt = confirm("Möchtest du diese Notiz wirklich löschen?");
    if (!bestaetigt) {
        return;
    }

    // Karte im DOM finden und Lösch-Animation starten
    var karte = document.querySelector('[data-note-id="' + noteId + '"]');
    if (karte) {
        karte.classList.add("deleting");
    }

    // Warten bis die Animation fertig ist, dann löschen
    setTimeout(function() {
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === noteId) {
                notes.splice(i, 1);
                break;
            }
        }
        renderNotes();
    }, 380);
}


// ============================================================
// MODAL STEUERN
// ============================================================

// Modal einblenden
function showModal() {
    var overlay = document.getElementById("modalOverlay");
    var modal   = document.getElementById("noteModal");

    overlay.classList.add("active");

    // Kleine Pause, damit die Animation sauber startet
    setTimeout(function() {
        modal.classList.add("visible");
    }, 20);

    // Fokus auf Titelfeld
    setTimeout(function() {
        document.getElementById("modalTitle").focus();
    }, 60);
}

// Modal ausblenden
function closeModal() {
    var overlay = document.getElementById("modalOverlay");
    var modal   = document.getElementById("noteModal");

    modal.classList.remove("visible");

    // Overlay erst nach der Schließ-Animation ausblenden
    setTimeout(function() {
        overlay.classList.remove("active");
    }, 350);

    selectedNote = null;
}


// ============================================================
// EVENT LISTENER
// Benutzer-Aktionen mit Funktionen verbinden
// ============================================================

// Suchfeld: Notizen filtern bei jeder Eingabe
document.getElementById("searchInput").addEventListener("input", function() {
    renderNotes();
});

// Plus-Button: neue Notiz erstellen
document.getElementById("addNoteBtn").addEventListener("click", function() {
    openCreateModal();
});

// Speichern-Button im Modal
document.getElementById("saveBtn").addEventListener("click", function() {
    saveNote();
});

// Abbrechen-Button im Modal
document.getElementById("cancelBtn").addEventListener("click", function() {
    closeModal();
});

// Klick auf den Hintergrund (Overlay) schließt das Modal
document.getElementById("modalOverlay").addEventListener("click", function(event) {
    if (event.target === this) {
        closeModal();
    }
});

// ESC-Taste schließt das Modal
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        var overlay = document.getElementById("modalOverlay");
        if (overlay.classList.contains("active")) {
            closeModal();
        }
    }
});


// ============================================================
// APP STARTEN
// Beim Laden der Seite alle Notizen anzeigen
// ============================================================
renderNotes();
