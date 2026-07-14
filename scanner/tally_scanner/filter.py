"""
Regex filter — handoff §3 VERBATIM.

Loose by design: kill obvious garbage; borderline postings pass; LLM disqualifies.
A posting passes if it matches ANY role string OR ANY confession string.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass


def normalize_text(text: str) -> str:
    """Lowercase, unify hyphen variants, collapse whitespace."""
    if not text:
        return ""
    t = unicodedata.normalize("NFKC", text).lower()
    # Unify hyphen / dash variants to space for matching self-sourced ≡ self sourced
    t = re.sub(r"[\u2010-\u2015\u2212\-_/]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


# Role strings (verbatim list; matched as substrings after normalize)
ROLE_STRINGS: list[str] = [
    "founding account executive",
    "founding ae",
    "first sales hire",
    "founding sales",
    "first account executive",
    "founding gtm",
    "go to market lead",
    "first bdr",
]

# Roles that need co-occurrence
ROLE_WITH_COOCCURRENCE: list[tuple[str, list[str]]] = [
    ("head of sales", ["early stage", "seed", "series a"]),
    ("player coach", ["sales"]),
]

CONFESSION_STRINGS: list[str] = [
    "self sourced",
    "no inbound",
    "no sdr",
    "build your own pipeline",
    "no leads provided",
    "100% new business",
    "greenfield",
    "from scratch",
    "first sales hire reporting to the ceo",
]


@dataclass
class FilterResult:
    passed: bool
    confession_hit: bool
    confession_quote: str | None
    matched_role: str | None
    matched_confession: str | None


def _find_line_containing(raw: str, needle_normalized: str) -> str | None:
    """Return the original line that contains the normalized needle (best-effort)."""
    for line in raw.splitlines():
        if needle_normalized in normalize_text(line):
            return line.strip()
    # Fallback: window around first occurrence in normalized body
    norm = normalize_text(raw)
    idx = norm.find(needle_normalized)
    if idx < 0:
        return None
    start = max(0, idx - 40)
    end = min(len(norm), idx + len(needle_normalized) + 40)
    return norm[start:end].strip()


def filter_posting(title: str, body: str) -> FilterResult:
    combined_raw = f"{title}\n{body or ''}"
    text = normalize_text(combined_raw)

    confession_hit = False
    confession_quote: str | None = None
    matched_confession: str | None = None

    for c in CONFESSION_STRINGS:
        if c in text:
            confession_hit = True
            matched_confession = c
            confession_quote = _find_line_containing(combined_raw, c)
            break

    matched_role: str | None = None
    for role in ROLE_STRINGS:
        if role in text:
            matched_role = role
            break

    if matched_role is None:
        for role, needs in ROLE_WITH_COOCCURRENCE:
            if role in text and any(n in text for n in needs):
                matched_role = role
                break

    passed = matched_role is not None or confession_hit
    return FilterResult(
        passed=passed,
        confession_hit=confession_hit,
        confession_quote=confession_quote,
        matched_role=matched_role,
        matched_confession=matched_confession,
    )
