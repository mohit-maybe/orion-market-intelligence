from __future__ import annotations

from dataclasses import dataclass

from app.core.models import Lesson


@dataclass
class AdaptiveWeights:
    news: float = 0.25
    momentum: float = 0.20
    fundamentals: float = 0.30
    macro: float = 0.10
    risk: float = 0.15
    version: int = 1

    def apply_lessons(self, lessons: list[Lesson]) -> "AdaptiveWeights":
        """Conservative adaptation: lessons alter feature emphasis only after evaluation.

        This is intentionally bounded; future ML training will compare candidate models
        on a held-out period before promotion.
        """
        result = AdaptiveWeights(self.news, self.momentum, self.fundamentals, self.macro, self.risk, self.version)
        for lesson in lessons[-20:]:
            text = lesson.observation.lower()
            if "sentiment" in text:
                result.news *= 0.97
            if "macro" in text:
                result.macro *= 1.03
            if "momentum" in text:
                result.momentum *= 1.01
        total = result.news + result.momentum + result.fundamentals + result.macro + result.risk
        result.news /= total
        result.momentum /= total
        result.fundamentals /= total
        result.macro /= total
        result.risk /= total
        result.version += 1
        return result
