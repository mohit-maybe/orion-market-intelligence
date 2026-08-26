from __future__ import annotations

import math


def max_drawdown(returns_pct: list[float]) -> float:
    equity = peak = 1.0
    worst = 0.0
    for value in returns_pct:
        equity *= 1 + value / 100
        peak = max(peak, equity)
        worst = min(worst, (equity / peak - 1) * 100)
    return worst


def sharpe_ratio(returns_pct: list[float]) -> float:
    if len(returns_pct) < 2:
        return 0.0
    mean = sum(returns_pct) / len(returns_pct)
    variance = sum((r - mean) ** 2 for r in returns_pct) / (len(returns_pct) - 1)
    std = math.sqrt(variance)
    return mean / std * math.sqrt(len(returns_pct)) if std else 0.0
