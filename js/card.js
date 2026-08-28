// SCHACHICUSTOMS – NFC Card System

const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");

async function loadCard() {

    try {

        // Datenbank laden
        const response = await fetch("cards.json");

        if (!response.ok) {
            throw new Error("Database could not be loaded.");
        }

        const cards = await response.json();

        // Karten-ID prüfen
        if (!cardId || !cards[cardId]) {
            showNotFound();
            return;
        }

        const card = cards[cardId];

        console.log("SCHACHICUSTOMS Card:", card);
        console.log("Rulings loaded:", card.rulings);


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

        const effectElement =
            document.getElementById("card-effect");

        effectElement.textContent =
            card.effect || "No effect information available.";


        // ========================================
        // RULINGS
        // ========================================

        const rulingsContainer =
            document.getElementById("card-rulings");

        // Alten Inhalt vollständig entfernen
        rulingsContainer.innerHTML = "";


        if (Array.isArray(card.rulings) && card.rulings.length > 0) {

            card.rulings.forEach((ruling, index) => {

                const item =
                    document.createElement("div");

                item.className = "ruling-item";


                const number =
                    document.createElement("span");

                number.className = "ruling-number";

                number.textContent =
                    String(index + 1).padStart(2, "0");


                const text =
                    document.createElement("p");

                text.textContent = ruling;


                item.appendChild(number);
                item.appendChild(text);

                rulingsContainer.appendChild(item);

            });

        } else {

            const empty =
                document.createElement("p");

            empty.textContent =
                "No rulings available.";

            rulingsContainer.appendChild(empty);

        }


        // ========================================
        // VERIFICATION
        // ========================================

        document.getElementById("verification").innerHTML = `
            <strong>✓ NFC VERIFIED</strong>
            <p>Authentic SCHACHICUSTOMS card entry</p>
        `;


        // Browser-Titel
        document.title =
            card.name + " | SCHACHICUSTOMS";


    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Database Error:",
            error
        );

        showDatabaseError();

    }

}


// ========================================
// CARD NOT FOUND
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
// DATABASE ERROR
// ========================================

function showDatabaseError() {

    document.getElementById("card-name").textContent =
        "Database Error";

    document.getElementById("verification").innerHTML = `
        <strong>DATABASE ERROR</strong>
        <p>The SCHACHICUSTOMS card database could not be loaded.</p>
    `;

}


// ========================================
// START
// ========================================

loadCard();