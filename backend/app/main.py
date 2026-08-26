from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="ORION API", version="0.1.0")


class HealthResponse(BaseModel):
    status: str
    mode: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", mode="paper-trading")


@app.get("/api/v1/overview")
def overview() -> dict:
    return {
        "name": "ORION",
        "mode": "paper-trading",
        "portfolio_value": 100_000.0,
        "cash": 100_000.0,
        "open_positions": 0,
        "predictions": 0,
        "lessons": 0,
    }
