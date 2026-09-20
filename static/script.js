// ============================================
// CountryVision AI - script.js
// ============================================

const $ = (id) => document.getElementById(id);

let currentCountry = null;

let favorites = JSON.parse(
    localStorage.getItem("cv_favorites") || "[]"
);

let history = JSON.parse(
    localStorage.getItem("cv_history") || "[]"
);


// ============================================
// FORMAT NUMBER
// ============================================

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "Not available"
    ) {
        return "Information not available";
    }

    if (typeof value === "number") {
        return new Intl.NumberFormat("en-IN").format(value);
    }

    return value;
}


// ============================================
// ARRAY TO TEXT
// ============================================

function arrayText(value) {

    if (!Array.isArray(value) || value.length === 0) {
        return "Information not available";
    }

    return value.join(", ");
}


// ============================================
// ADD DETAIL
// ============================================

function addDetail(container, label, value) {

    if (!container) {
        return;
    }

    const div = document.createElement("div");
    div.className = "detail";

    const small = document.createElement("small");
    small.textContent = label;

    const strong = document.createElement("strong");

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        strong.textContent =
            "Information not available";
    } else {
        strong.textContent = value;
    }

    div.appendChild(small);
    div.appendChild(strong);

    container.appendChild(div);
}


// ============================================
// SET TEXT
// ============================================

function setText(id, value) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent =
        value === null ||
        value === undefined ||
        value === "" ?
        "Information not available" :
        value;
}


// ============================================
// MAP URL
// ============================================

function mapUrl(latitude, longitude) {

    if (
        latitude === null ||
        longitude === null ||
        latitude === undefined ||
        longitude === undefined
    ) {
        return "about:blank";
    }

    const delta = 8;

    return (
        "https://www.openstreetmap.org/export/embed.html" +
        "?bbox=" +
        (longitude - delta) +
        "%2C" +
        (latitude - delta) +
        "%2C" +
        (longitude + delta) +
        "%2C" +
        (latitude + delta) +
        "&layer=mapnik" +
        "&marker=" +
        latitude +
        "%2C" +
        longitude
    );
}


// ============================================
// AI SUMMARY
// ============================================

function createSummary(country) {

    const currency =
        country.currency ||
        "Information not available";

    const languages =
        arrayText(country.languages);

    const continent =
        country.continent ||
        "Information not available";

    return (
        country.name +
        " is a country in " +
        continent +
        ". Its capital is " +
        country.capital +
        ". It is located in the " +
        country.region +
        " region. " +
        "The reported population is " +
        formatNumber(country.population) +
        " and its area is " +
        formatArea(country.area) +
        ". " +
        "The currency information is " +
        currency +
        ". " +
        "The available languages include " +
        languages +
        "."
    );
}


// ============================================
// FORMAT AREA
// ============================================

function formatArea(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "Not available"
    ) {
        return "Information not available";
    }

    if (typeof value === "number") {
        return (
            new Intl.NumberFormat("en-IN").format(value) +
            " km²"
        );
    }

    return value;
}


// ============================================
// GET FLAG URL
// ============================================

function getFlagUrl(country) {

    // ----------------------------------------
    // 1. Use flag URL from backend if available
    // ----------------------------------------

    if (
        country.flag &&
        typeof country.flag === "string" &&
        (
            country.flag.startsWith("http://") ||
            country.flag.startsWith("https://")
        )
    ) {
        return country.flag;
    }

    // ----------------------------------------
    // 2. Build flag URL using ISO alpha-2 code
    // ----------------------------------------

    if (country.cca2) {

        const code =
            String(country.cca2)
                .trim()
                .toLowerCase();

        if (code.length === 2) {

            return (
                "https://flagcdn.com/w640/" +
                code +
                ".png"
            );
        }
    }

    // ----------------------------------------
    // 3. No image available
    // ----------------------------------------

    return "";
}


// ============================================
// DISPLAY COUNTRY
// ============================================

