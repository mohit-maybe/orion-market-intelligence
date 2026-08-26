from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from app.backtest.engine import BacktestEngine
from app.data.alpha_vantage import AlphaVantageSource

router = APIRouter(prefix="/api/v1/backtest", tags=["backtest"])


@router.get("/{symbol}")
def run_backtest(symbol: str, days: int = 365) -> dict:
    if days < 30 or days > 5000:
        raise HTTPException(400, "days must be between 30 and 5000")
    try:
        source = AlphaVantageSource()
        end = datetime.now(timezone.utc)
        bars = source.history(symbol, end - timedelta(days=days), end)
        result = BacktestEngine().run(bars, symbol)
        return {"symbol": symbol.upper(), "trades": [t.__dict__ for t in result.trades], "total_return_pct": result.total_return_pct, "win_rate": result.win_rate}
    except Exception as exc:
        raise HTTPException(502, str(exc)) from exc
