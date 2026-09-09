// ========================================
// SCHACHICUSTOMS – CHAOS TURBO DECK
// ========================================

const chaosTurboMainDeckIds = [
    "SCO-002",
    "SCO-054", "SCO-054",
    "SCO-055", "SCO-055",
    "SCO-052", "SCO-052", "SCO-052",
    "SCO-056", "SCO-056",
    "SCO-059", "SCO-059",
    "SCO-057",
    "SCO-058",
    "SCO-053", "SCO-053", "SCO-053",
    "SCO-063",
    "SCO-065",
    "SCO-012",
    "SCO-060",
    "SCO-013",
    "SCO-014",
    "SCO-015",
    "SCO-016",
    "SCO-017", "SCO-017",
    "SCO-018",
    "SCO-021",
    "SCO-064", "SCO-064",
    "SCO-066", "SCO-066", "SCO-066",
    "SCO-024",
    "SCO-061", "SCO-061",
    "SCO-025",
    "SCO-028",
    "SCO-029"
];

const chaosTurboSideDeckIds = [
    "SCO-004",
    "SCO-033",
    "SCO-010", "SCO-010",
    "SCO-032",
    "SCO-036", "SCO-036",
    "SCO-067",
    "SCO-023",
    "SCO-061",
    "SCO-026", "SCO-026", "SCO-026",
    "SCO-029", "SCO-029"
];


async function loadChaosTurboDeck() {

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


        const mainDeck =
            chaosTurboMainDeckIds
                .map(
                    id => cards[id]
                )
                .filter(Boolean);

        const sideDeck =
            chaosTurboSideDeckIds
                .map(
                    id => cards[id]
                )
                .filter(Boolean);

        renderDeckList(
            mainDeck,
            "chaos-turbo-main-deck"
        );

        renderDeckList(
            sideDeck,
            "chaos-turbo-side-deck"
        );

        setupDeckSearch(cards);

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Chaos Turbo Deck Error:",
            error
        );

    }

}


function renderDeckList(deck, containerId) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        deck
            .map(
                card => `
                    <a
                        href="${window.SchachiCardUrl.create(card)}"
                        class="deck-card"
                        aria-label="Open ${escapeHtml(card.name)}"
                    >
                        <img
                            src="${escapeHtml(card.image)}"
                            alt="${escapeHtml(card.name)}"
                            loading="lazy"
                        >
                    </a>
                `
            )
            .join("");

}


function setupDeckSearch(cards) {

    const form =
        document.getElementById(
            "chaos-turbo-deck-search-form"
        );

    const input =
        document.getElementById(
            "chaos-turbo-deck-search-input"
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


            const result =
                Object.entries(cards)
                    .find(
                        ([id, card]) => {

                            return (
                                id.toLowerCase() === query ||
                                String(card.name || "")
                                    .toLowerCase()
                                    .includes(query) ||
                                (Array.isArray(card.aliases) &&
                                    card.aliases.some(
                                        alias =>
                                            String(alias)
                                                .toLowerCase() === query
                                    ))
                            );

                        }
                    );


            if (result) {
                window.location.href =
                    window.SchachiCardUrl.create(
                        result[1]
                    );
            }

        }
    );

}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadChaosTurboDeck();