function renderCountry(country) {

    currentCountry = country;

    // ----------------------------------------
    // Hide loading and error
    // ----------------------------------------

    if ($("loading")) {
        $("loading").classList.add("hidden");
    }

    if ($("errorBox")) {
        $("errorBox").classList.add("hidden");
    }

    if ($("emptyState")) {
        $("emptyState").classList.add("hidden");
    }

    // ----------------------------------------
    // Show result
    // ----------------------------------------

    if ($("countryResult")) {
        $("countryResult").classList.remove("hidden");
    }


    // ========================================
    // FLAG
    // ========================================

    const flag = $("flag");

    if (flag) {

        const flagUrl =
            getFlagUrl(country);

        if (flagUrl) {

            // IMPORTANT:
            // Put URL into image SRC
            // Do NOT use textContent here.

            flag.src = flagUrl;

            flag.alt =
                country.name +
                " flag";

            // Clear old text
            flag.textContent = "";

            // If image fails, try another flag URL
            flag.onerror = function () {

                if (country.cca2) {

                    const code =
                        String(country.cca2)
                            .trim()
                            .toLowerCase();

                    const fallbackUrl =
                        "https://flagcdn.com/" +
                        code +
                        ".svg";

                    if (
                        flag.src !== fallbackUrl
                    ) {
                        flag.src = fallbackUrl;
                        return;
                    }
                }

                // Final fallback
                flag.removeAttribute("src");
                flag.alt =
                    country.name +
                    " flag unavailable";

            };

        } else {

            flag.removeAttribute("src");

            flag.alt =
                country.name +
                " flag unavailable";

        }
    }


    // ========================================
    // MAIN INFORMATION
    // ========================================

    setText(
        "countryName",
        country.name
    );

    setText(
        "officialName",
        country.official_name
    );

    setText(
        "capitalPill",
        "🏛️ " + (country.capital || "Not available")
    );

    setText(
        "regionPill",
        "🌍 " + (country.region || "Not available")
    );

    setText(
        "codePill",
        (country.cca2 || "") +
        (
            country.cca3 ?
            " / " + country.cca3 :
            ""
        )
    );


    // ========================================
    // QUICK INFORMATION
    // ========================================

    setText(
        "population",
        formatNumber(country.population)
    );

    setText(
        "area",
        formatArea(country.area)
    );

    setText(
        "currency",
        country.currency
    );

    setText(
        "languages",
        country.languages
        ? arrayText(country.languages)
        : country.language_text
    );

    setText(
        "timezone",
        country.timezone_text
    );

    setText(
        "domain",
        country.tld_text
    );


    // ========================================
    // BASIC INFORMATION
    // ========================================

    const basic = $("basicInfo");

    if (basic) {

        basic.innerHTML = "";

        addDetail(
            basic,
            "Country",
            country.name
        );

        addDetail(
            basic,
            "Official name",
            country.official_name
        );

        addDetail(
            basic,
            "Capital",
            country.capital
        );

        addDetail(
            basic,
            "Continent",
            country.continent
        );

        addDetail(
            basic,
            "Region",
            country.region
        );

        addDetail(
            basic,
            "Subregion",
            country.subregion
        );

        addDetail(
            basic,
            "Population",
            formatNumber(country.population)
        );

        addDetail(
            basic,
            "Area",
            formatArea(country.area)
        );

        addDetail(
            basic,
            "Calling code",
            country.calling_code
        );

        addDetail(
            basic,
            "ISO codes",
            [
                country.cca2,
                country.cca3,
                country.ccn3
            ]
            .filter(Boolean)
            .join(" / ")
        );

        addDetail(
            basic,
            "Internet domain",
            country.tld_text
        );

        addDetail(
            basic,
            "Driving side",
            country.driving_side
        );

        addDetail(
            basic,
            "Demonym",
            country.demonym
        );
    }


    // ========================================
    // NATIONAL IDENTITY
    // ========================================

    const identity = $("identityInfo");

    if (identity) {

        identity.innerHTML = "";

        const flagUrl =
            getFlagUrl(country);

        addDetail(
            identity,
            "National flag",
            flagUrl ||
            "Information not available"
        );

        addDetail(
            identity,
            "Capital",
            country.capital
        );

        addDetail(
            identity,
            "Currency",
            country.currency
        );

        addDetail(
            identity,
            "Languages",
            country.languages
            ? arrayText(country.languages)
            : country.language_text
        );

        addDetail(
            identity,
            "National animal",
            "Information not available from selected API"
        );

        addDetail(
            identity,
            "National bird",
            "Information not available from selected API"
        );

        addDetail(
            identity,
            "National flower",
            "Information not available from selected API"
        );

        addDetail(
            identity,
            "National tree",
            "Information not available from selected API"
        );

        addDetail(
            identity,
            "National motto",
            "Information not available from selected API"
        );
    }


    // ========================================
    // GEOGRAPHY
    // ========================================

    const geo = $("geoInfo");

    if (geo) {

        geo.innerHTML = "";

        const coordinates =
            country.latitude !== null &&
            country.longitude !== null &&
            country.latitude !== undefined &&
            country.longitude !== undefined
            ?
            country.latitude +
            ", " +
            country.longitude
            :
            "Information not available";

        addDetail(
            geo,
            "Coordinates",
            coordinates
        );

        addDetail(
            geo,
            "Landlocked",
            country.landlocked ?
            "Yes" :
            "No"
        );

        addDetail(
            geo,
            "Borders",
            country.borders_text
        );

        addDetail(
            geo,
            "Time zones",
            country.timezone_text
        );

        addDetail(
            geo,
            "Continent",
            country.continent
        );

        addDetail(
            geo,
            "Region",
            country.region
        );

        addDetail(
            geo,
            "Subregion",
            country.subregion
        );

        addDetail(
            geo,
            "Start of week",
            country.start_of_week
        );
    }


    // ========================================
    // MAP
    // ========================================

    const mapFrame =
        $("mapFrame");

    if (mapFrame) {

        mapFrame.src =
            mapUrl(
                country.latitude,
                country.longitude
            );
    }


    // ========================================
    // GOVERNMENT
    // ========================================

    const government =
        $("governmentInfo");

    if (government) {

        government.innerHTML = "";

        addDetail(
            government,
            "UN member",
            country.un_member ?
            "Yes" :
            "No / not reported"
        );

        addDetail(
            government,
            "Independent",
            country.independent ?
            "Yes" :
            "Not reported"
        );

        addDetail(
            government,
            "Country status",
            country.status
        );

        addDetail(
            government,
            "Administrative divisions",
            "Not supplied by selected API"
        );

        addDetail(
            government,
            "Head of state",
            "Not supplied by selected API"
        );

        addDetail(
            government,
            "Head of government",
            "Not supplied by selected API"
        );

        addDetail(
            government,
            "Government type",
            "Not supplied by selected API"
        );
    }


    // ========================================
    // SUMMARY
    // ========================================

    setText(
        "aiSummary",
        createSummary(country)
    );

    setText(
        "retrievedAt",
        country.retrieved_at
    );


    // ========================================
    // FAVORITES
    // ========================================

    updateFavoriteButton();

    renderFavorites();


    // ========================================
    // HISTORY
    // ========================================

    addHistory(country);


    // ========================================
    // SCROLL TO RESULT
    // ========================================

    if ($("countryResult")) {

        $("countryResult").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ============================================
// SEARCH COUNTRY
// ============================================

async function searchCountry(countryName) {

    const cleanName =
        String(countryName || "").trim();

    // ----------------------------------------
    // Don't search empty input
    // ----------------------------------------

    if (!cleanName) {

        showError(
            "Please enter a country name."
        );

        return;
    }


    // ----------------------------------------
    // Show loading
    // ----------------------------------------

    if ($("emptyState")) {
        $("emptyState").classList.add("hidden");
    }

    if ($("countryResult")) {
        $("countryResult").classList.add("hidden");
    }

    if ($("errorBox")) {
        $("errorBox").classList.add("hidden");
    }

    if ($("loading")) {
        $("loading").classList.remove("hidden");
    }


    try {

        // ------------------------------------
        // Create request URL
        // ------------------------------------

        const url =
            "/api/country/" +
            encodeURIComponent(cleanName);


        console.log(
            "Searching country:",
            cleanName
        );

        console.log(
            "Request URL:",
            url
        );


        // ------------------------------------
        // Fetch data
        // ------------------------------------

        const response =
            await fetch(
                url,
                {
                    cache: "no-cache"
                }
            );


        const data =
            await response.json();


        console.log(
            "Country data:",
            data
        );


        // ------------------------------------
        // Check response
        // ------------------------------------

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Country not found."
            );
        }


        // ------------------------------------
        // Support both API formats
        //
        // Format 1:
        // { name: "India", ... }
        //
        // Format 2:
        // { success: true, country: {...} }
        // ------------------------------------

        const country =
            data.country &&
            typeof data.country === "object"
            ?
            data.country
            :
            data;


        // ------------------------------------
        // Display country
        // ------------------------------------

        renderCountry(country);


    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        if ($("loading")) {
            $("loading").classList.add("hidden");
        }

        showError(
            error.message ||
            "Something went wrong."
        );
    }
}


