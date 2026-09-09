// ========================================
// SCHACHICUSTOMS – CART
// ========================================

const CART_STORAGE_KEY = "schachicustoms-cart-v1";


function readCart() {

    try {

        const savedCart =
            JSON.parse(
                window.localStorage.getItem(
                    CART_STORAGE_KEY
                ) || "[]"
            );


        if (!Array.isArray(savedCart)) {
            return [];
        }


        return savedCart
            .map(normalizeCartItem)
            .filter(Boolean);

    } catch (error) {

        return [];

    }

}


function normalizeCartItem(item) {

    const id =
        String(item?.id || "").trim();

    const name =
        String(item?.name || "").trim();

    let price =
        Number(item?.price);


    if (
        id.startsWith("custom-deck:")
    ) {

        price = 99;

    }


    if (
        id.startsWith("deck:")
    ) {

        price = 79;

    }


    if (
        id === "deck:goat-extra"
    ) {

        price = 24;

    }


    if (
        !id ||
        !name ||
        !Number.isFinite(price) ||
        price < 0
    ) {

        return null;

    }


    const maxQuantity =
        id.startsWith("deck:")
            ? 99
            : Math.max(
                1,
                Math.floor(
                    Number(
                        item?.maxQuantity
                    ) || 99
                )
            );


    return {
        id,
        name,
        price,
        image: String(item?.image || ""),
        url: String(item?.url || ""),
        details: String(item?.details || ""),
        orderDetails: String(item?.orderDetails || ""),
        quantity: Math.max(
            1,
            Math.floor(Number(item?.quantity) || 1)
        ),
        maxQuantity
    };

}


function saveCart(items) {

    window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
    );

    refreshCartInterface();

}


function getCartItemCount(items = readCart()) {

    return items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

}


function getCartTotal(items = readCart()) {

    return items.reduce(
        (sum, item) =>
            sum + item.price * item.quantity,
        0
    );

}


function addToCart(item) {

    const nextItem =
        normalizeCartItem(item);


    if (!nextItem) {

        return {
            added: false,
            reason: "invalid"
        };

    }


    const cart =
        readCart();

    const existingItem =
        cart.find(
            cartItem =>
                cartItem.id === nextItem.id
        );


    if (existingItem) {

        if (
            existingItem.quantity >=
            existingItem.maxQuantity
        ) {

            return {
                added: false,
                reason: "limit"
            };

        }


        existingItem.quantity += 1;

    } else {

        cart.push(nextItem);

    }


    saveCart(cart);

    return {
        added: true,
        item: nextItem
    };

}


function changeCartQuantity(id, change) {

    const cart =
        readCart();

    const item =
        cart.find(
            cartItem =>
                cartItem.id === id
        );


    if (!item) {
        return;
    }


    const nextQuantity =
        item.quantity + change;


    if (nextQuantity <= 0) {

        removeFromCart(id);

        return;

    }


    item.quantity =
        Math.min(
            item.maxQuantity,
            nextQuantity
        );

    saveCart(cart);

}


function removeFromCart(id) {

    saveCart(
        readCart().filter(
            item => item.id !== id
        )
    );

}


function clearCart() {

    saveCart([]);

}


function formatCartPrice(price) {

    return "€" +
        Number(price)
            .toFixed(2);

}


function escapeCartHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function mountShopNavigation() {

    const currentPage =
        window.location.pathname
            .toLowerCase()
            .split("/")
            .pop() || "index.html";


    document
        .querySelectorAll(".main-nav")
        .forEach(nav => {

            if (
                nav.querySelector(
                    "[data-site-shop-navigation]"
                )
            ) {

                return;

            }


            const shopLink =
                document.createElement("a");

            shopLink.href = "shop.html";
            shopLink.textContent = "Shop";
            shopLink.dataset.siteShopNavigation =
                "shop";


            if (
                currentPage === "shop.html"
            ) {

                shopLink.classList.add("active");

            }


            const cartLink =
                document.createElement("a");

            cartLink.href = "cart.html";
            cartLink.className = "cart-nav-link";
            cartLink.dataset.siteShopNavigation =
                "cart";
            cartLink.setAttribute(
                "aria-label",
                "View cart"
            );


            if (
                currentPage === "cart.html"
            ) {

                cartLink.classList.add("active");

            }


            cartLink.innerHTML =
                'CART <span class="cart-nav-count" data-cart-count>0</span>';


            nav.append(shopLink, cartLink);

        });

}


