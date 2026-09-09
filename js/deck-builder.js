const MAX_DECK_CARDS = 55;
const MAX_COPIES_PER_CARD = 3;
const CUSTOM_DECK_PRICE = 99;
const DECK_STORAGE_KEY = "schachicustoms-custom-deck-v1";

const builderState = {
    cards: [],
    cardsById: new Map(),
    deck: new Map(),
    query: "",
    category: "all"
};

const builderElements = {
    search: document.getElementById("deck-builder-search"),
    filters: document.querySelector(".deck-builder-filters"),
    results: document.getElementById("deck-builder-results"),
    catalog: document.getElementById("deck-builder-card-grid"),
    count: document.getElementById("deck-builder-count"),
    meter: document.querySelector(".deck-builder-meter"),
    meterFill: document.getElementById("deck-builder-meter-fill"),
    items: document.getElementById("deck-builder-items"),
    total: document.getElementById("deck-builder-total"),
    mobileCount: document.getElementById("deck-builder-mobile-count"),
    mobileTotal: document.getElementById("deck-builder-mobile-total"),
    addToCart: document.getElementById("deck-builder-add-to-cart"),
    copy: document.getElementById("deck-builder-copy"),
    clear: document.getElementById("deck-builder-clear"),
    status: document.getElementById("deck-builder-status")
};

async function loadDeckBuilder() {
    try {
        const response = await fetch("cards.json");

        if (!response.ok) {
            throw new Error("Card database could not be loaded.");
        }

        const data = await response.json();

        builderState.cards = Object.values(data)
            .filter(
                card =>
                    card.shop &&
                    card.shop.available &&
                    !isFusionMonster(card)
            )
            .sort((first, second) => first.name.localeCompare(second.name));

        builderState.cardsById = new Map(
            builderState.cards.map(card => [card.id, card])
        );

        restoreDeck();
        setupDeckBuilder();
        renderDeckBuilder();
    } catch (error) {
        console.error("SCHACHICUSTOMS deck builder:", error);
        builderElements.catalog.innerHTML = `
            <p class="deck-builder-error">
                The card archive could not be loaded. Please try again later.
            </p>
        `;
        setBuilderStatus("The card archive is unavailable right now.");
    }
}

function setupDeckBuilder() {
    builderElements.search.addEventListener("input", event => {
        builderState.query = event.target.value.trim().toLowerCase();
        renderCatalog();
    });

    builderElements.filters.addEventListener("click", event => {
        const button = event.target.closest("[data-category]");

        if (!button) {
            return;
        }

        builderState.category = button.dataset.category;

        builderElements.filters
            .querySelectorAll("[data-category]")
            .forEach(filter => {
                filter.classList.toggle(
                    "active",
                    filter.dataset.category === builderState.category
                );
            });

        renderCatalog();
    });

    builderElements.catalog.addEventListener("click", event => {
        const button = event.target.closest("[data-add-card]");

        if (button) {
            addCard(button.dataset.addCard);
        }
    });

    builderElements.items.addEventListener("click", event => {
        const button = event.target.closest("[data-deck-action]");

        if (!button) {
            return;
        }

        const cardId = button.dataset.cardId;

        if (button.dataset.deckAction === "increase") {
            addCard(cardId);
        }

        if (button.dataset.deckAction === "decrease") {
            removeCard(cardId);
        }
    });

    builderElements.copy.addEventListener("click", copyDeckList);
    builderElements.clear.addEventListener("click", clearDeck);
    builderElements.addToCart.addEventListener("click", addCustomDeckToCart);
}

function renderDeckBuilder() {
    renderCatalog();
    renderDeckSummary();
}

