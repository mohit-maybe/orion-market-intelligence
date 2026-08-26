from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.data.ingestion import stable_news_id
from app.data.schemas import NewsItem, PriceBar
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
            if start <= timestamp <= end:
                result.append(PriceBar(symbol.upper(), timestamp, float(values["1. open"]), float(values["2. high"]), float(values["3. low"]), float(values["4. close"]), float(values.get("5. volume", 0)), self.name))
        return sorted(result, key=lambda bar: bar.timestamp)


class AlphaVantageNewsSource:
    name = "alpha_vantage_news"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("ALPHA_VANTAGE_API_KEY")
        if not self.api_key:
            raise RuntimeError("ALPHA_VANTAGE_API_KEY is not configured")

    def latest(self, symbols: list[str] | None = None, limit: int = 50) -> list[NewsItem]:
        params = {"function": "NEWS_SENTIMENT", "sort": "LATEST", "limit": str(min(limit, 1000)), "apikey": self.api_key}
        if symbols:
            params["tickers"] = ",".join(symbols)
        request = Request("https://www.alphavantage.co/query?" + urlencode(params), headers={"User-Agent": "ORION/0.2"})
        with urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
        items: list[NewsItem] = []
        for article in payload.get("feed", []):
            try:
                published_at = datetime.strptime(article.get("time_published", ""), "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc)
            except ValueError:
                published_at = datetime.now(timezone.utc)
            tickers = tuple(x.get("ticker", "").upper() for x in article.get("ticker_sentiment", []) if x.get("ticker"))
            score = article.get("overall_sentiment_score")
            items.append(NewsItem(stable_news_id(article.get("source", "unknown"), article.get("title", ""), article.get("url", "")), article.get("title", ""), article.get("url", ""), published_at, article.get("source", "unknown"), tickers, article.get("summary", ""), float(score) if score is not None else None))
        return items
