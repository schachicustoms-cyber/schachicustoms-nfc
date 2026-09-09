// ========================================
// SCHACHICUSTOMS – WARRIOR DECK
// ========================================

const warriorMainDeckIds = [
    "SCO-002",
    "SCO-001", "SCO-001", "SCO-001",
    "SCO-004",
    "SCO-011",
    "SCO-003",
    "SCO-006",
    "SCO-007",
    "SCO-008", "SCO-008",
    "SCO-009",
    "SCO-030", "SCO-030",
    "SCO-013",
    "SCO-014",
    "SCO-015",
    "SCO-016",
    "SCO-017", "SCO-017",
    "SCO-018",
    "SCO-019",
    "SCO-020", "SCO-020",
    "SCO-021",
    "SCO-022",
    "SCO-023", "SCO-023", "SCO-023",
    "SCO-024",
    "SCO-025",
    "SCO-026", "SCO-026", "SCO-026",
    "SCO-027", "SCO-027", "SCO-027",
    "SCO-028",
    "SCO-029", "SCO-029"
];

const warriorSideDeckIds = [
    "SCO-005",
    "SCO-031", "SCO-031",
    "SCO-033",
    "SCO-037",
    "SCO-010",
    "SCO-012",
    "SCO-038",
    "SCO-032", "SCO-032",
    "SCO-036", "SCO-036",
    "SCO-035",
    "SCO-029",
    "SCO-034"
];


async function loadWarriorDeck() {

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
            warriorMainDeckIds
                .map(
                    id => cards[id]
                )
                .filter(Boolean);

        const sideDeck =
            warriorSideDeckIds
                .map(
                    id => cards[id]
                )
                .filter(Boolean);

        renderDeckPreview(mainDeck);

        renderDeckList(
            mainDeck,
            "warrior-main-deck"
        );

        renderDeckList(
            sideDeck,
            "warrior-side-deck"
        );

        setupDeckSearch(cards);

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Warrior Deck Error:",
            error
        );

    }

}


function renderDeckPreview(deck) {

    const preview =
        document.getElementById(
            "warrior-deck-preview"
        );


    if (!preview) {
        return;
    }


    preview.innerHTML =
        deck
            .slice(0, 10)
            .map(
                card => `
                    <img
                        src="${escapeHtml(card.image)}"
                        alt=""
                        loading="lazy"
                    >
                `
            )
            .join("");

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
                        href="card.html?id=${encodeURIComponent(card.id)}"
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
            "warrior-deck-search-form"
        );

    const input =
        document.getElementById(
            "warrior-deck-search-input"
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
                    "card.html?id=" +
                    encodeURIComponent(result[0]);
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


loadWarriorDeck();
