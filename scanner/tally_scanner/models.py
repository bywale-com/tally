from __future__ import annotations

import hashlib
from dataclasses import dataclass, field


def dedup_hash(company: str, title: str) -> str:
    """sha256(lower(company) || '|' || lower(title)) — source NOT included."""
    key = f"{(company or '').strip().lower()}|{(title or '').strip().lower()}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


@dataclass
class RawPosting:
    company: str
    title: str
    source: str
    url: str | None = None
    raw_text: str = ""
    meta: dict = field(default_factory=dict)

    @property
    def hash(self) -> str:
        return dedup_hash(self.company, self.title)