// ============================================
// ERROR
// ============================================

function showError(message) {

    if ($("emptyState")) {
        $("emptyState").classList.add("hidden");
    }

    if ($("countryResult")) {
        $("countryResult").classList.add("hidden");
    }

    if ($("loading")) {
        $("loading").classList.add("hidden");
    }

    if ($("errorBox")) {

        $("errorBox").textContent =
            message;

        $("errorBox").classList.remove("hidden");
    }
}


// ============================================
// HISTORY
// ============================================

function addHistory(country) {

    history =
        history.filter(
            item =>
                item.name !==
                country.name
        );


    history.unshift({

        name: country.name,

        flag:
            getFlagUrl(country)

    });


    history =
        history.slice(0, 10);


    localStorage.setItem(
        "cv_history",
        JSON.stringify(history)
    );


    renderHistory();
}


// ============================================
// DISPLAY HISTORY
// ============================================

function renderHistory() {

    const box =
        $("history");

    if (!box) {
        return;
    }

    box.innerHTML = "";


    if (history.length === 0) {

        box.innerHTML =
            '<span style="color:var(--muted)">No recent searches yet.</span>';

        return;
    }


    history.forEach(
        item => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "favorite-chip";


            button.textContent =
                item.name;


            button.onclick =
                () =>
                    searchCountry(
                        item.name
                    );


            box.appendChild(
                button
            );
        }
    );
}


