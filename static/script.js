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

    const div = document.createElement("div");

    div.className = "detail";

    const small = document.createElement("small");

    small.textContent = label;

    const strong = document.createElement("strong");

    strong.textContent =
        value === null ||
        value === undefined ||
        value === "" ?
        "Information not available" :
        value;

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
// MAP
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
        formatNumber(country.area) +
        " km². " +
        "The currency information is " +
        currency +
        ". " +
        "The available languages include " +
        languages +
        "."
    );
}


// ============================================
// DISPLAY COUNTRY
// ============================================

function renderCountry(country) {

    currentCountry = country;

    // Hide loading/error
    $("loading").classList.add("hidden");

    $("errorBox").classList.add("hidden");

    $("emptyState").classList.add("hidden");

    // Show result
    $("countryResult").classList.remove("hidden");


    // ========================================
    // FLAG
    // ========================================

    const flag = $("flag");

    if (country.flag) {

        flag.textContent = country.flag;

        flag.removeAttribute("src");

        flag.alt =
            country.name + " flag";

    } else {

        flag.src = "";

        flag.alt =
            country.name + " flag";

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
        "🏛️ " + country.capital
    );

    setText(
        "regionPill",
        "🌍 " + country.region
    );

    setText(
        "codePill",
        (country.cca2 || "") +
        (country.cca3 ?
            " / " + country.cca3 :
            "")
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
        country.area !== "Not available" ?
        formatNumber(country.area) + " km²" :
        "Information not available"
    );

    setText(
        "currency",
        country.currency
    );

    setText(
        "languages",
        arrayText(country.languages)
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
        country.area !== "Not available" ?
        formatNumber(country.area) + " km²" :
        "Information not available"
    );

    addDetail(
        basic,
        "Calling code",
        country.calling_code
    );

    addDetail(
        basic,
        "ISO codes", [
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


    // ========================================
    // NATIONAL IDENTITY
    // ========================================

    const identity =
        $("identityInfo");

    identity.innerHTML = "";

    addDetail(
        identity,
        "National flag",
        country.flag ?
        country.flag :
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
        arrayText(country.languages)
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


    // ========================================
    // GEOGRAPHY
    // ========================================

    const geo =
        $("geoInfo");

    geo.innerHTML = "";

    const coordinates =
        country.latitude !== null &&
        country.longitude !== null ?
        country.latitude +
        ", " +
        country.longitude :
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


    // Scroll to result
    $("countryResult").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================
// SEARCH COUNTRY
// ============================================

async function searchCountry(countryName) {

    const cleanName =
        countryName.trim();

    // Don't search empty input
    if (!cleanName) {

        showError(
            "Please enter a country name."
        );

        return;
    }


    // Show loading
    $("emptyState").classList.add("hidden");

    $("countryResult").classList.add("hidden");

    $("errorBox").classList.add("hidden");

    $("loading").classList.remove("hidden");


    try {

        // IMPORTANT:
        // Use the CURRENT country typed by user
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


        const response =
            await fetch(
                url, {
                    cache: "no-cache"
                }
            );


        const data =
            await response.json();


        console.log(
            "Country data:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Country not found."
            );
        }


        renderCountry(data);


    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        $("loading").classList.add("hidden");

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

    $("emptyState").classList.add("hidden");

    $("countryResult").classList.add("hidden");

    $("loading").classList.add("hidden");

    $("errorBox").textContent =
        message;

    $("errorBox").classList.remove("hidden");
}


// ============================================
// HISTORY
// ============================================

function addHistory(country) {

    history =
        history.filter(
            item =>
            item.name !== country.name
        );


    history.unshift({

        name: country.name,

        flag: country.flag

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
                () => searchCountry(
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
                () => searchCountry(
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


    $("favoriteBtn").textContent =
        saved ? "★" : "☆";


    $("favoriteBtn").classList.toggle(
        "saved",
        saved
    );
}


// ============================================
// SEARCH FORM
// ============================================

$("searchForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        // IMPORTANT:
        // Read the input EVERY time
        const country =
            $("countryInput").value;


        console.log(
            "User entered:",
            country
        );


        searchCountry(country);
    }
);


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


                    $("countryInput").value =
                        country;


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

$("favoriteBtn").addEventListener(
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

            favorites.splice(
                index,
                1
            );

        } else {

            favorites.unshift({

                name: currentCountry.name,

                flag: currentCountry.flag
            });


            favorites =
                favorites.slice(0, 20);
        }


        localStorage.setItem(
            "cv_favorites",
            JSON.stringify(favorites)
        );


        updateFavoriteButton();

        renderFavorites();
    }
);


// ============================================
// CLEAR HISTORY
// ============================================

$("clearHistory").addEventListener(
    "click",
    function() {

        history = [];

        localStorage.removeItem(
            "cv_history"
        );

        renderHistory();
    }
);


// ============================================
// DARK MODE
// ============================================

$("themeBtn").addEventListener(
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


        $("themeBtn").textContent =
            dark ?
            "☀" :
            "☾";
    }
);


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

    $("themeBtn").textContent =
        "☀";
}


// ============================================
// INITIAL LOAD
// ============================================

renderHistory();

renderFavorites();


// IMPORTANT:
// DO NOT SEARCH FOR CANADA HERE.
// The website should wait for the user
// to enter a country.