function updateCartCount() {

    const count =
        getCartItemCount();


    document
        .querySelectorAll("[data-cart-count]")
        .forEach(element => {

            element.textContent =
                String(count);

        });

}


function refreshCartInterface() {

    updateCartCount();
    renderCartPage();

    window.dispatchEvent(
        new CustomEvent(
            "schachicustoms-cart-change"
        )
    );

}


function getProductFromButton(button) {

    return {
        id: button.dataset.cartId,
        name: button.dataset.cartName,
        price: button.dataset.cartPrice,
        image: button.dataset.cartImage,
        url: button.dataset.cartUrl,
        details: button.dataset.cartDetails,
        maxQuantity:
            button.dataset.cartMaxQuantity
    };

}


function showCartToast(message) {

    const existingToast =
        document.querySelector(".cart-toast");


    if (existingToast) {
        existingToast.remove();
    }


    const toast =
        document.createElement("div");

    toast.className = "cart-toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;

    document.body.appendChild(toast);


    window.requestAnimationFrame(
        function () {

            toast.classList.add("is-visible");

        }
    );


    window.setTimeout(
        function () {

            toast.classList.remove("is-visible");

            window.setTimeout(
                function () {

                    toast.remove();

                },
                180
            );

        },
        2400
    );

}


function renderCartPage() {

    const cartItems =
        document.getElementById("cart-items");

    const summary =
        document.getElementById("cart-summary");


    if (!cartItems || !summary) {
        return;
    }


    const items =
        readCart();


    if (!items.length) {

        cartItems.innerHTML =
            '<div class="cart-empty">' +
                '<span class="section-eyebrow">YOUR CART IS EMPTY</span>' +
                "<h2>Choose your next card.</h2>" +
                "<p>Browse the current releases or explore the available decks.</p>" +
                '<a href="shop.html" class="home-primary-button">BROWSE SHOP</a>' +
            "</div>";

        summary.innerHTML =
            '<div class="cart-summary-empty">' +
                "<span>0 ITEMS</span>" +
                "<strong>€0.00</strong>" +
            "</div>";

        return;

    }


    cartItems.innerHTML =
        items
            .map(renderCartItem)
            .join("");


    summary.innerHTML =
        '<span class="section-eyebrow">ORDER TOTAL</span>' +
        '<div class="cart-summary-total">' +
            "<strong>" +
                formatCartPrice(
                    getCartTotal(items)
                ) +
            "</strong>" +
            "<span>" +
                getCartItemCount(items) +
                (
                    getCartItemCount(items) === 1
                        ? " item"
                        : " items"
                ) +
            "</span>" +
        "</div>" +
        '<button type="button" class="home-primary-button" data-cart-copy-summary>' +
            "COPY ORDER SUMMARY" +
        "</button>" +
        '<button type="button" class="secondary-button cart-clear-button" data-cart-clear>' +
            "CLEAR CART" +
        "</button>" +
        '<p class="cart-summary-note">Payment and delivery details will be added before checkout goes live.</p>';

}


function renderCartItem(item) {

    const itemId =
        escapeCartHtml(item.id);

    const itemName =
        escapeCartHtml(item.name);

    const itemUrl =
        escapeCartHtml(item.url);

    const itemDetails =
        item.details
            ? '<span class="cart-item-details">' +
                escapeCartHtml(item.details) +
            "</span>"
            : "";

    const itemImage =
        item.id === "deck:goat-extra"
            ? renderGoatExtraDeckCartPreview()
            : item.image
            ? '<img src="' +
                escapeCartHtml(item.image) +
                '" alt="">' 
            : '<span class="cart-item-image-placeholder" aria-hidden="true"></span>';

    const itemClass =
        item.id === "deck:goat-extra"
            ? "cart-item cart-item--goat-extra"
            : "cart-item";

    const itemNameMarkup =
        item.url
            ? '<a href="' +
                itemUrl +
                '">' +
                itemName +
                "</a>"
            : "<strong>" +
                itemName +
                "</strong>";


    return '<article class="' +
        itemClass +
        '">' +
        '<div class="cart-item-image">' +
            itemImage +
        "</div>" +
        '<div class="cart-item-info">' +
            itemNameMarkup +
            itemDetails +
            '<span class="cart-item-price">' +
                formatCartPrice(item.price) +
                " each</span>" +
        "</div>" +
        '<div class="cart-item-controls">' +
            '<div class="cart-stepper" aria-label="' +
                itemName +
                ' quantity">' +
                '<button type="button" data-cart-action="decrease" data-cart-id="' +
                    itemId +
                    '" aria-label="Remove one ' +
                    itemName +
                    '">−</button>' +
                "<strong>" +
                    item.quantity +
                "</strong>" +
                '<button type="button" data-cart-action="increase" data-cart-id="' +
                    itemId +
                    '" aria-label="Add one ' +
                    itemName +
                    '">+</button>' +
            "</div>" +
            '<button type="button" class="cart-item-remove" data-cart-action="remove" data-cart-id="' +
                itemId +
                '">REMOVE</button>' +
        "</div>" +
        '<strong class="cart-item-total">' +
            formatCartPrice(
                item.price * item.quantity
            ) +
        "</strong>" +
    "</article>";

}


