// ============================================================
// SimpleNote - script.js
// Hier liegt die gesamte Logik der App
// ============================================================
//
// STRUKTUR:
//   1. Daten (Array von Notizen)
//   2. Hilfsfunktionen
//   3. API-Platzhalter (für spätere Backend-Anbindung)
//   4. Render-Funktionen (DOM aktualisieren)
//   5. CRUD-Funktionen (Create, Read, Update, Delete)
//   6. Format-Funktion
//   7. Modal-Steuerung (ein-/ausblenden)
//   8. Event Listener
//   9. App starten
//
// ============================================================


// ============================================================
// 1. DATEN
// Alle Notizen werden in diesem Array gespeichert.
// Jede Notiz ist ein Objekt mit den Feldern: id, title, content, date
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
        content: "# Neue App Idee\nEine App, die Aufgaben automatisch priorisiert.\n\n## Details\nNutzer gibt Aufgaben ein und die App sortiert sie nach Wichtigkeit und Deadline.\n\n### Nächste Schritte\nPrototyp skizzieren, Tech-Stack festlegen.",
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

// Zähler für neue IDs (wird bei jeder neuen Notiz um 1 erhöht)
var nextId = 7;

// Die aktuell bearbeitete Notiz (null = wir erstellen gerade eine neue Notiz)
var selectedNote = null;

// Farben für die Notizkarten (rotieren durch das Array)
// Diese Farben sind dem Design-Referenzbild nachempfunden
var noteColors = [
    "#F4845F",  // Warmes Orange-Lachs
    "#FFD166",  // Helles Sonnengelb
    "#F4A261",  // Sanftes Pfirsich
    "#B5A8D5",  // Weiches Lavendel
    "#C5E063",  // Frisches Limette-Grün
    "#4ECDC4"   // Lebendiges Türkis
];


// ============================================================
// 2. HILFSFUNKTIONEN
// ============================================================

// Gibt die passende Farbe für eine Karte anhand ihrer Position zurück
function getNoteColor(index) {
    // Durch den Modulo-Operator wiederholen sich die Farben,
    // sobald alle 6 verwendet wurden
    return noteColors[index % noteColors.length];
}

// Formatiert ein Datum von "2024-05-21" zu "May 21, 2024"
function formatDate(dateString) {
    // Wenn kein Datum vorhanden, leeren String zurückgeben
    if (!dateString) {
        return "";
    }

    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Datum-String aufsplitten (Format: YYYY-MM-DD)
    var parts = dateString.split("-");
    var year = parts[0];
    var monthIndex = parseInt(parts[1], 10) - 1; // Monate beginnen bei 0
    var day = parseInt(parts[2], 10);

    return monthNames[monthIndex] + " " + day + ", " + year;
}

// Gibt das heutige Datum als String im Format "YYYY-MM-DD" zurück
function getTodayDate() {
    var today = new Date();
    var year = today.getFullYear();
    // Monat und Tag immer zweistellig (z.B. "05" statt "5")
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}


// ============================================================
// 3. API-PLATZHALTER
// Diese Funktionen würde man bei einer Backend-Anbindung
// durch echte fetch()-Aufrufe ersetzen.
//
// Beispiel für eine spätere Implementierung:
//   function loadAllNotes() {
//       fetch("/api/notes")
//           .then(function(response) { return response.json(); })
//           .then(function(data) {
//               notes = data;
//               renderNotes();
//           });
//   }
// ============================================================

// Lädt alle Notizen (aktuell direkt aus dem Array)
function loadAllNotes() {
    // Aktuell: Notizen sind schon im Array gespeichert
    renderNotes();
}


// ============================================================
// 4. RENDER-FUNKTIONEN
// Diese Funktionen lesen die Daten und aktualisieren das HTML (DOM).
// ============================================================

// Zeigt alle (oder gefilterten) Notizen als Karten im Grid an
function renderNotes() {
    var grid = document.getElementById("notesGrid");
    var searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();

    // Alten Inhalt des Grids entfernen
    grid.innerHTML = "";

    // Notizen nach dem Suchbegriff filtern
    var filteredNotes = [];
    for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        var titleMatches   = note.title.toLowerCase().indexOf(searchTerm) !== -1;
        var contentMatches = note.content.toLowerCase().indexOf(searchTerm) !== -1;

        // Notiz anzeigen, wenn Titel oder Inhalt den Suchbegriff enthält
        if (titleMatches || contentMatches) {
            filteredNotes.push(note);
        }
    }

    // Wenn keine Notizen übrig bleiben: Hinweis-Nachricht anzeigen
    if (filteredNotes.length === 0) {
        var emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-message";

        if (searchTerm !== "") {
            emptyDiv.textContent = 'Keine Notizen für "' + searchTerm + '" gefunden.';
        } else {
            emptyDiv.textContent = "Noch keine Notizen vorhanden. Klicke auf + um deine erste zu erstellen!";
        }

        grid.appendChild(emptyDiv);
        return;
    }

    // Jede gefilterte Notiz als Karte ins Grid einfügen
    for (var j = 0; j < filteredNotes.length; j++) {
        var card = createNoteCard(filteredNotes[j], j);
        grid.appendChild(card);

        // Stagger-Effekt: Karten erscheinen nacheinander mit kleiner Verzögerung
        // Dies erzeugt einen schönen Wellen-Effekt beim Laden
        var delayMs = j * 75;
        (function(cardElement, delay) {
            setTimeout(function() {
                cardElement.classList.add("visible");
            }, delay);
        })(card, delayMs);
    }
}

