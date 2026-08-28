// ========================================
// SCHACHICUSTOMS – NFC CARD SYSTEM
// ========================================


// ========================================
// URL PARAMETER
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const requestedCardId =
    params.get("id");


// ========================================
// CARD DATABASE LADEN
// ========================================

async function loadCard() {

    try {

        const response =
            await fetch("cards.json");

        if (!response.ok) {

            throw new Error(
                "Database could not be loaded."
            );

        }

        const cards =
            await response.json();


        // ========================================
        // SUCHEN, WELCHE KARTE ANGEFORDERT WURDE
        // ========================================

        const result =
            findCardByIdOrAlias(
                cards,
                requestedCardId
            );


        // Keine Karte gefunden
        if (!result) {

            showNotFound();

            setupSearch(cards);

            return;

        }


        const card =
            result.card;

        const realId =
            result.id;


        // ========================================
        // ALTE IDs AUF NEUE ID UMLEITEN
        // ========================================

        if (
            requestedCardId &&
            requestedCardId.toLowerCase() !==
            realId.toLowerCase()
        ) {

            const newUrl =
                "card.html?id=" +
                encodeURIComponent(realId);

            window.history.replaceState(
                {},
                "",
                newUrl
            );

        }


        // ========================================
        // KARTE LADEN
        // ========================================

        renderCard(card);

        renderRulings(
            card.rulings
        );

        renderVerification(
            card
        );

        renderShop(
            card
        );

        renderSources(
            card
        );

        renderCommunity(
            card
        );


        // ========================================
        // SUCHE
        // ========================================

        setupSearch(
            cards
        );


        // ========================================
        // BROWSER TITEL
        // ========================================

        document.title =
            card.name +
            " | SCHACHICUSTOMS";


    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Database Error:",
            error
        );

        showDatabaseError();

    }

}


// ========================================
// KARTE NACH ID ODER ALIAS FINDEN
// ========================================

function findCardByIdOrAlias(
    cards,
    requestedId
) {

    if (!requestedId) {

        return null;

    }


    const query =
        requestedId
            .trim()
            .toLowerCase();


    // ========================================
    // DIREKTE HAUPT-ID
    // ========================================

    for (
        const [id, card]
        of Object.entries(cards)
    ) {

        if (
            id.toLowerCase() === query
        ) {

            return {
                id: id,
                card: card
            };

        }

    }


    // ========================================
    // ALIAS SUCHEN
    // z.B. BK001 → SCO-001
    // ========================================

    for (
        const [id, card]
        of Object.entries(cards)
    ) {

        if (
            Array.isArray(card.aliases)
        ) {

            const aliasMatch =
                card.aliases.some(
                    alias =>
                        alias
                            .toLowerCase() ===
                        query
                );


            if (aliasMatch) {

                return {
                    id: id,
                    card: card
                };

            }

        }

    }


    return null;

}


// ========================================
// BASISDATEN RENDERN
// ========================================

function renderCard(card) {

    setText(
        "card-name",
        card.name
    );

    setText(
        "card-id",
        card.id
    );


    const image =
        document.getElementById(
            "card-image"
        );

    image.src =
        card.image;

    image.alt =
        card.name;


    setText(
        "card-attribute",
        card.attribute
    );

    setText(
        "card-level",
        card.level
    );

    setText(
        "card-type",
        card.type
    );

    setText(
        "card-atk",
        card.atk
    );

    setText(
        "card-def",
        card.def
    );


    setText(
        "card-effect",
        card.effect ||
        "No effect information available."
    );

}


// ========================================
// RULINGS
// ========================================

