from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

from app.data.schemas import NewsItem


@dataclass
class IngestionStats:
    received: int = 0
    accepted: int = 0
    duplicates: int = 0


def canonical_title(title: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", title.lower())).strip()


def stable_news_id(source: str, title: str, url: str) -> str:
    payload = f"{source}|{canonical_title(title)}|{url.split('?')[0]}".encode()
    return hashlib.sha256(payload).hexdigest()[:24]


class NewsNormalizer:
    def normalize(self, raw: dict) -> NewsItem:
        source = str(raw.get("source") or raw.get("publisher") or "unknown")
        title = str(raw.get("title") or "").strip()
        url = str(raw.get("url") or "").strip()
        published_at = raw["published_at"]
        return NewsItem(
            id=stable_news_id(source, title, url),
            title=title,
            url=url,
            published_at=published_at,
            source=source,
            symbols=tuple(str(s).upper() for s in raw.get("symbols", ())),
            summary=str(raw.get("summary") or ""),
            sentiment=raw.get("sentiment"),
        )


class NewsDeduplicator:
    def __init__(self) -> None:
        self._seen: set[str] = set()

    def filter(self, items: list[NewsItem]) -> tuple[list[NewsItem], IngestionStats]:
        stats = IngestionStats(received=len(items))
        accepted: list[NewsItem] = []
        for item in items:
            if item.id in self._seen:
                stats.duplicates += 1
                continue
            self._seen.add(item.id)
            accepted.append(item)
        stats.accepted = len(accepted)
        return accepted, stats
