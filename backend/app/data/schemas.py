from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True)
class PriceBar:
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0
    source: str = "unknown"


@dataclass(frozen=True)
class NewsItem:
    id: str
    title: str
    url: str
    published_at: datetime
    source: str
    symbols: tuple[str, ...] = ()
    summary: str = ""
    sentiment: float | None = None
    fetched_at: datetime = utcnow()


@dataclass(frozen=True)
class Evidence:
    source_id: str
    source_type: str
    text: str
    timestamp: datetime
    relevance: float
    symbols: tuple[str, ...] = ()
