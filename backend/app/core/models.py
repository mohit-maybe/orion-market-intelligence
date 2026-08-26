from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Action(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


@dataclass
class Asset:
    symbol: str
    asset_type: str = "stock"
    name: str | None = None


@dataclass
class Prediction:
    id: int
    symbol: str
    action: Action
    confidence: float
    expected_return: float
    thesis: str
    created_at: datetime = field(default_factory=utcnow)
    outcome_return: float | None = None
    evaluated_at: datetime | None = None


@dataclass
class Position:
    symbol: str
    quantity: float
    average_price: float


@dataclass
class Trade:
    id: int
    symbol: str
    action: Action
    quantity: float
    price: float
    prediction_id: int | None = None
    timestamp: datetime = field(default_factory=utcnow)


@dataclass
class Portfolio:
    starting_cash: float = 100_000.0
    cash: float = 100_000.0
    positions: dict[str, Position] = field(default_factory=dict)
    trades: list[Trade] = field(default_factory=list)

    def market_value(self, prices: dict[str, float]) -> float:
        return sum(p.quantity * prices.get(p.symbol, p.average_price) for p in self.positions.values())

    def equity(self, prices: dict[str, float]) -> float:
        return self.cash + self.market_value(prices)

    def return_pct(self, prices: dict[str, float]) -> float:
        return (self.equity(prices) / self.starting_cash - 1.0) * 100.0


@dataclass
class Lesson:
    id: int
    prediction_id: int
    title: str
    observation: str
    created_at: datetime = field(default_factory=utcnow)


@dataclass
class TrainingRun:
    id: int
    predictions_analyzed: int
    lessons_created: int
    model_version: str
    summary: str
    created_at: datetime = field(default_factory=utcnow)