function renderRulings(rulings) {

    const container =
        document.getElementById(
            "card-rulings"
        );


    container.innerHTML =
        "";


    if (
        !Array.isArray(rulings) ||
        rulings.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );

        empty.className =
            "no-rulings";

        empty.textContent =
            "No rulings available.";

        container.appendChild(
            empty
        );

        return;

    }


    rulings.forEach(
        ruling => {

            // ========================================
            // WRAPPER
            // ========================================

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "ruling-dropdown";


            // ========================================
            // BUTTON
            // ========================================

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "ruling-toggle";

            button.type =
                "button";

            button.setAttribute(
                "aria-expanded",
                "false"
            );


            // ========================================
            // TITEL
            // ========================================

            const title =
                document.createElement(
                    "span"
                );

            title.className =
                "ruling-title";

            title.textContent =
                ruling.title;


            // ========================================
            // PLUS / MINUS
            // ========================================

            const icon =
                document.createElement(
                    "span"
                );

            icon.className =
                "ruling-icon";

            icon.textContent =
                "+";


            button.appendChild(
                title
            );

            button.appendChild(
                icon
            );


            // ========================================
            // TEXT
            // ========================================

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "ruling-content";

            content.hidden =
                true;


            const text =
                document.createElement(
                    "p"
                );

            text.textContent =
                ruling.text;


            content.appendChild(
                text
            );


            // ========================================
            // DROPDOWN FUNKTION
            // ========================================

            button.addEventListener(
                "click",
                function () {

                    const isOpen =
                        button.getAttribute(
                            "aria-expanded"
                        ) ===
                        "true";


                    button.setAttribute(
                        "aria-expanded",
                        String(!isOpen)
                    );


                    content.hidden =
                        isOpen;


                    icon.textContent =
                        isOpen
                            ? "+"
                            : "−";


                    button.classList.toggle(
                        "active",
                        !isOpen
                    );

                }
            );


            item.appendChild(
                button
            );

            item.appendChild(
                content
            );

            container.appendChild(
                item
            );

        }
    );

}


// ========================================
// NFC VERIFICATION
// ========================================

