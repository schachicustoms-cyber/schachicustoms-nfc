// ========================================
// SCHACHICUSTOMS – NFC PRODUCT OPTIONS
// ========================================

function initializeNfcOptions() {

    document
        .querySelectorAll(
            "[data-nfc-option-group]"
        )
        .forEach(
            group => {

                const cartButton =
                    document.getElementById(
                        group.dataset.nfcButton
                    );

                const baseId =
                    group.dataset.nfcBaseId || "";

                const baseDetails =
                    group.dataset.nfcBaseDetails || "";

                const options =
                    group.querySelectorAll(
                        "[data-nfc-option]"
                    );


                if (
                    !cartButton ||
                    !baseId ||
                    options.length === 0
                ) {
                    return;
                }


                const updateSelection =
                    option => {

                        if (!option.checked) {
                            return;
                        }


                        const optionLabel =
                            option.dataset.nfcLabel ||
                            "With NFC tag";

                        cartButton.dataset.cartId =
                            baseId +
                            ":" +
                            option.value;

                        cartButton.dataset.cartDetails =
                            baseDetails +
                            " · " +
                            optionLabel;

                    };


                options.forEach(
                    option => {

                        option.addEventListener(
                            "change",
                            function () {

                                updateSelection(option);

                            }
                        );

                    }
                );


                const initialOption =
                    group.querySelector(
                        "[data-nfc-option]:checked"
                    );

                if (initialOption) {
                    updateSelection(initialOption);
                }

            }
        );

}


initializeNfcOptions();
