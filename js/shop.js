// ========================================
// SCHACHICUSTOMS – SHOP CATALOG
// ========================================

const shopCatalogGrid =
    document.getElementById(
        "shop-single-card-grid"
    );

const shopCatalogCount =
    document.getElementById(
        "shop-single-card-count"
    );

const shopCatalogSearch =
    document.getElementById(
        "shop-single-card-search"
    );

const shopCatalogFilterButtons =
    document.querySelectorAll(
        "[data-shop-card-filter]"
    );

let shopCards = [];

let currentShopSearch = "";

let currentShopFilter = "all";


async function loadShopCatalog() {

    if (!shopCatalogGrid) {
        return;
    }


    try {

        const response =
            await fetch("cards.json");


        if (!response.ok) {
            throw new Error(
                "Shop catalog could not be loaded."
            );
        }


        shopCards =
            Object.values(
                await response.json()
            )
                .filter(
                    card =>
                        card.shop &&
                        card.shop.available
                )
                .sort(
                    (first, second) =>
                        first.name.localeCompare(
                            second.name
                        )
                );


        updateShopCatalog();

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Shop Error:",
            error
        );

        shopCatalogGrid.innerHTML =
            '<p class="shop-catalog-error">The card catalog could not be loaded. Please try again later.</p>';

        if (shopCatalogCount) {
            shopCatalogCount.textContent =
                "Catalog unavailable";
        }

    }

}


function updateShopCatalog() {

    const filteredCards =
        shopCards.filter(
            card =>
                cardMatchesShopSearch(card) &&
                cardMatchesShopFilter(card)
        );


    renderShopCatalog(
        filteredCards
    );

}


function cardMatchesShopSearch(card) {

    if (currentShopSearch === "") {
        return true;
    }


    const searchableValues = [
        card.name,
        card.id,
        card.category,
        card.type,
        card.attribute,
        Array.isArray(card.aliases)
            ? card.aliases.join(" ")
            : ""
    ];


    return searchableValues.some(
        value =>
            String(value || "")
                .toLowerCase()
                .includes(currentShopSearch)
    );

}


function cardMatchesShopFilter(card) {

    if (currentShopFilter === "all") {
        return true;
    }


    const category =
        String(
            card.category || ""
        )
            .toLowerCase();

    const type =
        String(
            card.type || ""
        )
            .toLowerCase();


    if (currentShopFilter === "fusion") {

        return (
            category === "monster" &&
            type.includes("fusion")
        );

    }


    return (
        category ===
        currentShopFilter.toLowerCase()
    );

}


function renderShopCatalog(cards) {

    shopCatalogCount.textContent =
        currentShopSearch !== "" ||
        currentShopFilter !== "all"
            ? cards.length +
                " of " +
                shopCards.length +
                " cards available"
            : shopCards.length +
                (
                    shopCards.length === 1
                        ? " card available"
                        : " cards available"
                );


    if (cards.length === 0) {

        shopCatalogGrid.innerHTML =
            '<p class="shop-catalog-empty">No single cards match your search or selected filter.</p>';

        return;

    }


    shopCatalogGrid.innerHTML =
        cards
            .map(renderShopCard)
            .join("");

}


function renderShopCard(card) {

    const cardId =
        escapeShopHtml(card.id);

    const cardName =
        escapeShopHtml(card.name);

    const cardImage =
        escapeShopHtml(card.image);

    const cardUrl =
        window.SchachiCardUrl.create(
            card
        );

    const cardPrice =
        Number.parseFloat(
            card.shop.price
        );


    return '<article class="shop-catalog-card">' +
        '<a href="' +
            cardUrl +
            '" class="shop-catalog-image">' +
            '<img src="' +
                cardImage +
                '" alt="' +
                cardName +
                '" loading="lazy">' +
        "</a>" +
        '<div class="shop-catalog-info">' +
            '<span>' +
                cardId +
            "</span>" +
            "<h3>" +
                '<a href="' +
                    cardUrl +
                    '">' +
                    cardName +
                "</a>" +
            "</h3>" +
            '<div class="shop-catalog-footer">' +
                "<strong>" +
                    formatShopPrice(cardPrice) +
                "</strong>" +
                '<button type="button" class="shop-catalog-add" data-cart-add data-cart-id="card:' +
                    cardId +
                    '" data-cart-name="' +
                    cardName +
                    '" data-cart-price="' +
                    cardPrice +
                    '" data-cart-image="' +
                    cardImage +
                    '" data-cart-url="' +
                    cardUrl +
                    '" data-cart-details="Single card">' +
                    "ADD TO CART" +
                "</button>" +
            "</div>" +
        "</div>" +
    "</article>";

}


function formatShopPrice(price) {

    return "€" +
        Number(price).toFixed(2);

}


function escapeShopHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


if (shopCatalogSearch) {

    shopCatalogSearch.addEventListener(
        "input",
        function () {

            currentShopSearch =
                shopCatalogSearch.value
                    .trim()
                    .toLowerCase();


            updateShopCatalog();

        }
    );

}


shopCatalogFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                currentShopFilter =
                    button.dataset.shopCardFilter ||
                    "all";


                shopCatalogFilterButtons.forEach(
                    filterButton => {

                        const isActive =
                            filterButton === button;


                        filterButton.classList.toggle(
                            "active",
                            isActive
                        );

                        filterButton.setAttribute(
                            "aria-pressed",
                            String(isActive)
                        );

                    }
                );


                updateShopCatalog();

            }
        );

    }
);


loadShopCatalog();
