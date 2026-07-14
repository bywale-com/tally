from __future__ import annotations

import html
import re

from bs4 import BeautifulSoup


def html_to_text(content: str | None) -> str:
    if not content:
        return ""
    unescaped = html.unescape(content)
    soup = BeautifulSoup(unescaped, "lxml")
    text = soup.get_text("\n", strip=True)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