function renderVerification(card) {

    const verification =
        document.getElementById(
            "verification"
        );


    if (
        card.custom &&
        card.custom.status ===
        "verified"
    ) {

        verification.innerHTML = `
            <div class="verification-icon">
                ✓
            </div>

            <div>
                <strong>
                    NFC VERIFIED
                </strong>

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
                <strong>
                    DATABASE ENTRY
                </strong>

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
        document.getElementById(
            "shop-box"
        );

    const shopCardName =
        document.getElementById(
            "shop-card-name"
        );

    const shopPrice =
        document.getElementById(
            "shop-price"
        );

    const shopLink =
        document.getElementById(
            "shop-link"
        );

    const comingSoon =
        document.getElementById(
            "shop-coming-soon"
        );


    // Standardwerte
    shopBox.hidden =
        true;

    shopLink.hidden =
        true;

    comingSoon.hidden =
        true;


    if (
        !card.shop ||
        !card.shop.available
    ) {

        return;

    }


    // Shop anzeigen
    shopBox.hidden =
        false;


    // Kartenname
    shopCardName.textContent =
        card.name;


    // Preis
    if (
        card.shop.price
    ) {

        shopPrice.textContent =
            "€" +
            card.shop.price;

    } else {

        shopPrice.textContent =
            "Price unavailable";

    }


    // ========================================
    // SHOP URL EXISTIERT
    // ========================================

    if (
        card.shop.url &&
        card.shop.url.trim() !==
        ""
    ) {

        shopLink.href =
            card.shop.url;

        shopLink.hidden =
            false;

        comingSoon.hidden =
            true;

    }

    // ========================================
    // NOCH KEINE SHOP URL
    // ========================================

    else {

        shopLink.hidden =
            true;

        comingSoon.hidden =
            false;

    }

}


// ========================================
// SOURCES
// ========================================

function renderSources(card) {

    const section =
        document.getElementById(
            "sources-section"
        );

    const container =
        document.getElementById(
            "card-sources"
        );


    container.innerHTML =
        "";


    if (
        !Array.isArray(card.sources) ||
        card.sources.length === 0
    ) {

        section.hidden =
            true;

        return;

    }


    section.hidden =
        false;


    card.sources.forEach(
        source => {

            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "resource-link";

            link.href =
                source.url;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";


            link.innerHTML = `
                <div>

                    <strong>
                        ${escapeHtml(source.name)}
                    </strong>

                    <p>
                        Further GOAT Format rulings
                        and resources.
                    </p>

                </div>

                <span>
                    ↗
                </span>
            `;


            container.appendChild(
                link
            );

        }
    );

}


// ========================================
// COMMUNITY
// ========================================

function renderCommunity(card) {

    const whatsapp =
        document.getElementById(
            "whatsapp-link"
        );


    whatsapp.hidden =
        true;


    if (
        !card.community
    ) {

        return;

    }


    if (
        card.community.whatsapp &&
        card.community.whatsapp.trim() !==
        ""
    ) {

        whatsapp.href =
            card.community.whatsapp;

        whatsapp.target =
            "_blank";

        whatsapp.rel =
            "noopener noreferrer";

        whatsapp.hidden =
            false;

    }

}


// ========================================
// SEARCH
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


    if (
        !form ||
        !input
    ) {

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


            // ========================================
            // HAUPT-ID SUCHEN
            // ========================================

            for (
                const [id, card]
                of Object.entries(cards)
            ) {

                if (
                    id.toLowerCase() ===
                    query
                ) {

                    openCard(
                        id
                    );

                    return;

                }

            }


            // ========================================
            // ALIAS SUCHEN
            // ========================================

            for (
                const [id, card]
                of Object.entries(cards)
            ) {

                if (
                    Array.isArray(
                        card.aliases
                    )
                ) {

                    const match =
                        card.aliases.some(
                            alias =>
                                alias
                                    .toLowerCase() ===
                                query
                        );


                    if (match) {

                        openCard(
                            id
                        );

                        return;

                    }

                }

            }


            // ========================================
            // EXAKTER KARTENNAME
            // ========================================

            const exactName =
                Object.entries(cards)
                    .find(
                        ([id, card]) =>
                            card.name
                                .toLowerCase() ===
                            query
                    );


            if (exactName) {

                openCard(
                    exactName[0]
                );

                return;

            }


            // ========================================
            // TEILWEISER KARTENNAME
            // ========================================

            const partialName =
                Object.entries(cards)
                    .find(
                        ([id, card]) =>
                            card.name
                                .toLowerCase()
                                .includes(query)
                    );


            if (partialName) {

                openCard(
                    partialName[0]
                );

                return;

            }


            // ========================================
            // KEIN TREFFER
            // ========================================

            alert(
                "No card found for: " +
                input.value
            );

        }
    );

}


// ========================================
// CARD ÖFFNEN
// ========================================

function openCard(id) {

    window.location.href =
        "card.html?id=" +
        encodeURIComponent(id);

}


// ========================================
// CARD NOT FOUND
// ========================================

function showNotFound() {

    setText(
        "card-name",
        "Card not found"
    );


    setText(
        "card-id",
        requestedCardId ||
        "No ID"
    );


    const image =
        document.getElementById(
            "card-image"
        );

    image.style.display =
        "none";


    const shopBox =
        document.getElementById(
            "shop-box"
        );

    shopBox.hidden =
        true;


    setText(
        "card-effect",
        "No card information available."
    );


    document.getElementById(
        "card-rulings"
    ).innerHTML =
        "<p class=\"no-rulings\">No rulings available.</p>";


    const sources =
        document.getElementById(
            "sources-section"
        );

    sources.hidden =
        true;


    document.getElementById(
        "verification"
    ).innerHTML = `
        <div class="verification-icon">
            ✕
        </div>

        <div>
            <strong>
                CARD NOT FOUND
            </strong>

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

    setText(
        "card-name",
        "Database Error"
    );


    document.getElementById(
        "verification"
    ).innerHTML = `
        <div class="verification-icon">
            !
        </div>

        <div>
            <strong>
                DATABASE ERROR
            </strong>

            <p>
                The SCHACHICUSTOMS card database
                could not be loaded.
            </p>
        </div>
    `;

}


// ========================================
// HELPER: TEXT SETZEN
// ========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value ?? "-";

}


// ========================================
// HELPER: HTML ESCAPEN
// ========================================

function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ========================================
// START
// ========================================

loadCard();