// ============================================
// FAVORITES
// ============================================

function renderFavorites() {

    const box =
        $("favorites");

    if (!box) {
        return;
    }

    box.innerHTML = "";


    if (favorites.length === 0) {

        box.innerHTML =
            '<span style="color:var(--muted)">No favorites saved yet.</span>';

        return;
    }


    favorites.forEach(
        item => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "favorite-chip";


            button.textContent =
                "⭐ " + item.name;


            button.onclick =
                () =>
                    searchCountry(
                        item.name
                    );


            box.appendChild(
                button
            );
        }
    );
}


// ============================================
// FAVORITE BUTTON
// ============================================

function updateFavoriteButton() {

    if (!currentCountry) {
        return;
    }


    const saved =
        favorites.some(
            item =>
                item.name ===
                currentCountry.name
        );


    const button =
        $("favoriteBtn");

    if (!button) {
        return;
    }


    button.textContent =
        saved ? "★" : "☆";


    button.classList.toggle(
        "saved",
        saved
    );
}


// ============================================
// SEARCH FORM
// ============================================

const searchForm =
    $("searchForm");

if (searchForm) {

    searchForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            // Read current input every time

            const country =
                $("countryInput")
                ? $("countryInput").value
                : "";


            console.log(
                "User entered:",
                country
            );


            searchCountry(country);
        }
    );
}


// ============================================
// EXAMPLE COUNTRY BUTTONS
// ============================================

document
    .querySelectorAll(".example")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    const country =
                        button.dataset.country;


                    if ($("countryInput")) {

                        $("countryInput").value =
                            country;
                    }


                    searchCountry(
                        country
                    );
                }
            );
        }
    );


// ============================================
// FAVORITE BUTTON CLICK
// ============================================

const favoriteBtn =
    $("favoriteBtn");

if (favoriteBtn) {

    favoriteBtn.addEventListener(
        "click",
        function() {

            if (!currentCountry) {
                return;
            }


            const index =
                favorites.findIndex(
                    item =>
                        item.name ===
                        currentCountry.name
                );


            if (index >= 0) {

                // Remove favorite

                favorites.splice(
                    index,
                    1
                );

            } else {

                // Add favorite

                favorites.unshift({

                    name:
                        currentCountry.name,

                    flag:
                        getFlagUrl(
                            currentCountry
                        )
                });


                favorites =
                    favorites.slice(0, 20);
            }


            localStorage.setItem(
                "cv_favorites",
                JSON.stringify(
                    favorites
                )
            );


            updateFavoriteButton();

            renderFavorites();
        }
    );
}


// ============================================
// CLEAR HISTORY
// ============================================

const clearHistory =
    $("clearHistory");

if (clearHistory) {

    clearHistory.addEventListener(
        "click",
        function() {

            history = [];


            localStorage.removeItem(
                "cv_history"
            );


            renderHistory();
        }
    );
}


// ============================================
// DARK MODE
// ============================================

const themeBtn =
    $("themeBtn");

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark"
            );


            const dark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "cv_theme",
                dark ?
                    "dark" :
                    "light"
            );


            themeBtn.textContent =
                dark ?
                    "☀" :
                    "☾";
        }
    );
}


// ============================================
// LOAD SAVED THEME
// ============================================

if (
    localStorage.getItem(
        "cv_theme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );


    if (themeBtn) {

        themeBtn.textContent =
            "☀";
    }
}


// ============================================
// INITIAL LOAD
// ============================================

renderHistory();

renderFavorites();


// ============================================
// IMPORTANT
// ============================================
// DO NOT SEARCH FOR CANADA HERE.
// The website waits for the user
// to enter a country.
// ============================================
