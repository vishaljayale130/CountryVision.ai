from flask import Flask, render_template, jsonify
import requests
from datetime import datetime, timezone

app = Flask(__name__)

# countries.dev does not require an API key
COUNTRIES_API_URL = "https://countries.dev"


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

def safe_text(value, default="Not available"):
    """Convert a value into readable text."""
    if value is None:
        return default

    if isinstance(value, str):
        value = value.strip()
        return value if value else default

    return str(value)


def format_number(value):
    """Format numbers with commas."""
    try:
        return f"{int(value):,}"
    except (ValueError, TypeError):
        return "Not available"


def format_list(value, default="Not available"):
    """Convert a list/dictionary/string into readable text."""
    if value is None:
        return default

    if isinstance(value, list):
        if not value:
            return default
        return ", ".join(str(item) for item in value)

    if isinstance(value, dict):
        if not value:
            return default

        items = []

        for key, item in value.items():
            if isinstance(item, dict):
                name = item.get("name") or item.get("common")
                if name:
                    items.append(str(name))
                else:
                    items.append(str(key))
            else:
                items.append(str(item))

        return ", ".join(items) if items else default

    return safe_text(value, default)


def get_native_names(country):
    """Get native country names when available."""
    native = country.get("native_name")

    if native:
        return format_list(native)

    native_names = country.get("nativeNames")

    if native_names:
        return format_list(native_names)

    return ""


def get_alt_names(country):
    """Get alternative country names."""
    values = []

    alt_spellings = country.get("altSpellings")

    if isinstance(alt_spellings, list):
        values.extend(alt_spellings)

    alt_spellings = country.get("alt_spellings")

    if isinstance(alt_spellings, list):
        values.extend(alt_spellings)

    return values


