from __future__ import annotations

from dataclasses import dataclass
from itertools import count

from app.core.models import Action, Portfolio, Position, Trade


class BrokerError(ValueError):
    pass


@dataclass
class PaperBroker:
    portfolio: Portfolio

    def __post_init__(self) -> None:
        self._trade_ids = count(1)

    def execute(self, symbol: str, action: Action, quantity: float, price: float, prediction_id: int | None = None) -> Trade:
        if quantity <= 0 or price <= 0:
            raise BrokerError("Quantity and price must be positive")

        if action is Action.HOLD:
            raise BrokerError("HOLD is not an executable order")

        cost = quantity * price
        position = self.portfolio.positions.get(symbol)

        if action is Action.BUY:
            if cost > self.portfolio.cash:
                raise BrokerError("Insufficient paper cash")
            if position:
                total_cost = position.quantity * position.average_price + cost
                position.quantity += quantity
                position.average_price = total_cost / position.quantity
            else:
                self.portfolio.positions[symbol] = Position(symbol, quantity, price)
            self.portfolio.cash -= cost

        elif action is Action.SELL:
            if not position or position.quantity < quantity:
                raise BrokerError("Insufficient paper position")
            position.quantity -= quantity
            self.portfolio.cash += cost
            if position.quantity == 0:
                del self.portfolio.positions[symbol]

        trade = Trade(next(self._trade_ids), symbol, action, quantity, price, prediction_id)
        self.portfolio.trades.append(trade)
        return trade