function renderCatalog() {
    const visibleCards = builderState.cards.filter(card => {
        const matchesCategory =
            builderState.category === "all" ||
            card.category === builderState.category;

        const haystack = [
            card.id,
            card.name,
            card.category,
            card.type,
            card.attribute
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return matchesCategory && haystack.includes(builderState.query);
    });

    builderElements.results.textContent =
        `${visibleCards.length} available ${visibleCards.length === 1 ? "card" : "cards"}`;

    if (visibleCards.length === 0) {
        builderElements.catalog.innerHTML = `
            <p class="deck-builder-empty">
                No cards match that search. Try a different card name, SCO-ID or category.
            </p>
        `;
        return;
    }

    const deckIsFull = getDeckCardCount() >= MAX_DECK_CARDS;

    builderElements.catalog.innerHTML = visibleCards
        .map(card => {
            const selectedQuantity = builderState.deck.get(card.id) || 0;
            const subtitle = getCardSubtitle(card);
            const cardLimitReached =
                selectedQuantity >= MAX_COPIES_PER_CARD;

            return `
                <article class="deck-builder-card">
                    <a class="deck-builder-card-image" href="${window.SchachiCardUrl.create(card)}">
                        <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}" loading="lazy">
                    </a>
                    <div class="deck-builder-card-info">
                        <span>${escapeHtml(card.id)}</span>
                        <h3><a href="${window.SchachiCardUrl.create(card)}">${escapeHtml(card.name)}</a></h3>
                        <p>${escapeHtml(subtitle)}</p>
                        <div class="deck-builder-card-footer">
                            <strong>INCLUDED</strong>
                            <button
                                type="button"
                                class="deck-builder-add"
                                data-add-card="${escapeHtml(card.id)}"
                                ${deckIsFull || cardLimitReached ? "disabled" : ""}
                                aria-label="Add ${escapeHtml(card.name)} to deck"
                            >
                                ${cardLimitReached ? "MAX 3" : selectedQuantity ? `ADD · ${selectedQuantity}` : "ADD"}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");
}

function renderDeckSummary() {
    const entries = getDeckEntries();
    const cardCount = getDeckCardCount();
    const total = getDeckTotal(entries);

    builderElements.count.textContent = `${cardCount} / ${MAX_DECK_CARDS} CARDS`;
    builderElements.mobileCount.textContent = `${cardCount} / ${MAX_DECK_CARDS} CARDS`;
    builderElements.meter.setAttribute("aria-valuenow", String(cardCount));
    builderElements.meterFill.style.width = `${(cardCount / MAX_DECK_CARDS) * 100}%`;
    builderElements.total.textContent = formatPrice(total);
    builderElements.mobileTotal.textContent = formatPrice(total);
    builderElements.clear.disabled = cardCount === 0;
    builderElements.copy.disabled = cardCount === 0;
    builderElements.addToCart.disabled = cardCount === 0;

    if (entries.length === 0) {
        builderElements.items.innerHTML = `
            <p class="deck-builder-empty">
                Your deck is empty. Add cards from the archive to begin.
            </p>
        `;
        return;
    }

    builderElements.items.innerHTML = entries
        .map(({ card, quantity }) => `
            <article class="deck-builder-item">
                <img src="${escapeHtml(card.image)}" alt="">
                <div>
                    <a href="${window.SchachiCardUrl.create(card)}">${escapeHtml(card.name)}</a>
                    <span>${escapeHtml(card.id)} · included in the fixed deck price</span>
                </div>
                <div class="deck-builder-stepper" aria-label="${escapeHtml(card.name)} quantity">
                    <button type="button" data-deck-action="decrease" data-card-id="${escapeHtml(card.id)}" aria-label="Remove one ${escapeHtml(card.name)}">−</button>
                    <strong>${quantity}</strong>
                    <button type="button" data-deck-action="increase" data-card-id="${escapeHtml(card.id)}" aria-label="Add one ${escapeHtml(card.name)}" ${cardCount >= MAX_DECK_CARDS || quantity >= MAX_COPIES_PER_CARD ? "disabled" : ""}>+</button>
                </div>
            </article>
        `)
        .join("");
}

function addCard(cardId) {
    const card = builderState.cardsById.get(cardId);

    if (!card) {
        return;
    }

    const currentQuantity = builderState.deck.get(cardId) || 0;

    if (currentQuantity >= MAX_COPIES_PER_CARD) {
        setBuilderStatus(`${card.name} is limited to ${MAX_COPIES_PER_CARD} copies per custom deck.`);
        return;
    }

    if (getDeckCardCount() >= MAX_DECK_CARDS) {
        setBuilderStatus(`Your deck already has the maximum of ${MAX_DECK_CARDS} cards.`);
        return;
    }

    builderState.deck.set(cardId, currentQuantity + 1);
    persistDeck();
    renderDeckBuilder();
    setBuilderStatus(`${card.name} added to your deck.`);
}

function removeCard(cardId) {
    const quantity = builderState.deck.get(cardId) || 0;

    if (quantity <= 1) {
        builderState.deck.delete(cardId);
    } else {
        builderState.deck.set(cardId, quantity - 1);
    }

    persistDeck();
    renderDeckBuilder();
}

function clearDeck() {
    if (
        getDeckCardCount() === 0 ||
        !window.confirm("Clear every card from your custom deck?")
    ) {
        return;
    }

    builderState.deck.clear();
    persistDeck();
    renderDeckBuilder();
    setBuilderStatus("Your custom deck has been cleared.");
}

function addCustomDeckToCart() {
    const entries = getDeckEntries();
    const cardCount = getDeckCardCount();
    const selectedNfcOption =
        document.querySelector(
            "[data-custom-deck-nfc-option]:checked"
        );
    const withNfc =
        !selectedNfcOption ||
        selectedNfcOption.value === "nfc";
    const nfcLabel =
        withNfc
            ? "With NFC tag"
            : "Without NFC tag";

    if (!entries.length || !window.SchachiCart) {
        setBuilderStatus("Add at least one card before adding this deck to the cart.");
        return;
    }

    const deckSignature = entries
        .map(entry => entry.card.id + ":" + entry.quantity)
        .join("|");

    const result = window.SchachiCart.add({
        id: "custom-deck:" +
            deckSignature +
            ":" +
            (
                withNfc
                    ? "nfc"
                    : "without-nfc"
            ),
        name: "Custom Deck",
        price: CUSTOM_DECK_PRICE,
        url: "custom-deck.html",
        details: String(cardCount) +
            " cards · custom selection · " +
            nfcLabel,
        orderDetails: entries
            .map(
                entry =>
                    entry.quantity +
                    "x " +
                    entry.card.name +
                    " (" +
                    entry.card.id +
                    ")"
            )
            .join(", ") +
            " · " +
            nfcLabel,
        maxQuantity: 1
    });

    if (result.added) {
        builderState.deck.clear();
        persistDeck();
        renderDeckBuilder();
        setBuilderStatus("Your custom deck has been added to the cart. Start your next deck whenever you are ready.");
        return;
    }

    setBuilderStatus("This exact custom deck is already in your cart.");
}

async function copyDeckList() {
    if (getDeckCardCount() === 0) {
        setBuilderStatus("Add at least one card before copying your deck list.");
        return;
    }

    const deckText = createDeckListText();
    let copied = false;

    try {
        await navigator.clipboard.writeText(deckText);
        copied = true;
    } catch (error) {
        const fallback = document.createElement("textarea");
        fallback.value = deckText;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        copied = document.execCommand("copy");
        fallback.remove();
    }

    setBuilderStatus(
        copied
            ? "Deck list copied. You can keep it for your custom deck order."
            : "Your deck list could not be copied automatically."
    );
}

function createDeckListText() {
    const entries = getDeckEntries();

    return [
        "SCHACHICUSTOMS CUSTOM DECK",
        "",
        ...entries.map(
            entry =>
                entry.quantity +
                "x " +
                entry.card.name +
                " (" +
                entry.card.id +
                ")"
        ),
        "",
        `Cards: ${getDeckCardCount()} / ${MAX_DECK_CARDS}`,
        `Total: ${formatPrice(getDeckTotal(entries))}`
    ].join("\n");
}

function getDeckEntries() {
    return Array.from(builderState.deck.entries())
        .map(([id, quantity]) => ({
            card: builderState.cardsById.get(id),
            quantity
        }))
        .filter(entry => entry.card && entry.quantity > 0)
        .sort((first, second) => first.card.name.localeCompare(second.card.name));
}

function getDeckTotal(entries) {
    return entries.length
        ? CUSTOM_DECK_PRICE
        : 0;
}

function restoreDeck() {
    try {
        const savedDeck = JSON.parse(
            window.localStorage.getItem(DECK_STORAGE_KEY) || "{}"
        );

        Object.entries(savedDeck).forEach(([id, quantity]) => {
            const validQuantity = Math.min(
                MAX_COPIES_PER_CARD,
                Math.max(0, Math.floor(Number(quantity) || 0))
            );

            if (builderState.cardsById.has(id) && validQuantity > 0) {
                builderState.deck.set(id, validQuantity);
            }
        });

        trimDeckToMaximum();

        persistDeck();
    } catch (error) {
        builderState.deck.clear();
    }
}

function persistDeck() {
    window.localStorage.setItem(
        DECK_STORAGE_KEY,
        JSON.stringify(Object.fromEntries(builderState.deck))
    );
}

function trimDeckToMaximum() {
    let remainingSlots = MAX_DECK_CARDS;

    builderState.deck.forEach((quantity, id) => {
        const nextQuantity = Math.min(quantity, remainingSlots);

        if (nextQuantity > 0) {
            builderState.deck.set(id, nextQuantity);
            remainingSlots -= nextQuantity;
        } else {
            builderState.deck.delete(id);
        }
    });
}

function getDeckCardCount() {
    return Array.from(builderState.deck.values())
        .reduce((sum, quantity) => sum + quantity, 0);
}

function getCardPrice(card) {
    return Number.parseFloat(card.shop?.price) || 0;
}

function isFusionMonster(card) {
    return (
        String(card.category || "").toLowerCase() === "monster" &&
        String(card.type || "").toLowerCase().includes("fusion")
    );
}

function getCardSubtitle(card) {
    if (card.category === "Monster") {
        return [card.attribute, card.type].filter(Boolean).join(" · ");
    }

    return card.type || card.category || "";
}

function formatPrice(price) {
    return `€${price.toFixed(2)}`;
}

function setBuilderStatus(message) {
    builderElements.status.textContent = message;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadDeckBuilder();
