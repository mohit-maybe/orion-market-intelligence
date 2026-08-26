# ORION — Adaptive Market Intelligence

ORION is a research-first market intelligence and paper-trading platform. It ingests structured market/news data, extracts evidence-grounded signals, generates hypotheses, simulates portfolio decisions, evaluates outcomes, and records lessons for future model experiments.

> **Safety / research boundary:** ORION is paper-trading software. It does not connect to a brokerage or execute real-money trades.

## MVP

- FastAPI backend
- SQLite development database
- Asset, prediction, paper-trade, lesson and training-run models
- Deterministic research/scoring engine
- Paper portfolio simulator
- Post-mortem learning loop
- Next.js dashboard shell
- Clear separation between data ingestion, research, decision, execution simulation and learning

## Architecture

```text
Data sources -> ingestion -> normalized evidence -> research signals
                                              -> decision engine
                                              -> paper broker
                                              -> outcomes
                                              -> post-mortem
                                              -> lessons / training runs
                                              -> next experiment
```

## Roadmap

1. Working local MVP and dashboard
2. Historical market-data adapters + backtesting
3. News/RSS ingestion and deduplication
4. LLM research agents with structured outputs
5. ML prediction/calibration model
6. Model/version experiment tracking
7. Concept-drift detection and adaptive training
8. Expanded asset universe and production deployment

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
# activate the environment
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:3000` and API docs at `http://localhost:8000/docs`.

## License

MIT
