from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from app.data.schemas import NewsItem, PriceBar


class MarketDataSource(ABC):
    name = "base"

    @abstractmethod
    def history(self, symbol: str, start: datetime, end: datetime) -> list[PriceBar]:
        raise NotImplementedError


class NewsSource(ABC):
    name = "base"

    @abstractmethod
    def latest(self, symbols: list[str] | None = None) -> list[NewsItem]:
        raise NotImplementedError


class FixtureMarketSource(MarketDataSource):
    """Offline deterministic source used until an external provider is configured."""

    name = "fixture"

    def __init__(self, bars: list[PriceBar] | None = None):
        self.bars = bars or []

    def history(self, symbol: str, start: datetime, end: datetime) -> list[PriceBar]:
        return [b for b in self.bars if b.symbol.upper() == symbol.upper() and start <= b.timestamp <= end]


class FixtureNewsSource(NewsSource):
    name = "fixture"

    def __init__(self, items: list[NewsItem] | None = None):
        self.items = items or []

    def latest(self, symbols: list[str] | None = None) -> list[NewsItem]:
        if not symbols:
            return list(self.items)
        wanted = {s.upper() for s in symbols}
        return [item for item in self.items if wanted.intersection(item.symbols)]
