from __future__ import annotations

from dataclasses import dataclass, field
from math import exp
from statistics import mean


@dataclass
class Experience:
    features: dict[str, float]
    predicted_probability: float
    actual_return: float


@dataclass
class AdaptiveLogisticModel:
    """Small online logistic model for research/paper-trading experiments.

    It updates only after an outcome is known, so a live decision cannot use its
    own future outcome. The model is intentionally interpretable and dependency-light.
    """

    learning_rate: float = 0.03
    weights: dict[str, float] = field(default_factory=dict)
    bias: float = 0.0
    steps: int = 0

    def _score(self, features: dict[str, float]) -> float:
        return self.bias + sum(self.weights.get(k, 0.0) * v for k, v in features.items())

    @staticmethod
    def _sigmoid(value: float) -> float:
        value = max(-40.0, min(40.0, value))
        return 1.0 / (1.0 + exp(-value))

    def predict_up_probability(self, features: dict[str, float]) -> float:
        return self._sigmoid(self._score(features))

    def update(self, features: dict[str, float], actual_return: float) -> Experience:
        target = 1.0 if actual_return > 0 else 0.0
        probability = self.predict_up_probability(features)
        error = probability - target
        self.bias -= self.learning_rate * error
        for name, value in features.items():
            self.weights[name] = self.weights.get(name, 0.0) - self.learning_rate * error * value
        self.steps += 1
        return Experience(features, probability, actual_return)

    def batch_update(self, experiences: list[Experience]) -> dict:
        for experience in experiences:
            self.update(experience.features, experience.actual_return)
        return self.summary()

    def summary(self) -> dict:
        return {
            "version": f"online-logistic-{self.steps}",
            "steps": self.steps,
            "bias": self.bias,
            "weights": dict(sorted(self.weights.items())),
        }


@dataclass
class LearningReport:
    observations: int
    directional_accuracy: float
    mean_absolute_error: float
    model_version: str
    changes: list[str]


def evaluate_predictions(rows: list[tuple[float, float]], model_version: str) -> LearningReport:
    if not rows:
        return LearningReport(0, 0.0, 0.0, model_version, [])
    correct = sum((p >= 0.5) == (actual > 0) for p, actual in rows)
    mae = mean(abs((p * 2 - 1) - actual) for p, actual in rows)
    return LearningReport(len(rows), correct / len(rows), mae, model_version, [])
