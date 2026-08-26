from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class FeatureVector:
    news_sentiment: float
    momentum: float
    fundamentals: float
    macro: float
    risk: float


@dataclass(frozen=True)
class PredictionScore:
    probability_up: float
    model_version: str


class LogisticBaseline:
    """Small deterministic baseline. Replace with trained sklearn/XGBoost models after backtests exist."""

    version = "logistic-baseline-0.1"
    weights = (0.9, 1.1, 1.3, 0.4, -0.8)
    bias = 0.0

    def predict(self, features: FeatureVector) -> PredictionScore:
        x = (features.news_sentiment, features.momentum, features.fundamentals, features.macro, features.risk)
        z = self.bias + sum(w * value for w, value in zip(self.weights, x))
        probability = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, z))))
        return PredictionScore(probability, self.version)