def normalize_country(country):
    """
    Convert the API response into one consistent format
    for the frontend.
    """

    # -----------------------------------------------------
    # Basic names
    # -----------------------------------------------------

    name = safe_text(country.get("name"), "Unknown country")

    official_name = safe_text(
        country.get("official_name"),
        country.get("officialName", name)
    )

    # -----------------------------------------------------
    # Capital
    # -----------------------------------------------------

    capital = country.get("capital")

    if isinstance(capital, list):
        capital = ", ".join(capital)

    capital = safe_text(capital)

    # -----------------------------------------------------
    # Geographic information
    # -----------------------------------------------------

    region = safe_text(country.get("region"))
    subregion = safe_text(country.get("subregion"))
    continent = safe_text(country.get("continent"))

    # -----------------------------------------------------
    # Population and area
    # -----------------------------------------------------

    population_value = country.get("population")
    population = format_number(population_value)

    area_value = country.get("area")

    try:
        area = f"{float(area_value):,.0f} km²"
    except (ValueError, TypeError):
        area = "Not available"

    # -----------------------------------------------------
    # Currency
    # -----------------------------------------------------

    currency = country.get("currency")

    if not currency:
        currencies = country.get("currencies")

        if isinstance(currencies, dict):
            currency_items = []

            for code, details in currencies.items():

                if isinstance(details, dict):
                    currency_name = details.get("name", "")
                    symbol = details.get("symbol", "")

                    part = currency_name

                    if code:
                        part += f" ({code})"

                    if symbol:
                        part += f" {symbol}"

                    currency_items.append(part)

                else:
                    currency_items.append(f"{details} ({code})")

            currency = ", ".join(currency_items)

    currency = safe_text(currency)

    # -----------------------------------------------------
    # Currencies for frontend
    # -----------------------------------------------------

    currencies_data = country.get("currencies")

    if not currencies_data:
        currencies_data = {}

    if isinstance(currencies_data, str):
        currencies_data = {
            "value": currencies_data
        }

    # -----------------------------------------------------
    # Languages
    # -----------------------------------------------------

    languages = country.get("languages")

    language_text = format_list(languages)

    # If API already gives language_text, use it
    if language_text == "Not available":
        language_text = safe_text(
            country.get("language_text"),
            "Not available"
        )

    # -----------------------------------------------------
    # Time zones
    # -----------------------------------------------------

    timezones = country.get("timezones")

    timezone_text = format_list(timezones)

    if timezone_text == "Not available":
        timezone_text = safe_text(
            country.get("timezone_text"),
            "Not available"
        )

    # -----------------------------------------------------
    # Border countries
    # -----------------------------------------------------

    borders = country.get("borders")

    if isinstance(borders, str):
        borders_list = [
            item.strip()
            for item in borders.split(",")
            if item.strip()
        ]
    elif isinstance(borders, list):
        borders_list = borders
    else:
        borders_list = []

    borders_text = ", ".join(borders_list) if borders_list else "None"

    # -----------------------------------------------------
    # Latitude and longitude
    # -----------------------------------------------------

    latitude = None
    longitude = None

    latlng = country.get("latlng")

    if isinstance(latlng, list) and len(latlng) >= 2:
        try:
            latitude = float(latlng[0])
            longitude = float(latlng[1])
        except (ValueError, TypeError):
            pass

    if latitude is None:
        try:
            latitude = float(country.get("latitude"))
        except (ValueError, TypeError):
            latitude = None

    if longitude is None:
        try:
            longitude = float(country.get("longitude"))
        except (ValueError, TypeError):
            longitude = None

    # -----------------------------------------------------
    # ISO codes
    # -----------------------------------------------------

    cca2 = safe_text(
        country.get("cca2"),
        country.get("iso2", "")
    )

    cca3 = safe_text(
        country.get("cca3"),
        country.get("iso3", "")
    )

    ccn3 = safe_text(
        country.get("ccn3"),
        country.get("numericCode", "")
    )

    # -----------------------------------------------------
    # FLAG
    #
    # MAIN CHANGE:
    # Create the PNG flag URL using ISO alpha-2 code.
    #
    # India = IN
    # Japan = JP
    # USA = US
    #
    # -----------------------------------------------------

    cca2_clean = str(cca2).strip().lower()

    if cca2_clean:
        flag = f"https://flagcdn.com/w640/{cca2_clean}.png"
    else:
        # Fallback if ISO code is unavailable
        flag = ""

    # Keep emoji as backup
    flag_emoji = safe_text(
        country.get("flag_emoji"),
        country.get("flag", "")
    )

    # -----------------------------------------------------
    # Demonym
    # -----------------------------------------------------

    demonym = safe_text(
        country.get("demonym"),
        country.get("demonyms")
    )

    # -----------------------------------------------------
    # Calling code
    # -----------------------------------------------------

    calling_code = country.get("calling_code")

    if calling_code is None:
        calling_codes = country.get("callingCodes")

        if isinstance(calling_codes, list):
            calling_code = ", ".join(calling_codes)

    calling_code = safe_text(calling_code)

    # -----------------------------------------------------
    # Internet domain
    # -----------------------------------------------------

    tld = country.get("tld")

    if isinstance(tld, list):
        tld_text = ", ".join(tld)
    else:
        tld_text = safe_text(tld)

    # -----------------------------------------------------
    # Driving side
    # -----------------------------------------------------

    driving_side = country.get("driving_side")

    if not driving_side:
        driving = country.get("car")

        if isinstance(driving, dict):
            driving_side = driving.get("side")

    driving_side = safe_text(driving_side)

    # -----------------------------------------------------
    # Other information
    # -----------------------------------------------------

    landlocked = country.get("landlocked")

    if landlocked is None:
        landlocked = False

    independent = country.get("independent")

    if independent is None:
        independent = False

    un_member = country.get("un_member")

    if un_member is None:
        un_member = country.get("unMember", False)

    status = safe_text(
        country.get("status"),
        "Officially assigned"
    )

    start_of_week = safe_text(
        country.get("start_of_week"),
        country.get("startOfWeek", "Monday")
    )

    # -----------------------------------------------------
    # Return normalized country data
    # -----------------------------------------------------

    return {
        "name": name,
        "official_name": official_name,

        "capital": capital,

        "region": region,
        "subregion": subregion,
        "continent": continent,

        "population": population,
        "area": area,

        "currency": currency,
        "currencies": currencies_data,

        "languages": languages,
        "language_text": language_text,

        "timezone_text": timezone_text,
        "timezones": timezones,

        "borders": borders_list,
        "borders_text": borders_text,

        "latitude": latitude,
        "longitude": longitude,

        # -----------------------------
        # FLAG
        # -----------------------------
        "flag": flag,
        "flag_emoji": flag_emoji,

        "demonym": demonym,
        "calling_code": calling_code,

        "tld_text": tld_text,
        "tld": tld,

        "driving_side": driving_side,

        "cca2": cca2,
        "cca3": cca3,
        "ccn3": ccn3,

        "landlocked": landlocked,
        "independent": independent,
        "un_member": un_member,

        "status": status,
        "start_of_week": start_of_week,

        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }


