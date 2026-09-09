// ========================================
// SCHACHICUSTOMS – CARD URLS
// ========================================

(function () {

    function createCardSlug(cardOrName) {

        const name =
            typeof cardOrName === "object"
                ? cardOrName?.name
                : cardOrName;


        return String(name || "")
            .normalize("NFKD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );

    }


    function createCardUrl(cardOrName) {

        const slug =
            createCardSlug(
                cardOrName
            );


        return slug
            ? "card.html?card=" +
                encodeURIComponent(slug)
            : "card.html";

    }


    window.SchachiCardUrl = {
        create: createCardUrl,
        slug: createCardSlug
    };

}());
