from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from app.data.schemas import PriceBar
from app.services.research import ResearchDecision, ResearchEngine, ResearchSignals


@dataclass(frozen=True)
class BacktestTrade:
    symbol: str
    timestamp: datetime
    action: str
    entry_price: float
    exit_price: float
    return_pct: float


@dataclass(frozen=True)
class BacktestResult:
    trades: list[BacktestTrade]
    total_return_pct: float
    win_rate: float


class BacktestEngine:
    """Chronological replay. A bar is never used to make a decision before its timestamp."""

    def __init__(self, research: ResearchEngine | None = None):
        self.research = research or ResearchEngine()

    def run(self, bars: list[PriceBar], symbol: str) -> BacktestResult:
        ordered = sorted((b for b in bars if b.symbol.upper() == symbol.upper()), key=lambda b: b.timestamp)
        trades: list[BacktestTrade] = []
        for index in range(1, len(ordered) - 1):
            current = ordered[index]
            previous = ordered[index - 1]
            momentum = max(-1.0, min(1.0, (current.close / previous.close - 1.0) * 20.0))
            signals = ResearchSignals(0.0, momentum, 0.0, 0.0, 0.0)
            decision: ResearchDecision = self.research.decide(signals)
            future = ordered[index + 1]
            if decision.action.value == "BUY":
                result = future.close / current.close - 1.0
            elif decision.action.value == "SELL":
                result = current.close / future.close - 1.0
            else:
                continue
            trades.append(BacktestTrade(symbol.upper(), current.timestamp, decision.action.value, current.close, future.close, result * 100))

        total = 1.0
        for trade in trades:
            total *= 1.0 + trade.return_pct / 100.0
        wins = sum(t.return_pct > 0 for t in trades)
        return BacktestResult(trades, (total - 1.0) * 100.0, wins / len(trades) if trades else 0.0)
