"""NA location filter stats for LinkedIn batch seeds."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

WASHED = Path(__file__).resolve().parents[2] / "apps" / "tally" / "public" / "washed-jobs.json"

# US states (abbrev + common names), CA provinces, MX, explicit country tokens
NA_COUNTRY = re.compile(
    r"\b(united states|usa|u\.?s\.?a?\.?|canada|mexico|puerto rico)\b", re.I
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
# LinkedIn often uses "City, ST" or "City, State, Country"
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
    r"south africa|nigeria|kenya|egypt|"
    r"remote\s*[-–—]\s*(?!.*(united states|usa|canada|north america)))\b",
    re.I,
)


def classify_location(loc: str) -> str:
    s = (loc or "").strip()
    if not s or s.lower() in ("unknown", "—", "-", "n/a"):
        return "unknown"
    if NON_NA.search(s) and not NA_COUNTRY.search(s) and not US_CA_ABBR.search(s):
        return "non_na"
    if NA_COUNTRY.search(s) or NA_REGION.search(s) or US_CA_ABBR.search(s):
        return "na"
    # Remote without geography — treat as unknown (still scrape per user's rule)
    if re.search(r"\bremote\b", s, re.I):
        return "unknown"
    return "unknown"


def main() -> None:
    jobs = json.loads(WASHED.read_text(encoding="utf-8"))["jobs"]
    li = [j for j in jobs if j.get("source") == "linkedin"]

    by_tier: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for j in li:
        tier = j.get("relevance") or "other"
        cls = classify_location(j.get("location_raw") or "")
        by_tier[tier][cls] += 1

    print("=== LinkedIn jobs by tier x location class ===")
    for tier in ("founding_sales", "founding", "sales", "other"):
        d = by_tier[tier]
        total = sum(d.values())
        skip = d.get("non_na", 0)
        scrape_na = d.get("na", 0)
        scrape_unk = d.get("unknown", 0)
        scrape = scrape_na + scrape_unk
        print(f"\n{tier} ({total} jobs):")
        print(f"  scrape (NA known):     {scrape_na}")
        print(f"  scrape (unknown loc):  {scrape_unk}")
        print(f"  SKIP (non-NA known):   {skip}")
        print(f"  => would scrape:        {scrape}")

    p1 = [j for j in li if j.get("relevance") in ("founding_sales", "founding")]
    skip1 = sum(1 for j in p1 if classify_location(j.get("location_raw") or "") == "non_na")
    print(f"\n=== Phase 1 (founding_sales + founding) ===")
    print(f"  total: {len(p1)}  skip non-NA: {skip1}  scrape: {len(p1)-skip1}")


if __name__ == "__main__":
    main()
