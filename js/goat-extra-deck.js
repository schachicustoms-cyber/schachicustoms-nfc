// ========================================
// SCHACHICUSTOMS – GOAT FUSION DECK
// ========================================

const goatExtraDeckIds = [
    "SCO-039",
    "SCO-039",
    "SCO-039",
    "SCO-040",
    "SCO-041",
    "SCO-042",
    "SCO-043",
    "SCO-044",
    "SCO-045",
    "SCO-046",
    "SCO-047",
    "SCO-048",
    "SCO-049",
    "SCO-050",
    "SCO-051"
];


async function loadGoatExtraDeck() {

    try {

        const response = await fetch("cards.json");


        if (!response.ok) {
            throw new Error("Could not load cards.json");
        }


        const cards = await response.json();

        const deck = goatExtraDeckIds
            .map(id => cards[id])
            .filter(Boolean);

        renderGoatExtraDeck(deck);

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS GOAT Fusion Deck Error:",
            error
        );

    }

}


function renderGoatExtraDeck(deck) {

    const container =
        document.getElementById("goat-extra-deck-list");


    if (!container) {
        return;
    }


    container.innerHTML = deck
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


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadGoatExtraDeck();
