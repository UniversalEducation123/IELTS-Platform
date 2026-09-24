document.addEventListener("DOMContentLoaded", function () {

    /*
     * =========================================
     * IELTS EXAM INPUT PROTECTION
     * =========================================
     */

    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {

        form.setAttribute(
            "autocomplete",
            "off"
        );

    });


    const inputs = document.querySelectorAll(
        'input[type="text"], textarea'
    );


    inputs.forEach(function (input) {

        input.setAttribute(
            "autocomplete",
            "off"
        );

        input.setAttribute(
            "autocorrect",
            "off"
        );

        input.setAttribute(
            "autocapitalize",
            "off"
        );

        input.setAttribute(
            "spellcheck",
            "false"
        );

    });


    /*
     * Prevent browser autofill on pages
     * that use dynamically restored answers.
     */

    document.querySelectorAll(
        'input[type="text"]'
    ).forEach(function (input) {

        input.addEventListener(
            "focus",
            function () {

                input.setAttribute(
                    "autocomplete",
                    "off"
                );

            }
        );

    });

});