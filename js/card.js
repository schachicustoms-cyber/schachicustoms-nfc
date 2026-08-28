// SCHACHICUSTOMS – NFC Card System

const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");

async function loadCard() {

    try {

        // Kartendatenbank laden
        const response = await fetch("cards.json");

        if (!response.ok) {
            throw new Error("Database could not be loaded.");
        }

        const cards = await response.json();

        // Prüfen, ob die übergebene ID existiert
        if (!cardId || !cards[cardId]) {
            showNotFound();
            return;
        }

        const card = cards[cardId];

        // Kartendaten anzeigen
        document.getElementById("card-name").textContent = card.name;
        document.getElementById("card-id").textContent = card.id;
        document.getElementById("card-image").src = card.image;
        document.getElementById("card-image").alt = card.name;

        document.getElementById("card-attribute").textContent = card.attribute;
        document.getElementById("card-level").textContent = card.level;
        document.getElementById("card-type").textContent = card.type;
        document.getElementById("card-atk").textContent = card.atk;
        document.getElementById("card-def").textContent = card.def;

        document.title = card.name + " | SCHACHICUSTOMS";

    } catch (error) {

        console.error(error);

        document.getElementById("card-name").textContent =
            "Database Error";

        document.getElementById("verification").innerHTML = `
            <strong>DATABASE ERROR</strong>
            <p>The SCHACHICUSTOMS card database could not be loaded.</p>
        `;
    }
}


function showNotFound() {

    document.getElementById("card-name").textContent =
        "Card not found";

    document.getElementById("card-id").textContent =
        cardId || "No ID";

    document.getElementById("card-image").style.display =
        "none";

    document.getElementById("verification").innerHTML = `
        <strong>✕ CARD NOT FOUND</strong>
        <p>This NFC card ID is not registered.</p>
    `;
}


// System starten
loadCard();