# ---------------------------------------------------------
# Find the best country match
# ---------------------------------------------------------

def find_best_country(data, search_name):
    """Find exact name first, then native/alternative names."""

    if not isinstance(data, list):
        return None

    search_name = search_name.strip().lower()

    # -----------------------------------------------------
    # 1. Exact normal name
    # -----------------------------------------------------

    for country in data:
        country_name = str(
            country.get("name", "")
        ).strip().lower()

        if country_name == search_name:
            return country

    # -----------------------------------------------------
    # 2. Exact official name
    # -----------------------------------------------------

    for country in data:
        official_name = str(
            country.get("official_name", "")
        ).strip().lower()

        if official_name == search_name:
            return country

    # -----------------------------------------------------
    # 3. Exact native name
    # -----------------------------------------------------

    for country in data:
        native_names = get_native_names(country)

        if native_names:
            native_parts = [
                part.strip().lower()
                for part in native_names.split(",")
            ]

            if search_name in native_parts:
                return country

    # -----------------------------------------------------
    # 4. Alternative spelling
    # -----------------------------------------------------

    for country in data:
        alt_names = get_alt_names(country)

        for alt_name in alt_names:
            if str(alt_name).strip().lower() == search_name:
                return country

    return None


# ---------------------------------------------------------
# Home page
# ---------------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# ---------------------------------------------------------
# Country API
# ---------------------------------------------------------

@app.route("/api/country/<country_name>")
def get_country(country_name):

    clean_name = country_name.strip()

    if not clean_name:
        return jsonify({
            "success": False,
            "error": "Please enter a country name."
        }), 400

    try:

        # -------------------------------------------------
        # Search countries.dev by name
        # -------------------------------------------------

        url = f"{COUNTRIES_API_URL}/name/{clean_name}"

        response = requests.get(
            url,
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        # -------------------------------------------------
        # countries.dev may return a list directly
        # -------------------------------------------------

        if isinstance(data, list):
            countries = data

        elif isinstance(data, dict):

            # Try common response structures
            countries = (
                data.get("data")
                or data.get("countries")
                or data.get("results")
                or []
            )

            # If the response itself looks like a country
            if not countries and data.get("name"):
                countries = [data]

        else:
            countries = []

        # -------------------------------------------------
        # No results
        # -------------------------------------------------

        if not countries:
            return jsonify({
                "success": False,
                "error": f'Country "{clean_name}" was not found.'
            }), 404

        # -------------------------------------------------
        # Find exact match
        # -------------------------------------------------

        country = find_best_country(
            countries,
            clean_name
        )

        # -------------------------------------------------
        # Do NOT randomly select partial matches
        # -------------------------------------------------

        if country is None:

            suggestions = []

            for item in countries[:5]:
                item_name = item.get("name")

                if item_name:
                    suggestions.append(item_name)

            message = (
                f'No exact country match found for "{clean_name}".'
            )

            if suggestions:
                message += (
                    " Try: " +
                    ", ".join(suggestions)
                )

            return jsonify({
                "success": False,
                "error": message,
                "suggestions": suggestions
            }), 404

        # -------------------------------------------------
        # Normalize country information
        # -------------------------------------------------

        normalized = normalize_country(country)

        return jsonify({
            "success": True,
            "country": normalized
        })

    except requests.exceptions.Timeout:

        return jsonify({
            "success": False,
            "error": "The country service took too long to respond."
        }), 504

    except requests.exceptions.RequestException as error:

        return jsonify({
            "success": False,
            "error": f"Could not connect to the country service: {error}"
        }), 502

    except Exception as error:

        return jsonify({
            "success": False,
            "error": f"Something went wrong: {error}"
        }), 500


# ---------------------------------------------------------
# Run locally
# ---------------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
