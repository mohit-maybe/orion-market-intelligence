from __future__ import annotations

from dataclasses import dataclass

from app.core.models import Action


@dataclass(frozen=True)
class ResearchSignals:
    news_sentiment: float
    momentum: float
    fundamentals: float
    macro: float
    risk: float


@dataclass(frozen=True)
class ResearchDecision:
    action: Action
    confidence: float
    score: float
    thesis: str


class ResearchEngine:
    """Baseline signal combiner. LLM/ML adapters will replace individual signals later."""

    weights = {
        "news_sentiment": 0.25,
        "momentum": 0.20,
        "fundamentals": 0.30,
        "macro": 0.10,
        "risk": 0.15,
    }

    def decide(self, signals: ResearchSignals) -> ResearchDecision:
        values = signals.__dict__
        score = sum(values[name] * weight for name, weight in self.weights.items())
        confidence = min(0.99, 0.50 + abs(score) * 0.49)
        if score >= 0.25:
            action = Action.BUY
        elif score <= -0.25:
            action = Action.SELL
        else:
            action = Action.HOLD
        thesis = f"Composite research score {score:+.3f}; strongest evidence is derived from the configured baseline signals."
        return ResearchDecision(action, confidence, score, thesis)
