"""North America location gate for LinkedIn batch seeds."""

from __future__ import annotations

import re

NA_COUNTRY = re.compile(
    r"\b(united states|usa|u\.?s\.?a?\.?|canada|mexico|puerto rico|north america)\b",
    re.I,
)
NA_REGION = re.compile(
    r"\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|"
    r"delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|"
    r"kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|"
    r"mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|"
    r"new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|"
    r"pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|"
    r"utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|"
    r"district of columbia|dc\b|"
    r"ontario|quebec|british columbia|alberta|manitoba|saskatchewan|"
    r"nova scotia|new brunswick|newfoundland|prince edward island|"
    r"yukon|nunavut|northwest territories|"
    r"ciudad de méxico|mexico city|jalisco|nuevo león|guadalajara|monterrey"
    r")\b",
    re.I,
)
US_CA_ABBR = re.compile(
    r",\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|"
    r"MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC"
    r"|AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b"
)
NON_NA = re.compile(
    r"\b(united kingdom|uk\b|england|scotland|wales|ireland|germany|france|"
    r"netherlands|sweden|norway|denmark|finland|spain|italy|portugal|"
    r"belgium|austria|switzerland|poland|czech|hungary|romania|bulgaria|"
    r"india|bangalore|bengaluru|mumbai|delhi|hyderabad|pune|chennai|"
    r"singapore|australia|sydney|melbourne|new zealand|"
    r"israel|tel aviv|dubai|uae|emirates|"
    r"brazil|são paulo|sao paulo|argentina|chile|colombia|"
    r"japan|tokyo|china|beijing|shanghai|hong kong|taiwan|korea|seoul|"
    r"south africa|nigeria|kenya|egypt)\b",
    re.I,
)


def classify_location(loc: str) -> str:
    """Return 'na' | 'non_na' | 'unknown'."""
    s = (loc or "").strip()
    if not s or s.lower() in ("unknown", "—", "-", "n/a"):
        return "unknown"
    if NON_NA.search(s) and not NA_COUNTRY.search(s) and not US_CA_ABBR.search(s):
        return "non_na"
    if NA_COUNTRY.search(s) or NA_REGION.search(s) or US_CA_ABBR.search(s):
        return "na"
    if re.search(r"\bremote\b", s, re.I):
        return "unknown"
    return "unknown"


def should_skip_seed(loc: str) -> bool:
    """Skip when location is known and not North America."""
    return classify_location(loc) == "non_na"