// Erstellt eine einzelne Notizkarte als HTML-Element und gibt sie zurück
function createNoteCard(note, colorIndex) {

    // --- Haupt-Container der Karte ---
    var card = document.createElement("div");
    card.className = "note-card";
    card.style.backgroundColor = getNoteColor(colorIndex);
    // Wir speichern die ID als Attribut, um die Karte später im DOM finden zu können
    card.setAttribute("data-note-id", note.id);

    // --- Titelzeile ---
    var titleEl = document.createElement("h3");
    titleEl.className = "note-card-title";
    titleEl.textContent = note.title;

    // --- Inhalts-Vorschau (maximal 120 Zeichen) ---
    var preview = note.content;
    if (preview.length > 120) {
        preview = preview.substring(0, 120) + "...";
    }
    var contentEl = document.createElement("p");
    contentEl.className = "note-card-content";
    contentEl.textContent = preview;

    // --- Fußzeile der Karte: Datum links, Buttons rechts ---
    var footerEl = document.createElement("div");
    footerEl.className = "note-card-footer";

    // Datumsanzeige
    var dateEl = document.createElement("span");
    dateEl.className = "note-card-date";
    dateEl.textContent = formatDate(note.date);

    // Container für die Aktions-Buttons
    var buttonsEl = document.createElement("div");
    buttonsEl.className = "note-card-buttons";

    // -- Bearbeiten-Button (Bleistift-Icon) --
    var editBtn = document.createElement("button");
    editBtn.className = "note-btn edit-btn";
    editBtn.title = "Notiz bearbeiten";
    // Bleistift-Icon als SVG (weiß auf dunklem Hintergrund)
    editBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>' +
        '<path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
        "</svg>";

    // Wir speichern die noteId in einer Variable, damit sie im onclick-Handler
    // korrekt referenziert wird (Closure-Sicherheit)
    var noteId = note.id;

    editBtn.onclick = function() {
        // Die aktuelle Version der Notiz aus dem Array holen
        // (sie könnte sich seit dem Rendern geändert haben)
        for (var k = 0; k < notes.length; k++) {
            if (notes[k].id === noteId) {
                openEditModal(notes[k]);
                break;
            }
        }
    };

    // -- Löschen-Button (Papierkorb-Icon) --
    var deleteBtn = document.createElement("button");
    deleteBtn.className = "note-btn delete-btn";
    deleteBtn.title = "Notiz löschen";
    // Papierkorb-Icon als SVG
    deleteBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>' +
        '<path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>' +
        "</svg>";

    deleteBtn.onclick = function() {
        deleteNote(noteId);
    };

    // Alles zusammenbauen
    buttonsEl.appendChild(editBtn);
    buttonsEl.appendChild(deleteBtn);
    footerEl.appendChild(dateEl);
    footerEl.appendChild(buttonsEl);
    card.appendChild(titleEl);
    card.appendChild(contentEl);
    card.appendChild(footerEl);

    return card;
}


// ============================================================
// 5. CRUD-FUNKTIONEN
// Create, Read, Update, Delete
// ============================================================

// CRUD – CREATE: Modal zum Erstellen einer neuen Notiz öffnen
function openCreateModal() {
    // selectedNote auf null setzen = neue Notiz wird erstellt
    selectedNote = null;

    // Eingabefelder leeren
    document.getElementById("modalTitle").value = "";
    document.getElementById("modalContent").value = "";
    // Heutiges Datum als Standard vorausfüllen
    document.getElementById("modalDate").value = getTodayDate();

    // Format-Buttons zurücksetzen ("Body" als Standard aktiv)
    resetFormatButtons();

    showModal();
}

// CRUD – READ / EDIT: Modal zum Bearbeiten einer bestehenden Notiz öffnen
function openEditModal(note) {
    // Die zu bearbeitende Notiz merken
    selectedNote = note;

    // Felder mit den vorhandenen Notiz-Daten befüllen
    document.getElementById("modalTitle").value = note.title;
    document.getElementById("modalContent").value = note.content;
    document.getElementById("modalDate").value = note.date;

    // Format-Buttons zurücksetzen
    resetFormatButtons();

    showModal();
}

// CRUD – CREATE / UPDATE: Notiz speichern (je nachdem ob selectedNote null ist)
function saveNote() {
    var titleInput   = document.getElementById("modalTitle");
    var contentInput = document.getElementById("modalContent");
    var dateInput    = document.getElementById("modalDate");

    // Werte aus den Feldern lesen und von Leerzeichen bereinigen
    var title   = titleInput.value.trim();
    var content = contentInput.value.trim();
    var date    = dateInput.value;

    // Validierung: Titel darf nicht leer sein
    if (title === "") {
        // Schüttel-Animation auf dem Titelfeld als visuelles Feedback
        titleInput.classList.add("shake");
        setTimeout(function() {
            titleInput.classList.remove("shake");
        }, 400);
        titleInput.focus();
        return; // Frühzeitig beenden, nichts speichern
    }

    if (selectedNote === null) {
        // ---- NEUE NOTIZ erstellen ----
        //
        // BACKEND-PLATZHALTER: Hier könnte später ein API-Call stehen:
        // fetch("/api/notes", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ title: title, content: content, date: date })
        // }).then(function(res) { return res.json(); })
        //   .then(function(newNote) { notes.unshift(newNote); renderNotes(); });

        var newNote = {
            id:      nextId,
            title:   title,
            content: content,
            date:    date
        };

        // ID-Zähler erhöhen, damit die nächste Notiz eine andere ID bekommt
        nextId = nextId + 1;

        // Neue Notiz am Anfang des Arrays einfügen (neueste zuerst)
        notes.unshift(newNote);

    } else {
        // ---- BESTEHENDE NOTIZ aktualisieren ----
        //
        // BACKEND-PLATZHALTER: Hier könnte später ein API-Call stehen:
        // fetch("/api/notes/" + selectedNote.id, {
        //     method: "PUT",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ title: title, content: content, date: date })
        // }).then(function() { renderNotes(); });

        // Notiz im Array finden und aktualisieren
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === selectedNote.id) {
                notes[i].title   = title;
                notes[i].content = content;
                notes[i].date    = date;
                break; // Gefunden, Schleife beenden
            }
        }
    }

    // Modal schließen und Grid neu rendern
    closeModal();
    renderNotes();
}

// CRUD – DELETE: Notiz löschen
function deleteNote(noteId) {
    // Sicherheitsfrage, bevor gelöscht wird
    var confirmed = confirm("Möchtest du diese Notiz wirklich löschen?");
    if (!confirmed) {
        return; // Nutzer hat abgebrochen
    }

    // Die Karte im DOM finden und die Lösch-Animation starten
    var card = document.querySelector('[data-note-id="' + noteId + '"]');
    if (card) {
        card.classList.add("deleting");
    }

    // Kurz warten bis die Animation fertig ist, dann aus dem Array entfernen
    setTimeout(function() {
        // BACKEND-PLATZHALTER: Hier könnte später ein API-Call stehen:
        // fetch("/api/notes/" + noteId, { method: "DELETE" })
        //     .then(function() { renderNotes(); });

        // Notiz aus dem Array entfernen
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === noteId) {
                notes.splice(i, 1); // 1 Element an Position i entfernen
                break;
            }
        }

        // Grid neu rendern
        renderNotes();
    }, 380); // 380ms = Dauer der CSS-Lösch-Animation
}


// ============================================================
// 6. FORMAT-FUNKTION
// Fügt Markdown-ähnliche Formatierungs-Marker in die Textarea ein
// ============================================================

function insertFormat(formatType) {
    var textarea = document.getElementById("modalContent");

    // Aktuelle Cursor-Position und ggf. markierten Text holen
    var start        = textarea.selectionStart;
    var end          = textarea.selectionEnd;
    var selectedText = textarea.value.substring(start, end);
    var before       = textarea.value.substring(0, start);
    var after        = textarea.value.substring(end);

    var insertion = "";

    // Je nach Formatierungstyp den richtigen Marker einfügen
    if (formatType === "title") {
        // Große Überschrift (Markdown: # ...)
        insertion = "# " + (selectedText || "Titel");

    } else if (formatType === "subtitle") {
        // Mittlere Überschrift (Markdown: ## ...)
        insertion = "## " + (selectedText || "Untertitel");

    } else if (formatType === "heading") {
        // Kleine Überschrift (Markdown: ### ...)
        insertion = "### " + (selectedText || "Überschrift");

    } else if (formatType === "strong") {
        // Fetter Text (Markdown: **...**)
        insertion = "**" + (selectedText || "Fetter Text") + "**";

    } else if (formatType === "body") {
        // Normaler Text (kein Marker, Text bleibt wie er ist)
        insertion = selectedText || "";

    } else if (formatType === "caption") {
        // Kursiver Text / Bildunterschrift (Markdown: _..._)
        insertion = "_" + (selectedText || "Bildunterschrift") + "_";
    }

    // Den formatierten Text an der Cursorposition einfügen
    textarea.value = before + insertion + after;

    // Cursor hinter den eingefügten Text setzen
    var newCursorPos = start + insertion.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
}


