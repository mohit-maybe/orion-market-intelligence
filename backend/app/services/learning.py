from __future__ import annotations

from dataclasses import dataclass
from statistics import mean

from app.core.models import Action, Lesson, Prediction, TrainingRun


@dataclass
class LearningEngine:
    model_version: str = "baseline-0.1"

    def evaluate(self, prediction: Prediction, actual_return: float) -> Lesson:
        prediction.outcome_return = actual_return
        error = actual_return - prediction.expected_return
        direction_correct = (
            prediction.action is Action.HOLD
            or (prediction.action is Action.BUY and actual_return > 0)
            or (prediction.action is Action.SELL and actual_return < 0)
        )
        title = "Signal validated" if direction_correct else "Signal failed"
        observation = (
            f"Expected {prediction.expected_return:.2%}, observed {actual_return:.2%}; "
            f"signed error {error:.2%}. Confidence was {prediction.confidence:.0%}."
        )
        return Lesson(prediction.id, prediction.id, title, observation)

    def training_run(self, predictions: list[Prediction], run_id: int) -> TrainingRun:
        evaluated = [p for p in predictions if p.outcome_return is not None]
        if not evaluated:
            return TrainingRun(run_id, 0, 0, self.model_version, "No evaluated predictions yet.")

        correct = sum(
            (p.action is Action.HOLD)
            or (p.action is Action.BUY and p.outcome_return > 0)
            or (p.action is Action.SELL and p.outcome_return < 0)
            for p in evaluated
        )
        avg_error = mean(abs(p.outcome_return - p.expected_return) for p in evaluated)
        summary = (
            f"Analyzed {len(evaluated)} predictions. Directional accuracy: "
            f"{correct / len(evaluated):.1%}. Mean absolute return error: {avg_error:.2%}."
        )
        return TrainingRun(run_id, len(evaluated), 0, self.model_version, summary)
