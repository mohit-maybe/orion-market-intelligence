from app.core.models import Action, Portfolio, Prediction
from app.services.learning import LearningEngine
from app.services.paper_broker import PaperBroker
from app.services.research import ResearchEngine, ResearchSignals


def run_demo() -> dict:
    portfolio = Portfolio()
    broker = PaperBroker(portfolio)
    research = ResearchEngine()
    learning = LearningEngine()

    signals = ResearchSignals(0.72, 0.55, 0.80, 0.20, -0.15)
    decision = research.decide(signals)
    prediction = Prediction(1, "DEMO", decision.action, decision.confidence, 0.04, decision.thesis)

    if decision.action is Action.BUY:
        broker.execute("DEMO", Action.BUY, 10, 100.0, prediction.id)

    lesson = learning.evaluate(prediction, 0.06)
    return {
        "decision": decision.action.value,
        "confidence": decision.confidence,
        "portfolio_equity": portfolio.equity({"DEMO": 106.0}),
        "lesson": lesson.title,
    }
