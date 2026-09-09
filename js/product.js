// ========================================
// SCHACHICUSTOMS – CARD PRODUCT PAGE
// ========================================

const productContent =
    document.getElementById(
        "product-content"
    );

const productParams =
    new URLSearchParams(
        window.location.search
    );

const requestedProductReference =
    productParams.get("card") ||
    productParams.get("id");


async function loadProductPage() {

    if (!productContent) {
        return;
    }


    try {

        const response =
            await fetch("cards.json");


        if (!response.ok) {
            throw new Error(
                "Product data could not be loaded."
            );
        }


        const cards =
            await response.json();

        const card =
            findProductCard(
                cards,
                requestedProductReference
            );


        if (
            !card ||
            !card.shop ||
            !card.shop.available
        ) {

            renderProductNotFound();

            return;

        }


        window.history.replaceState(
            {},
            "",
            window.SchachiCardUrl.product(
                card
            )
        );

        document.title =
            card.name +
            " | SCHACHICUSTOMS Shop";


        renderProductPage(card);

    } catch (error) {

        console.error(
            "SCHACHICUSTOMS Product Error:",
            error
        );

        renderProductError();

    }

}


function findProductCard(cards, reference) {

    const requested =
        String(reference || "")
            .trim()
            .toLowerCase();


    if (!requested) {
        return null;
    }


    return Object.values(cards).find(
        card => {

            const aliases =
                Array.isArray(card.aliases)
                    ? card.aliases
                    : [];


            return (
                String(card.id || "")
                    .toLowerCase() ===
                    requested ||
                window.SchachiCardUrl.slug(
                    card
                ) === requested ||
                aliases.some(
                    alias =>
                        String(alias || "")
                            .toLowerCase() ===
                            requested
                )
            );

        }
    ) || null;

}


function renderProductPage(card) {

    const cardName =
        escapeProductHtml(card.name);

    const cardId =
        escapeProductHtml(card.id);

    const price =
        Number.parseFloat(
            card.shop.price
        ) || 4;

    const productImage =
        String(
            card.shop.productImage || ""
        ).trim();

    const productImageMarkup =
        productImage
            ? '<img src="' +
                escapeProductHtml(productImage) +
                '" alt="Product photo of ' +
                cardName +
                '" loading="eager">'
            : '<div class="product-image-placeholder product-image-placeholder--detail">' +
                '<span>PRODUCT IMAGE</span>' +
                '<strong>Coming soon</strong>' +
                '<p>Your original product photo will appear here.</p>' +
            "</div>";

    const productUrl =
        window.SchachiCardUrl.product(
            card
        );

    const rulingsUrl =
        window.SchachiCardUrl.create(
            card
        );


    productContent.innerHTML =
        '<div class="product-media">' +
            productImageMarkup +
        "</div>" +
        '<div class="product-details">' +
            '<span class="database-eyebrow">SCHACHICUSTOMS SINGLE CARD</span>' +
            "<h1>" +
                cardName +
            "</h1>" +
            '<p class="product-card-id">' +
                cardId +
            "</p>" +
            '<div class="product-price-row">' +
                '<span>PRICE</span>' +
                "<strong>" +
                    formatProductPrice(price) +
                "</strong>" +
            "</div>" +
            '<section class="product-specifications" aria-labelledby="product-specifications-title">' +
                '<span class="section-eyebrow">SPECIFICATIONS</span>' +
                '<h2 id="product-specifications-title">Made to be played.</h2>' +
                '<dl class="product-spec-list">' +
                    "<div><dt>Rarity</dt><dd>Common</dd></div>" +
                    "<div><dt>Finish</dt><dd>Matte</dd></div>" +
                    "<div><dt>Card back</dt><dd>Custom anime back</dd></div>" +
                    "<div><dt>Quality</dt><dd>Premium quality</dd></div>" +
                "</dl>" +
            "</section>" +
            '<fieldset class="product-options">' +
                "<legend>Choose your version</legend>" +
                '<label class="product-option">' +
                    '<input type="radio" name="product-nfc-option" value="nfc" data-product-option checked>' +
                    '<span class="product-option-circle" aria-hidden="true"></span>' +
                    '<span><strong>With NFC tag</strong><small>€4.00 · Same price</small></span>' +
                "</label>" +
                '<label class="product-option">' +
                    '<input type="radio" name="product-nfc-option" value="without-nfc" data-product-option>' +
                    '<span class="product-option-circle" aria-hidden="true"></span>' +
                    '<span><strong>Without NFC tag</strong><small>€4.00 · Same price</small></span>' +
                "</label>" +
            "</fieldset>" +
            '<button type="button" class="shop-button product-add-button" id="product-add-to-cart" data-cart-add data-cart-id="card:' +
                cardId +
                ':nfc" data-cart-name="' +
                cardName +
                '" data-cart-price="' +
                price +
                '" data-cart-image="' +
                escapeProductHtml(productImage) +
                '" data-cart-url="' +
                escapeProductHtml(productUrl) +
                '" data-cart-details="Single card · With NFC tag">' +
                "ADD TO CART — " +
                formatProductPrice(price) +
            "</button>" +
            '<a href="' +
                escapeProductHtml(rulingsUrl) +
                '" class="secondary-button product-rulings-link">VIEW CARD RULES &amp; RULINGS</a>' +
        "</div>";


    bindProductOptions(card);

}


function bindProductOptions(card) {

    const cartButton =
        document.getElementById(
            "product-add-to-cart"
        );


    if (!cartButton) {
        return;
    }


    document
        .querySelectorAll(
            "[data-product-option]"
        )
        .forEach(
            option => {

                option.addEventListener(
                    "change",
                    function () {

                        if (!option.checked) {
                            return;
                        }


                        const withNfc =
                            option.value === "nfc";

                        cartButton.dataset.cartId =
                            "card:" +
                            card.id +
                            ":" +
                            option.value;

                        cartButton.dataset.cartDetails =
                            withNfc
                                ? "Single card · With NFC tag"
                                : "Single card · Without NFC tag";

                    }
                );

            }
        );

}


function renderProductNotFound() {

    productContent.innerHTML =
        '<section class="product-message">' +
            '<span class="database-eyebrow">PRODUCT UNAVAILABLE</span>' +
            "<h1>We could not find this product.</h1>" +
            "<p>Return to the shop to browse currently available cards.</p>" +
            '<a href="shop.html#shop-single-cards" class="home-primary-button">BACK TO SHOP</a>' +
        "</section>";

}


function renderProductError() {

    productContent.innerHTML =
        '<section class="product-message">' +
            '<span class="database-eyebrow">PRODUCT UNAVAILABLE</span>' +
            "<h1>Product information is unavailable.</h1>" +
            "<p>Please return to the shop and try again shortly.</p>" +
            '<a href="shop.html#shop-single-cards" class="home-primary-button">BACK TO SHOP</a>' +
        "</section>";

}


function formatProductPrice(price) {

    return "€" +
        Number(price).toFixed(2);

}


function escapeProductHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadProductPage();
