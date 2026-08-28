// SCHACHICUSTOMS – NFC Card System

const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");


// ========================================
// CARD DATABASE LADEN
// ========================================

async function loadCard() {

    try {

        const response = await fetch("cards.json");

        if (!response.ok) {
            throw new Error("Database could not be loaded.");
        }

        const cards = await response.json();


        // Prüfen, ob eine gültige Karten-ID vorhanden ist
        if (!cardId || !cards[cardId]) {
            showNotFound();
            return;
        }


        const card = cards[cardId];


        // ========================================
        // BASISDATEN
        // ========================================

        document.getElementById("card-name").textContent =
            card.name;

        document.getElementById("card-id").textContent =
            card.id;

        document.getElementById("card-image").src =
            card.image;

        document.getElementById("card-image").alt =
            card.name;

        document.getElementById("card-attribute").textContent =
            card.attribute;

        document.getElementById("card-level").textContent =
            card.level;

        document.getElementById("card-type").textContent =
            card.type;

        document.getElementById("card-atk").textContent =
            card.atk;

        document.getElementById("card-def").textContent =
            card.def;


        // ========================================
        // CARD EFFECT
        // ========================================

        document.getElementById("card-effect").textContent =
            card.effect || "No effect information available.";


        // ========================================
        // RULINGS & FAQ
        // ========================================

        const rulingsContainer =
            document.getElementById("card-rulings");

        rulingsContainer.innerHTML = "";


        if (card.rulings && card.rulings.length > 0) {

            card.rulings.forEach(function (ruling, index) {

                // Gesamter Ruling-Block
                const rulingElement =
                    document.createElement("div");

                rulingElement.classList.add("ruling-item");


                // Nummer: 01, 02, 03 ...
                const rulingNumber =
                    document.createElement("span");

                rulingNumber.classList.add("ruling-number");

                rulingNumber.textContent =
                    String(index + 1).padStart(2, "0");


                // Ruling-Text
                const rulingText =
                    document.createElement("p");

                rulingText.textContent =
                    ruling;


                // Nummer und Text zusammensetzen
                rulingElement.appendChild(
                    rulingNumber
                );

                rulingElement.appendChild(
                    rulingText
                );


                // Ruling auf der Seite anzeigen
                rulingsContainer.appendChild(
                    rulingElement
                );

            });

        } else {

            const noRulings =
                document.createElement("p");

            noRulings.textContent =
                "No rulings available.";

            rulingsContainer.appendChild(
                noRulings
            );

        }


        // ========================================
        // BROWSER-TITEL
        // ========================================

        document.title =
            card.name + " | SCHACHICUSTOMS";


    } catch (error) {

        console.error(error);

        showDatabaseError();

    }

}


// ========================================
// KARTE NICHT GEFUNDEN
// ========================================

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


// ========================================
// DATENBANKFEHLER
// ========================================

function showDatabaseError() {

    document.getElementById("card-name").textContent =
        "Database Error";

    document.getElementById("verification").innerHTML = `
        <strong>DATABASE ERROR</strong>
        <p>
            The SCHACHICUSTOMS card database
            could not be loaded.
        </p>
    `;

}


// ========================================
// SYSTEM STARTEN
// ========================================

loadCard();