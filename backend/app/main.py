from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.core.models import Action, Portfolio
from app.services.paper_broker import BrokerError, PaperBroker
from app.services.research import ResearchEngine, ResearchSignals

app = FastAPI(title="ORION API", version="0.2.0")
portfolio = Portfolio()
broker = PaperBroker(portfolio)
research = ResearchEngine()


class HealthResponse(BaseModel):
    status: str
    mode: str


class ResearchRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    news_sentiment: float = Field(ge=-1, le=1)
    momentum: float = Field(ge=-1, le=1)
    fundamentals: float = Field(ge=-1, le=1)
    macro: float = Field(ge=-1, le=1)
    risk: float = Field(ge=-1, le=1)


class PaperOrder(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    action: Action
    quantity: float = Field(gt=0)
    price: float = Field(gt=0)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", mode="paper-trading")


@app.get("/api/v1/overview")
def overview() -> dict:
    prices = {p.symbol: p.average_price for p in portfolio.positions.values()}
    return {
        "name": "ORION",
        "mode": "paper-trading",
        "portfolio_value": portfolio.equity(prices),
        "cash": portfolio.cash,
        "open_positions": len(portfolio.positions),
        "trades": len(portfolio.trades),
    }


@app.get("/api/v1/portfolio")
def portfolio_view() -> dict:
    return {
        "cash": portfolio.cash,
        "positions": [
            {"symbol": p.symbol, "quantity": p.quantity, "average_price": p.average_price}
            for p in portfolio.positions.values()
        ],
        "trades": [t.__dict__ for t in portfolio.trades],
    }


@app.post("/api/v1/research")
def research_decision(request: ResearchRequest) -> dict:
    decision = research.decide(ResearchSignals(
        request.news_sentiment,
        request.momentum,
        request.fundamentals,
        request.macro,
        request.risk,
    ))
    return {
        "symbol": request.symbol.upper(),
        "action": decision.action.value,
        "confidence": decision.confidence,
        "score": decision.score,
        "thesis": decision.thesis,
    }


@app.post("/api/v1/paper/orders")
def paper_order(order: PaperOrder) -> dict:
    try:
        trade = broker.execute(order.symbol.upper(), order.action, order.quantity, order.price)
    except BrokerError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"trade": trade.__dict__, "cash": portfolio.cash}
