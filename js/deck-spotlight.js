// ========================================
// SCHACHICUSTOMS – DECK DIRECTORY
// ========================================

const deckCatalog = [
    {
        name: "Warrior Deck",
        url: "warrior-deck.html",
        description:
            "A complete GOAT Format Warrior list, presented through the original SCHACHICUSTOMS card archive.",
        status: "Decklist available",
        available: true,
        previewIds: [
            "SCO-002",
            "SCO-001", "SCO-001", "SCO-001",
            "SCO-027",
            "SCO-011",
            "SCO-003",
            "SCO-006",
            "SCO-007",
            "SCO-008"
        ]
    },
    {
        name: "GOAT Control",
        url: "goat-control-deck.html",
        description:
            "The deck page is ready for the upcoming SCHACHICUSTOMS GOAT Control list.",
        status: "In preparation",
        available: false,
        previewIds: []
    },
    {
        name: "Chaos Turbo",
        url: "chaos-turbo-deck.html",
        description:
            "A complete GOAT Format Chaos Turbo list, presented through the SCHACHICUSTOMS card archive.",
        status: "Decklist available",
        available: true,
        previewIds: [
            "SCO-054", "SCO-054",
            "SCO-053", "SCO-053", "SCO-053",
            "SCO-052", "SCO-052", "SCO-052",
            "SCO-063",
            "SCO-065"
        ]
    },
    {
        name: "Burn",
        url: "burn-deck.html",
        description:
            "The deck page is ready for the upcoming SCHACHICUSTOMS Burn list.",
        status: "In preparation",
        available: false,
        previewIds: []
    }
];


async function loadDeckSpotlight() {

    const spotlight =
        document.getElementById(
            "deck-spotlight"
        );


    if (!spotlight) {
        return;
    }


    try {

        const response =
            await fetch("cards.json");


        if (!response.ok) {
            throw new Error(
                "Could not load cards.json"
            );
        }


        const cards =
            await response.json();


        let activeIndex = 0;


        renderDeckSpotlight(
            deckCatalog[activeIndex],
            cards
        );


        window.setInterval(
            function () {

                spotlight.classList.add(
                    "is-switching"
                );


                window.setTimeout(
                    function () {

                        activeIndex =
                            (activeIndex + 1) %
                            deckCatalog.length;


                        renderDeckSpotlight(
                            deckCatalog[activeIndex],
                            cards
                        );


                        spotlight.classList.remove(
                            "is-switching"
                        );

                    },
                    180
                );

            },
            10000
        );

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Deck Spotlight Error:",
            error
        );

    }

}


function renderDeckSpotlight(deck, cards) {

    const title =
        document.getElementById(
            "deck-spotlight-title"
        );

    const description =
        document.getElementById(
            "deck-spotlight-description"
        );

    const preview =
        document.getElementById(
            "deck-spotlight-preview"
        );


    if (!title || !description || !preview) {
        return;
    }


    title.textContent = deck.name;
    description.textContent = deck.description;


    const previewCards =
        deck.previewIds
            .map(
                id => cards[id]
            )
            .filter(Boolean);


    preview.innerHTML =
        previewCards.length
            ? previewCards
                .map(
                    card => `
                        <img
                            src="${escapeDeckHtml(card.image)}"
                            alt=""
                            loading="lazy"
                        >
                    `
                )
                .join("")
            : renderPendingDeckPreview();

}


function renderPendingDeckPreview() {

    const tiles =
        Array.from(
            { length: 10 },
            function () {

                return `
                    <span
                        class="deck-preview-placeholder"
                    ></span>
                `;

            }
        )
            .join("");


    return `
        ${tiles}
        <span
            class="deck-preview-coming"
        >
            COMING SOON
        </span>
    `;

}


async function loadDeckDirectory() {

    const container =
        document.getElementById(
            "deck-directory-grid"
        );


    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("cards.json");


        if (!response.ok) {
            throw new Error(
                "Could not load cards.json"
            );
        }


        renderDeckDirectory(
            await response.json()
        );

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Deck Directory Error:",
            error
        );


        renderDeckDirectory({});

    }

}


function renderDeckDirectory(cards) {

    const container =
        document.getElementById(
            "deck-directory-grid"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        deckCatalog
            .map(
                deck => `
                    <a
                        href="${escapeDeckHtml(deck.url)}"
                        class="deck-directory-card"
                    >
                        <div class="deck-directory-content">
                            <span class="deck-directory-status">
                                ${escapeDeckHtml(deck.status)}
                            </span>

                            <h2>
                                ${escapeDeckHtml(deck.name)}
                            </h2>

                            <p>
                                ${escapeDeckHtml(deck.description)}
                            </p>

                            <span class="deck-directory-open">
                                ${deck.available
                                    ? "OPEN DECK"
                                    : "VIEW PAGE"} →
                            </span>
                        </div>

                        ${renderDeckDirectoryPreview(
                            deck,
                            cards
                        )}
                    </a>
                `
            )
            .join("");

}

function renderDeckDirectoryPreview(deck, cards) {

    const previewCards =
        deck.previewIds
            .map(
                id => cards[id]
            )
            .filter(Boolean)
            .slice(0, 5);


    if (!previewCards.length) {

        return `
            <div
                class="deck-directory-preview is-pending"
                aria-hidden="true"
            >
                <span>DECKLIST<br>IN PREPARATION</span>
            </div>
        `;

    }


    return `
        <div
            class="deck-directory-preview"
            aria-hidden="true"
        >
            ${previewCards
                .map(
                    card => `
                        <img
                            src="${escapeDeckHtml(card.image)}"
                            alt=""
                            loading="lazy"
                        >
                    `
                )
                .join("")}
        </div>
    `;

}


function escapeDeckHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadDeckSpotlight();
loadDeckDirectory();