// ============================================================
// 7. MODAL-STEUERUNG
// ============================================================

// Modal einblenden (mit Animation)
function showModal() {
    var overlay = document.getElementById("modalOverlay");
    var modal   = document.getElementById("noteModal");

    // Overlay sichtbar machen
    overlay.classList.add("active");

    // Kleine Pause, damit der Browser den Visibility-Wechsel verarbeitet,
    // bevor die Slide-Up-Animation der .modal startet
    setTimeout(function() {
        modal.classList.add("visible");
    }, 20);

    // Fokus auf das Titelfeld setzen (etwas später, nach der Animation)
    setTimeout(function() {
        document.getElementById("modalTitle").focus();
    }, 60);
}

// Modal ausblenden (mit Animation)
function closeModal() {
    var overlay = document.getElementById("modalOverlay");
    var modal   = document.getElementById("noteModal");

    // Modal-Animation zurücksetzen (fährt nach unten und wird kleiner)
    modal.classList.remove("visible");

    // Overlay erst nach Ende der Modal-Animation ausblenden
    setTimeout(function() {
        overlay.classList.remove("active");
    }, 350);

    // Ausgewählte Notiz zurücksetzen
    selectedNote = null;
}

// Setzt alle Format-Buttons zurück und markiert "Body" als aktiv
function resetFormatButtons() {
    var allBtns = document.querySelectorAll(".format-btn");
    for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.remove("active");
    }
    // Standard: "Body" ist der aktive Format-Button
    var bodyBtn = document.querySelector('[data-format="body"]');
    if (bodyBtn) {
        bodyBtn.classList.add("active");
    }
}


// ============================================================
// 8. EVENT LISTENER
// Verknüpfen von Benutzer-Aktionen mit den jeweiligen Funktionen
// ============================================================

// Suchfeld: Bei jeder Eingabe die Notizen filtern und neu anzeigen
document.getElementById("searchInput").addEventListener("input", function() {
    renderNotes();
});

// Plus-Button: Öffnet das Modal zum Erstellen einer neuen Notiz
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

// Klick auf den dunklen Hintergrund (Overlay) schließt das Modal
document.getElementById("modalOverlay").addEventListener("click", function(event) {
    // Nur schließen, wenn direkt auf den Hintergrund geklickt wurde
    // (nicht auf das Modal selbst)
    if (event.target === this) {
        closeModal();
    }
});

// ESC-Taste schließt das Modal
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        var overlay = document.getElementById("modalOverlay");
        // Nur schließen, wenn das Modal gerade offen ist
        if (overlay.classList.contains("active")) {
            closeModal();
        }
    }
});

// Format-Panel Buttons: Klick auf einen Button fügt den entsprechenden
// Formatierungs-Marker in die Textarea ein.
// Wir verwenden Event Delegation: Ein einziger Listener auf dem Container,
// der erkennt welcher Button geklickt wurde.
document.querySelector(".format-buttons-grid").addEventListener("click", function(event) {
    // Herausfinden, welcher Button geklickt wurde
    var clickedBtn = event.target;

    // Falls auf ein Kind-Element geklickt wurde (z.B. Text im Button),
    // zum Eltern-Button navigieren
    if (!clickedBtn.classList.contains("format-btn")) {
        clickedBtn = clickedBtn.parentElement;
    }

    // Sicherstellen, dass es wirklich ein Format-Button ist
    if (!clickedBtn || !clickedBtn.classList.contains("format-btn")) {
        return;
    }

    // Formatierungstyp aus dem data-format-Attribut lesen
    var formatType = clickedBtn.getAttribute("data-format");
    insertFormat(formatType);

    // Den geklickten Button als aktiv markieren, alle anderen deaktivieren
    var allBtns = document.querySelectorAll(".format-btn");
    for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.remove("active");
    }
    clickedBtn.classList.add("active");
});


// ============================================================
// 9. APP STARTEN
// Beim ersten Laden der Seite die Notizen anzeigen
// ============================================================
loadAllNotes();
