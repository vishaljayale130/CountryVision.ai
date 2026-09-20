from flask import Flask, render_template, jsonify
import requests
from urllib.parse import quote

app = Flask(__name__)

# countries.dev API
COUNTRIES_API = "https://countries.dev"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/country/<country_name>")
def get_country(country_name):

    # Remove extra spaces
    country_name = country_name.strip()

    # Check if user entered something
    if not country_name:
        return jsonify({
            "error": "Please enter a country name."
        }), 400

    try:
        # Search country by name
        url = f"{COUNTRIES_API}/name/{quote(country_name)}"

        response = requests.get(
            url,
            timeout=15
        )

        # Country not found
        if response.status_code == 404:
            return jsonify({
                "error": "Country not found."
            }), 404

        # Other API error
        if response.status_code != 200:
            return jsonify({
                "error": "Country API returned an error."
            }), 502

        data = response.json()

        # Make sure we received a list
        if not isinstance(data, list) or len(data) == 0:
            return jsonify({
                "error": "Country not found."
            }), 404

        # ------------------------------------------------
        # FIND EXACT COUNTRY NAME
        # ------------------------------------------------

        country = None

        search_name = country_name.lower().strip()

        for item in data:

            item_name = str(
                item.get("name", "")
            ).strip().lower()

            native_name = str(
                item.get("nativeName", "")
            ).strip().lower()

            # Exact common name
            if item_name == search_name:
                country = item
                break

            # Exact native name
            if native_name == search_name:
                country = item
                break

        # ------------------------------------------------
        # IF EXACT COUNTRY WAS NOT FOUND
        # ------------------------------------------------

        if country is None:

            # Try matching alternative spellings
            for item in data:

                alternatives = item.get(
                    "altSpellings",
                    []
                )

                if isinstance(alternatives, list):

                    for alternative in alternatives:

                        if str(alternative).lower().strip() == search_name:
                            country = item
                            break

                if country is not None:
                    break

        # ------------------------------------------------
        # DO NOT SHOW A RANDOM PARTIAL MATCH
        # ------------------------------------------------

        if country is None:
            return jsonify({
                "error": f'Exact country "{country_name}" was not found.',
                "suggestions": [
                    item.get("name", "")
                    for item in data[:10]
                ]
            }), 404

        # ------------------------------------------------
        # BASIC COUNTRY INFORMATION
        # ------------------------------------------------

        name = country.get("name", "Unknown")

        official_name = country.get(
            "officialName",
            country.get("name", "Unknown")
        )

        capital = country.get(
            "capital",
            "Not available"
        )

        if isinstance(capital, list):
            capital = (
                capital[0]
                if len(capital) > 0
                else "Not available"
            )

        region = country.get(
            "region",
            "Not available"
        )

        subregion = country.get(
            "subregion",
            "Not available"
        )

        continent = country.get(
            "continent",
            "Not available"
        )

        population = country.get(
            "population",
            0
        )

        area = country.get(
            "area",
            0
        )

        # ------------------------------------------------
        # CURRENCY
        # ------------------------------------------------

        currencies = country.get(
            "currencies",
            []
        )

        currency_list = []
        currency_text = "Not available"

        if isinstance(currencies, list):

            for currency in currencies:

                if isinstance(currency, dict):

                    code = currency.get(
                        "code",
                        ""
                    )

                    currency_name = currency.get(
                        "name",
                        ""
                    )

                    symbol = currency.get(
                        "symbol",
                        ""
                    )

                    parts = []

                    if currency_name:
                        parts.append(currency_name)

                    if code:
                        parts.append(f"({code})")

                    if symbol:
                        parts.append(symbol)

                    if parts:
                        currency_list.append(
                            " ".join(parts)
                        )

        if currency_list:
            currency_text = ", ".join(currency_list)

        # ------------------------------------------------
        # LANGUAGES
        # ------------------------------------------------

        languages = country.get(
            "languages",
            []
        )

        language_list = []

        if isinstance(languages, list):

            for language in languages:

                if isinstance(language, dict):

                    language_name = language.get(
                        "name",
                        ""
                    )

                    if language_name:
                        language_list.append(
                            language_name
                        )

                elif isinstance(language, str):

                    language_list.append(language)

        language_text = (
            ", ".join(language_list)
            if language_list
            else "Not available"
        )

        # ------------------------------------------------
        # TIMEZONES
        # ------------------------------------------------

        timezones = country.get(
            "timezones",
            []
        )

        if isinstance(timezones, list):

            timezone_list = [
                str(timezone)
                for timezone in timezones
            ]

        else:
            timezone_list = []

        timezone_text = (
            ", ".join(timezone_list)
            if timezone_list
            else "Not available"
        )

        # ------------------------------------------------
        # BORDERS
        # ------------------------------------------------

        borders = country.get(
            "borders",
            []
        )

        if not isinstance(borders, list):
            borders = []

        border_text = (
            ", ".join(borders)
            if borders
            else "No land borders"
        )

        # ------------------------------------------------
        # LOCATION
        # ------------------------------------------------

        latlng = country.get(
            "latlng",
            []
        )

        latitude = None
        longitude = None

        if isinstance(latlng, list) and len(latlng) >= 2:

            latitude = latlng[0]
            longitude = latlng[1]

        # ------------------------------------------------
        # FLAG
        # ------------------------------------------------

        flags = country.get(
            "flags",
            {}
        )

        flag_image = ""

        if isinstance(flags, dict):

            flag_image = flags.get(
                "svg",
                flags.get(
                    "png",
                    ""
                )
            )

        flag_emoji = country.get(
            "flag",
            ""
        )

        # ------------------------------------------------
        # OTHER INFORMATION
        # ------------------------------------------------

        demonym = country.get(
            "demonym",
            "Not available"
        )

        calling_codes = country.get(
            "callingCodes",
            []
        )

        calling_code = "Not available"

        if isinstance(calling_codes, list) and calling_codes:

            calling_code = ", ".join(
                "+" + str(code).replace("+", "")
                for code in calling_codes
            )

        domains = country.get(
            "topLevelDomain",
            []
        )

        if isinstance(domains, list):

            domain_text = ", ".join(
                str(domain)
                for domain in domains
            )

        else:
            domain_text = "Not available"

        alpha2 = country.get(
            "alpha2Code",
            ""
        )

        alpha3 = country.get(
            "alpha3Code",
            ""
        )

        numeric_code = country.get(
            "numericCode",
            ""
        )

        # ------------------------------------------------
        # CREATE FINAL RESULT
        # ------------------------------------------------

        result = {

            "name": name,

            "official_name": official_name,

            "capital": capital,

            "region": region,

            "subregion": subregion,

            "continent": continent,

            "population": population,

            "area": area,

            "currency": currency_text,

            "currencies": currency_list,

            "languages": language_list,

            "language_text": language_text,

            "timezone_text": timezone_text,

            "timezones": timezone_list,

            "borders": borders,

            "borders_text": border_text,

            "latitude": latitude,

            "longitude": longitude,

            "flag": flag_image,

            "flag_emoji": flag_emoji,

            "demonym": demonym,

            "calling_code": calling_code,

            "tld_text": domain_text,

            "tld": domains,

            "driving_side": "Not available",

            "cca2": alpha2,

            "cca3": alpha3,

            "ccn3": numeric_code,

            "landlocked": len(borders) == 0,

            "independent": True,

            "un_member": True,

            "status": "Country",

            "start_of_week": "Not available",

            "retrieved_at": "Live data from countries.dev"
        }

        return jsonify(result)

    except requests.exceptions.Timeout:

        return jsonify({
            "error": "The country API took too long to respond."
        }), 504

    except requests.exceptions.RequestException:

        return jsonify({
            "error": "Could not connect to the country API."
        }), 502

    except Exception as error:

        print("ERROR:", error)

        return jsonify({
            "error": "Something went wrong while getting country information."
        }), 500


# ------------------------------------------------
# START FLASK SERVER
# ------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )