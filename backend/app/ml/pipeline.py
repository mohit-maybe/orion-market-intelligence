from __future__ import annotations

from dataclasses import dataclass

from app.ml.adaptive import AdaptiveLogisticModel, Experience


@dataclass
class PredictionRecord:
    symbol: str
    probability_up: float
    features: dict[str, float]
    model_version: str
    outcome_return: float | None = None


class MLPipeline:
    """Inference + delayed online updates. Outcomes are required before learning."""

    def __init__(self, model: AdaptiveLogisticModel | None = None):
        self.model = model or AdaptiveLogisticModel()
        self.pending: list[PredictionRecord] = []
        self.experiences: list[Experience] = []

    def predict(self, symbol: str, features: dict[str, float]) -> PredictionRecord:
        probability = self.model.predict_up_probability(features)
        record = PredictionRecord(symbol, probability, dict(features), self.model.summary()["version"])
        self.pending.append(record)
        return record

    def resolve(self, record: PredictionRecord, actual_return: float) -> Experience:
        record.outcome_return = actual_return
        experience = self.model.update(record.features, actual_return)
        self.experiences.append(experience)
        self.pending = [item for item in self.pending if item is not record]
        return experience

    def status(self) -> dict:
        return {
            "model": self.model.summary(),
            "pending_predictions": len(self.pending),
            "training_examples": len(self.experiences),
        }
