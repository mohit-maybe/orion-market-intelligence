from __future__ import annotations

import os
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json

from app.data.schemas import PriceBar
from app.data.sources import MarketDataSource


class AlphaVantageSource(MarketDataSource):
    name = "alpha_vantage"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("ALPHA_VANTAGE_API_KEY")
        if not self.api_key:
            raise RuntimeError("ALPHA_VANTAGE_API_KEY is not configured")

    def history(self, symbol: str, start: datetime, end: datetime) -> list[PriceBar]:
        params = urlencode({"function": "TIME_SERIES_DAILY", "symbol": symbol.upper(), "outputsize": "full", "apikey": self.api_key})
        request = Request(f"https://www.alphavantage.co/query?{params}", headers={"User-Agent": "ORION/0.2"})
        with urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
        series = payload.get("Time Series (Daily)", {})
        if not series:
            raise RuntimeError(payload.get("Note") or payload.get("Information") or "No Alpha Vantage time series returned")
        result: list[PriceBar] = []
        for day, values in series.items():
            timestamp = datetime.fromisoformat(day).replace(tzinfo=timezone.utc)
            if not (start <= timestamp <= end):
                continue
            result.append(PriceBar(symbol.upper(), timestamp, float(values["1. open"]), float(values["2. high"]), float(values["3. low"]), float(values["4. close"]), float(values.get("5. volume", 0)), self.name))
        return sorted(result, key=lambda bar: bar.timestamp)
