// ========================================
// SCHACHICUSTOMS – CARD DATABASE
// ========================================


// ========================================
// GLOBAL VARIABLES
// ========================================

let databaseCards = [];

let currentSearch = "";

let currentFilter = "all";

let currentSort = "id-asc";


// ========================================
// ELEMENTS
// ========================================

const databaseGrid =
    document.getElementById(
        "database-grid"
    );

const databaseSearchInput =
    document.getElementById(
        "database-search-input"
    );

const databaseClearSearch =
    document.getElementById(
        "database-clear-search"
    );

const databaseResultCount =
    document.getElementById(
        "database-result-count"
    );

const databaseSort =
    document.getElementById(
        "database-sort"
    );

const databaseEmpty =
    document.getElementById(
        "database-empty"
    );

const databaseError =
    document.getElementById(
        "database-error"
    );

const databaseResetButton =
    document.getElementById(
        "database-reset-button"
    );

const filterButtons =
    document.querySelectorAll(
        ".database-filter-button"
    );


// ========================================
// HEADER SEARCH
// ========================================

const headerSearchForm =
    document.getElementById(
        "database-header-search-form"
    );

const headerSearchInput =
    document.getElementById(
        "database-header-search-input"
    );


// ========================================
// LOAD DATABASE
// ========================================

async function loadDatabase() {

    try {

        const response =
            await fetch(
                "cards.json"
            );


        if (!response.ok) {

            throw new Error(
                "Card database could not be loaded."
            );

        }


        const cards =
            await response.json();


        // ========================================
        // OBJECT → ARRAY
        // ========================================

        databaseCards =
            Object.entries(cards)
                .map(
                    ([id, card]) => {

                        return {
                            ...card,
                            id: card.id || id
                        };

                    }
                );


        // ========================================
        // FIRST RENDER
        // ========================================

        updateDatabase();


    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Database Error:",
            error
        );


        showDatabaseError();

    }

}


// ========================================
// UPDATE DATABASE
// ========================================

function updateDatabase() {

    let cards =
        [...databaseCards];


    // ========================================
    // SEARCH
    // ========================================

    if (
        currentSearch !== ""
    ) {

        cards =
            cards.filter(
                card => {

                    const name =
                        String(
                            card.name || ""
                        )
                            .toLowerCase();


                    const id =
                        String(
                            card.id || ""
                        )
                            .toLowerCase();


                    const type =
                        String(
                            card.type || ""
                        )
                            .toLowerCase();


                    const attribute =
                        String(
                            card.attribute || ""
                        )
                            .toLowerCase();


                    const aliases =
                        Array.isArray(
                            card.aliases
                        )
                            ? card.aliases
                                .join(" ")
                                .toLowerCase()
                            : "";


                    return (
                        name.includes(
                            currentSearch
                        ) ||
                        id.includes(
                            currentSearch
                        ) ||
                        type.includes(
                            currentSearch
                        ) ||
                        attribute.includes(
                            currentSearch
                        ) ||
                        aliases.includes(
                            currentSearch
                        )
                    );

                }
            );

    }


    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (
        currentFilter !== "all"
    ) {

        cards =
            cards.filter(
                card => {

                    return (
                        String(
                            card.category || ""
                        )
                            .toLowerCase() ===
                        currentFilter
                            .toLowerCase()
                    );

                }
            );

    }


    // ========================================
    // SORT
    // ========================================

    cards =
        sortCards(
            cards,
            currentSort
        );


    // ========================================
    // RESULT COUNT
    // ========================================

    updateResultCount(
        cards.length
    );


    // ========================================
    // CLEAR BUTTON
    // ========================================

    databaseClearSearch.hidden =
        currentSearch === "";


    // ========================================
    // EMPTY STATE
    // ========================================

    if (
        cards.length === 0
    ) {

        databaseGrid.innerHTML =
            "";

        databaseGrid.hidden =
            true;

        databaseEmpty.hidden =
            false;

        return;

    }


    databaseEmpty.hidden =
        true;

    databaseGrid.hidden =
        false;


    // ========================================
    // RENDER CARDS
    // ========================================

    renderCards(
        cards
    );

}


// ========================================
// RENDER CARDS
// ========================================

function renderCards(cards) {

    databaseGrid.innerHTML =
        "";


    cards.forEach(
        card => {

            const element =
                createCardElement(
                    card
                );


            databaseGrid.appendChild(
                element
            );

        }
    );

}


