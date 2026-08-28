// ========================================
// SCHACHICUSTOMS – NFC CARD SYSTEM
// ========================================

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


        // Prüfen, ob Karten-ID existiert
        if (!cardId || !cards[cardId]) {
            showNotFound();
            setupSearch(cards);
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
        // RULINGS ALS DROPDOWN
        // ========================================

        renderRulings(card.rulings);


        // ========================================
        // NFC VERIFICATION
        // ========================================

        renderVerification(card);


        // ========================================
        // SHOP
        // ========================================

        renderShop(card);


        // ========================================
        // SUCHE
        // ========================================

        setupSearch(cards);


        // ========================================
        // BROWSER TITEL
        // ========================================

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
// RULINGS RENDERN
// ========================================

function renderRulings(rulings) {

    const container =
        document.getElementById("card-rulings");

    container.innerHTML = "";


    if (!Array.isArray(rulings) || rulings.length === 0) {

        const empty =
            document.createElement("p");

        empty.className = "no-rulings";

        empty.textContent =
            "No rulings available.";

        container.appendChild(empty);

        return;
    }


    rulings.forEach((ruling) => {

        // Gesamtes Dropdown
        const item =
            document.createElement("div");

        item.className =
            "ruling-dropdown";


        // Klickbarer Titel
        const button =
            document.createElement("button");

        button.className =
            "ruling-toggle";

        button.type =
            "button";


        // Titel
        const title =
            document.createElement("span");

        title.className =
            "ruling-title";

        title.textContent =
            ruling.title;


        // Plus / Minus Symbol
        const icon =
            document.createElement("span");

        icon.className =
            "ruling-icon";

        icon.textContent =
            "+";


        button.appendChild(title);
        button.appendChild(icon);


        // Ausklappbarer Text
        const content =
            document.createElement("div");

        content.className =
            "ruling-content";

        content.hidden =
            true;


        const text =
            document.createElement("p");

        text.textContent =
            ruling.text;


        content.appendChild(text);


        // Klickfunktion
        button.addEventListener(
            "click",
            function () {

                const isOpen =
                    !content.hidden;

                content.hidden =
                    isOpen;

                icon.textContent =
                    isOpen ? "+" : "−";

                button.classList.toggle(
                    "active",
                    !isOpen
                );

            }
        );


        item.appendChild(button);
        item.appendChild(content);

        container.appendChild(item);

    });

}


// ========================================
// NFC VERIFICATION
// ========================================

function renderVerification(card) {

    const verification =
        document.getElementById("verification");


    if (
        card.custom &&
        card.custom.status === "verified"
    ) {

        verification.innerHTML = `
            <div class="verification-icon">
                ✓
            </div>

            <div>
                <strong>NFC VERIFIED</strong>

                <p>
                    Registered SCHACHICUSTOMS card entry
                </p>
            </div>
        `;

    } else {

        verification.innerHTML = `
            <div class="verification-icon">
                ?
            </div>

            <div>
                <strong>DATABASE ENTRY</strong>

                <p>
                    SCHACHICUSTOMS card information
                </p>
            </div>
        `;

    }

}


// ========================================
// SHOP
// ========================================

function renderShop(card) {

    const shopBox =
        document.getElementById("shop-box");

    const shopPrice =
        document.getElementById("shop-price");

    const shopLink =
        document.getElementById("shop-link");


    // Standardmäßig verstecken
    shopBox.hidden = true;


    if (!card.shop) {
        return;
    }


    if (!card.shop.available) {
        return;
    }


    // Preis setzen
    if (card.shop.price) {

        shopPrice.textContent =
            "€" + card.shop.price;

    }


    /*
        Shop wird erst angezeigt,
        wenn auch eine echte URL vorhanden ist.
    */

    if (
        card.shop.url &&
        card.shop.url.trim() !== ""
    ) {

        shopLink.href =
            card.shop.url;

        shopBox.hidden =
            false;

    }

}


// ========================================
// CARD SEARCH
// ========================================

function setupSearch(cards) {

    const form =
        document.getElementById(
            "card-search-form"
        );

    const input =
        document.getElementById(
            "card-search-input"
        );


    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            if (!query) {
                return;
            }


            // Zuerst exakte ID prüfen
            const exactId =
                Object.keys(cards).find(
                    id =>
                        id.toLowerCase() === query
                );


            if (exactId) {

                window.location.href =
                    "card.html?id=" +
                    encodeURIComponent(exactId);

                return;

            }


            // Danach Kartennamen durchsuchen
            const result =
                Object.values(cards).find(
                    card =>
                        card.name
                            .toLowerCase()
                            .includes(query)
                );


            if (result) {

                window.location.href =
                    "card.html?id=" +
                    encodeURIComponent(result.id);

                return;

            }


            // Kein Treffer
            alert(
                "No card found for: " +
                input.value
            );

        }
    );

}


// ========================================
// CARD NOT FOUND
// ========================================

function showNotFound() {

    document.getElementById(
        "card-name"
    ).textContent =
        "Card not found";


    document.getElementById(
        "card-id"
    ).textContent =
        cardId || "No ID";


    document.getElementById(
        "card-image"
    ).style.display =
        "none";


    document.getElementById(
        "card-effect"
    ).textContent =
        "No card information available.";


    document.getElementById(
        "card-rulings"
    ).innerHTML =
        "<p>No rulings available.</p>";


    document.getElementById(
        "verification"
    ).innerHTML = `
        <div class="verification-icon">
            ✕
        </div>

        <div>
            <strong>CARD NOT FOUND</strong>

            <p>
                This card ID is not registered
                in the SCHACHICUSTOMS database.
            </p>
        </div>
    `;

}


// ========================================
// DATABASE ERROR
// ========================================

function showDatabaseError() {

    document.getElementById(
        "card-name"
    ).textContent =
        "Database Error";


    document.getElementById(
        "verification"
    ).innerHTML = `
        <div class="verification-icon">
            !
        </div>

        <div>
            <strong>DATABASE ERROR</strong>

            <p>
                The SCHACHICUSTOMS card database
                could not be loaded.
            </p>
        </div>
    `;

}


// ========================================
// START
// ========================================

loadCard();