function renderGoatExtraDeckCartPreview() {

    const previewCards = [
        "images/cards/Thousand-Eyes Restrict.jpg",
        "images/cards/Dark Balter the Terrible.jpg",
        "images/cards/Gatling Dragon.jpg",
        "images/cards/Ojama King.jpg"
    ];


    return '<div class="cart-item-deck-preview" aria-hidden="true">' +
        previewCards
            .map(
                image =>
                    '<img src="' +
                    image +
                    '" alt="">'
            )
            .join("") +
        "</div>";

}


async function copyCartSummary() {

    const items =
        readCart();


    if (!items.length) {
        return;
    }


    const summary =
        [
            "SCHACHICUSTOMS ORDER SUMMARY",
            "",
            ...items.flatMap(
                item => {

                    const line =
                        item.quantity +
                        "× " +
                        item.name +
                        " — " +
                        formatCartPrice(
                            item.price * item.quantity
                        );


                    return item.orderDetails
                        ? [
                            line,
                            "  " +
                                item.orderDetails
                        ]
                        : [line];

                }
            ),
            "",
            "Items: " +
                getCartItemCount(items),
            "Total: " +
                formatCartPrice(
                    getCartTotal(items)
                )
        ]
            .join("\n");

    let copied = false;


    try {

        await navigator.clipboard.writeText(summary);
        copied = true;

    } catch (error) {

        const fallback =
            document.createElement("textarea");

        fallback.value = summary;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";

        document.body.appendChild(fallback);
        fallback.select();

        copied =
            document.execCommand("copy");

        fallback.remove();

    }


    showCartToast(
        copied
            ? "Order summary copied."
            : "The order summary could not be copied."
    );

}


function handleCartClick(event) {

    const addButton =
        event.target.closest("[data-cart-add]");


    if (addButton) {

        event.preventDefault();

        const result =
            addToCart(
                getProductFromButton(addButton)
            );

        showCartToast(
            result.added
                ? addButton.dataset.cartName +
                    " added to cart."
                : "This item has reached its quantity limit."
        );

        return;

    }


    const actionButton =
        event.target.closest("[data-cart-action]");


    if (actionButton) {

        event.preventDefault();


        const id =
            actionButton.dataset.cartId;

        const action =
            actionButton.dataset.cartAction;


        if (action === "increase") {
            changeCartQuantity(id, 1);
        }

        if (action === "decrease") {
            changeCartQuantity(id, -1);
        }

        if (action === "remove") {
            removeFromCart(id);
        }

        return;

    }


    if (
        event.target.closest(
            "[data-cart-clear]"
        )
    ) {

        clearCart();

        return;

    }


    if (
        event.target.closest(
            "[data-cart-copy-summary]"
        )
    ) {

        copyCartSummary();

    }

}


function initializeCart() {

    mountShopNavigation();
    updateCartCount();
    renderCartPage();

    document.addEventListener(
        "click",
        handleCartClick
    );

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === CART_STORAGE_KEY
            ) {

                refreshCartInterface();

            }

        }
    );

}


window.SchachiCart = {
    add: addToCart,
    clear: clearCart,
    count: getCartItemCount,
    items: readCart,
    total: getCartTotal
};


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCart,
        { once: true }
    );

} else {

    initializeCart();

}