// ========================================
// CREATE CARD
// ========================================

function createCardElement(card) {

    const link =
        document.createElement(
            "a"
        );


    link.className =
        "database-card";


    link.href =
        "card.html?id=" +
        encodeURIComponent(
            card.id
        );


    // ========================================
    // IMAGE WRAPPER
    // ========================================

    const imageWrapper =
        document.createElement(
            "div"
        );


    imageWrapper.className =
        "database-card-image";


    // ========================================
    // IMAGE
    // ========================================

    const image =
        document.createElement(
            "img"
        );


    image.src =
        card.image || "";

    image.alt =
        card.name || "Card";

    image.loading =
        "lazy";


    imageWrapper.appendChild(
        image
    );


    // ========================================
    // NFC BADGE
    // ========================================

    if (
        card.custom &&
        card.custom.status ===
        "verified"
    ) {

        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "database-card-badge";


        badge.textContent =
            "NFC";


        imageWrapper.appendChild(
            badge
        );

    }


    // ========================================
    // CARD INFO
    // ========================================

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "database-card-info";


    // ========================================
    // TOP META
    // ========================================

    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "database-card-meta";


    const id =
        document.createElement(
            "span"
        );


    id.className =
        "database-card-id";


    id.textContent =
        card.id || "-";


    const category =
        document.createElement(
            "span"
        );


    category.className =
        "database-card-category";


    category.textContent =
        card.category ||
        "Card";


    meta.appendChild(
        id
    );

    meta.appendChild(
        category
    );


    // ========================================
    // CARD NAME
    // ========================================

    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        card.name ||
        "Unnamed Card";


    // ========================================
    // TYPE
    // ========================================

    const type =
        document.createElement(
            "p"
        );


    type.className =
        "database-card-type";


    type.textContent =
        getCardSubtitle(
            card
        );


    // ========================================
    // OPEN CARD
    // ========================================

    const open =
        document.createElement(
            "span"
        );


    open.className =
        "database-card-open";


    open.textContent =
        "VIEW CARD →";


    // ========================================
    // BUILD INFO
    // ========================================

    info.appendChild(
        meta
    );

    info.appendChild(
        title
    );

    info.appendChild(
        type
    );

    info.appendChild(
        open
    );


    // ========================================
    // BUILD CARD
    // ========================================

    link.appendChild(
        imageWrapper
    );

    link.appendChild(
        info
    );


    return link;

}


// ========================================
// CARD SUBTITLE
// ========================================

function getCardSubtitle(card) {

    const category =
        String(
            card.category || ""
        )
            .toLowerCase();


    // ========================================
    // MONSTER
    // ========================================

    if (
        category === "monster"
    ) {

        const parts =
            [];


        if (
            card.attribute
        ) {

            parts.push(
                card.attribute
            );

        }


        if (
            card.type
        ) {

            parts.push(
                card.type
            );

        }


        return parts.join(
            " · "
        );

    }


    // ========================================
    // SPELL / TRAP
    // ========================================

    if (
        card.type
    ) {

        return card.type;

    }


    return card.category ||
        "SCHACHICUSTOMS Card";

}


// ========================================
// SORT CARDS
// ========================================

function sortCards(
    cards,
    sortMode
) {

    const sorted =
        [...cards];


    switch (
        sortMode
    ) {

        // ========================================
        // ID ASCENDING
        // ========================================

        case "id-asc":

            sorted.sort(
                (a, b) =>
                    getNumericId(a.id) -
                    getNumericId(b.id)
            );

            break;


        // ========================================
        // ID DESCENDING
        // ========================================

        case "id-desc":

            sorted.sort(
                (a, b) =>
                    getNumericId(b.id) -
                    getNumericId(a.id)
            );

            break;


        // ========================================
        // NAME A-Z
        // ========================================

        case "name-asc":

            sorted.sort(
                (a, b) =>
                    String(
                        a.name || ""
                    )
                        .localeCompare(
                            String(
                                b.name || ""
                            )
                        )
            );

            break;


        // ========================================
        // NAME Z-A
        // ========================================

        case "name-desc":

            sorted.sort(
                (a, b) =>
                    String(
                        b.name || ""
                    )
                        .localeCompare(
                            String(
                                a.name || ""
                            )
                        )
            );

            break;

    }


    return sorted;

}


// ========================================
// GET NUMBER FROM SCO-ID
// ========================================

function getNumericId(id) {

    const match =
        String(
            id || ""
        )
            .match(
                /(\d+)/
            );


    if (!match) {

        return 999999;

    }


    return parseInt(
        match[1],
        10
    );

}


// ========================================
// RESULT COUNT
// ========================================

function updateResultCount(
    visibleCards
) {

    const totalCards =
        databaseCards.length;


    if (
        visibleCards === totalCards &&
        currentSearch === "" &&
        currentFilter === "all"
    ) {

        databaseResultCount.textContent =
            totalCards === 1
                ? "1 registered card"
                : totalCards +
                  " registered cards";

        return;

    }


    databaseResultCount.textContent =
        visibleCards +
        " of " +
        totalCards +
        " cards";

}


// ========================================
// DATABASE SEARCH
// ========================================

databaseSearchInput.addEventListener(
    "input",
    function () {

        currentSearch =
            databaseSearchInput.value
                .trim()
                .toLowerCase();


        updateDatabase();

    }
);


// ========================================
// CLEAR SEARCH
// ========================================

databaseClearSearch.addEventListener(
    "click",
    function () {

        databaseSearchInput.value =
            "";

        currentSearch =
            "";


        databaseSearchInput.focus();


        updateDatabase();

    }
);


// ========================================
// FILTER BUTTONS
// ========================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                currentFilter =
                    button.dataset.filter ||
                    "all";


                filterButtons.forEach(
                    filterButton => {

                        filterButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                updateDatabase();

            }
        );

    }
);


// ========================================
// SORT
// ========================================

databaseSort.addEventListener(
    "change",
    function () {

        currentSort =
            databaseSort.value;


        updateDatabase();

    }
);


// ========================================
// RESET DATABASE
// ========================================

databaseResetButton.addEventListener(
    "click",
    function () {

        currentSearch =
            "";

        currentFilter =
            "all";

        currentSort =
            "id-asc";


        databaseSearchInput.value =
            "";

        databaseSort.value =
            "id-asc";


        filterButtons.forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.filter ===
                    "all"
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


        updateDatabase();

    }
);


// ========================================
// HEADER SEARCH
// ========================================

headerSearchForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const query =
            headerSearchInput.value
                .trim()
                .toLowerCase();


        if (!query) {

            return;

        }


        const result =
            findCard(
                query
            );


        if (result) {

            window.location.href =
                "card.html?id=" +
                encodeURIComponent(
                    result.id
                );

            return;

        }


        // ========================================
        // NOTHING FOUND
        // USE DATABASE SEARCH INSTEAD
        // ========================================

        databaseSearchInput.value =
            headerSearchInput.value;


        currentSearch =
            query;


        updateDatabase();


        databaseSearchInput.scrollIntoView(
            {
                behavior: "smooth",
                block: "center"
            }
        );

    }
);


// ========================================
// FIND CARD
// ========================================

function findCard(query) {

    // ========================================
    // EXACT ID
    // ========================================

    const exactId =
        databaseCards.find(
            card =>
                String(
                    card.id || ""
                )
                    .toLowerCase() ===
                query
        );


    if (exactId) {

        return exactId;

    }


    // ========================================
    // ALIAS
    // ========================================

    const alias =
        databaseCards.find(
            card => {

                if (
                    !Array.isArray(
                        card.aliases
                    )
                ) {

                    return false;

                }


                return card.aliases.some(
                    item =>
                        String(item)
                            .toLowerCase() ===
                        query
                );

            }
        );


    if (alias) {

        return alias;

    }


    // ========================================
    // EXACT NAME
    // ========================================

    const exactName =
        databaseCards.find(
            card =>
                String(
                    card.name || ""
                )
                    .toLowerCase() ===
                query
        );


    if (exactName) {

        return exactName;

    }


    // ========================================
    // PARTIAL NAME
    // ========================================

    const partialName =
        databaseCards.find(
            card =>
                String(
                    card.name || ""
                )
                    .toLowerCase()
                    .includes(
                        query
                    )
        );


    if (
        partialName
    ) {

        return partialName;

    }


    return null;

}


// ========================================
// DATABASE ERROR
// ========================================

function showDatabaseError() {

    databaseGrid.innerHTML =
        "";

    databaseGrid.hidden =
        true;

    databaseEmpty.hidden =
        true;

    databaseError.hidden =
        false;

    databaseResultCount.textContent =
        "Database unavailable";

}


// ========================================
// START
// ========================================

loadDatabase();