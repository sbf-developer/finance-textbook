"""Transparent finance and quantitative-finance examples.

The module deliberately uses small, auditable functions. It is educational
code, not production trading or risk infrastructure. Simulated data generated
by this module are labelled as simulated and must not be presented as market
history or a forecast.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd


def fv(present_value: float, rate: float, periods: int) -> float:
    """Future value under annual effective compounding."""
    if periods < 0:
        raise ValueError("periods must be non-negative")
    return float(present_value * (1.0 + rate) ** periods)


def pv(future_value: float, rate: float, periods: int) -> float:
    """Present value under annual effective compounding."""
    if periods < 0 or 1.0 + rate <= 0.0:
        raise ValueError("invalid rate or periods")
    return float(future_value / (1.0 + rate) ** periods)


def annuity_pv(payment: float, rate: float, periods: int) -> float:
    """Present value of an end-of-period level annuity."""
    if periods < 0 or 1.0 + rate <= 0.0:
        raise ValueError("invalid rate or periods")
    if rate == 0.0:
        return float(payment * periods)
    return float(payment * (1.0 - (1.0 + rate) ** (-periods)) / rate)


def bond_price(
    face: float,
    coupon_rate: float,
    yield_rate: float,
    maturity: int,
    payments_per_year: int = 1,
) -> float:
    """Price a plain fixed-coupon bond using a matched yield convention."""
    if face <= 0 or maturity <= 0 or payments_per_year <= 0:
        raise ValueError("face, maturity, and payment frequency must be positive")
    period_rate = yield_rate / payments_per_year
    if 1.0 + period_rate <= 0.0:
        raise ValueError("yield gives a non-positive discount base")
    periods = maturity * payments_per_year
    coupon = face * coupon_rate / payments_per_year
    return float(
        sum(coupon / (1.0 + period_rate) ** k for k in range(1, periods + 1))
        + face / (1.0 + period_rate) ** periods
    )


def bond_duration(
    face: float,
    coupon_rate: float,
    yield_rate: float,
    maturity: int,
    payments_per_year: int = 1,
) -> tuple[float, float]:
    """Return Macaulay and modified duration in years."""
    period_rate = yield_rate / payments_per_year
    if 1.0 + period_rate <= 0.0:
        raise ValueError("yield gives a non-positive discount base")
    periods = maturity * payments_per_year
    coupon = face * coupon_rate / payments_per_year
    cashflows = [coupon] * periods
    cashflows[-1] += face
    pv_cashflows = [cf / (1.0 + period_rate) ** k for k, cf in enumerate(cashflows, 1)]
    price = sum(pv_cashflows)
    macaulay = sum((k / payments_per_year) * value for k, value in enumerate(pv_cashflows, 1)) / price
    modified = macaulay / (1.0 + period_rate)
    return float(macaulay), float(modified)


def normal_cdf(x: float) -> float:
    """Standard normal cumulative distribution function."""
    return 0.5 * (1.0 + math.erf(float(x) / math.sqrt(2.0)))


def bsm_call(
    spot: float,
    strike: float,
    rate: float,
    volatility: float,
    maturity: float,
    dividend_yield: float = 0.0,
) -> float:
    """Black-Scholes-Merton European call with continuous rates/yield."""
    if min(spot, strike, volatility, maturity) <= 0.0:
        raise ValueError("spot, strike, volatility, and maturity must be positive")
    d1 = (
        math.log(spot / strike)
        + (rate - dividend_yield + 0.5 * volatility**2) * maturity
    ) / (volatility * math.sqrt(maturity))
    d2 = d1 - volatility * math.sqrt(maturity)
    return float(
        spot * math.exp(-dividend_yield * maturity) * normal_cdf(d1)
        - strike * math.exp(-rate * maturity) * normal_cdf(d2)
    )


def bsm_put(
    spot: float,
    strike: float,
    rate: float,
    volatility: float,
    maturity: float,
    dividend_yield: float = 0.0,
) -> float:
    """Black-Scholes-Merton European put via put-call parity."""
    call = bsm_call(spot, strike, rate, volatility, maturity, dividend_yield)
    return float(
        call - spot * math.exp(-dividend_yield * maturity) + strike * math.exp(-rate * maturity)
    )


def binomial_call(
    spot: float,
    strike: float,
    rate: float,
    volatility: float,
    maturity: float,
    steps: int = 100,
) -> float:
    """European call in a Cox-Ross-Rubinstein binomial model."""
    if min(spot, strike, volatility, maturity) <= 0.0 or steps < 1:
        raise ValueError("invalid binomial inputs")
    dt = maturity / steps
    up = math.exp(volatility * math.sqrt(dt))
    down = 1.0 / up
    growth = math.exp(rate * dt)
    q = (growth - down) / (up - down)
    if not 0.0 < q < 1.0:
        raise ValueError("risk-neutral probability is outside (0, 1)")
    prices = np.array([spot * up**j * down ** (steps - j) for j in range(steps + 1)])
    values = np.maximum(prices - strike, 0.0)
    discount = math.exp(-rate * dt)
    for _ in range(steps):
        values = discount * (q * values[1:] + (1.0 - q) * values[:-1])
    return float(values[0])


def simulate_gbm(
    spot: float,
    drift: float,
    volatility: float,
    maturity: float,
    steps: int,
    paths: int,
    seed: int | None = None,
) -> np.ndarray:
    """Simulate geometric Brownian motion paths under a stated drift."""
    if min(spot, volatility, maturity, steps, paths) <= 0:
        raise ValueError("spot, volatility, maturity, steps, and paths must be positive")
    rng = np.random.default_rng(seed)
    dt = maturity / steps
    shocks = rng.standard_normal((paths, steps))
    increments = (drift - 0.5 * volatility**2) * dt + volatility * math.sqrt(dt) * shocks
    log_paths = np.c_[np.zeros(paths), np.cumsum(increments, axis=1)]
    return spot * np.exp(log_paths)


def monte_carlo_call(
    terminal_prices: Iterable[float], strike: float, rate: float, maturity: float
) -> tuple[float, float]:
    """Return discounted call estimate and standard error."""
    terminals = np.asarray(list(terminal_prices), dtype=float)
    if terminals.size < 2 or strike < 0 or maturity < 0:
        raise ValueError("need at least two terminal prices and valid payoff inputs")
    discounted_payoffs = np.exp(-rate * maturity) * np.maximum(terminals - strike, 0.0)
    estimate = float(np.mean(discounted_payoffs))
    standard_error = float(np.std(discounted_payoffs, ddof=1) / math.sqrt(terminals.size))
    return estimate, standard_error


def portfolio_stats(
    weights: Iterable[float], means: Iterable[float], covariance: Iterable[Iterable[float]]
) -> dict[str, float]:
    """Return expected return, variance, and volatility for a portfolio."""
    w = np.asarray(list(weights), dtype=float)
    mu = np.asarray(list(means), dtype=float)
    sigma = np.asarray(covariance, dtype=float)
    if w.ndim != 1 or mu.shape != w.shape or sigma.shape != (w.size, w.size):
        raise ValueError("incompatible portfolio dimensions")
    return {
        "expected_return": float(w @ mu),
        "variance": float(w @ sigma @ w),
        "volatility": float(math.sqrt(max(w @ sigma @ w, 0.0))),
    }


def historical_var_es(losses: Iterable[float], confidence: float = 0.99) -> tuple[float, float]:
    """Historical VaR and ES for positive loss observations."""
    values = np.asarray(list(losses), dtype=float)
    if values.size == 0 or not 0.0 < confidence < 1.0:
        raise ValueError("losses must be non-empty and confidence must be in (0, 1)")
    var = float(np.quantile(values, confidence, method="linear"))
    tail = values[values >= var]
    es = float(np.mean(tail))
    return var, es


def max_drawdown(wealth: Iterable[float]) -> float:
    """Return the most negative peak-to-trough drawdown."""
    values = np.asarray(list(wealth), dtype=float)
    if values.size == 0 or np.any(values <= 0.0):
        raise ValueError("wealth must be positive and non-empty")
    peaks = np.maximum.accumulate(values)
    return float(np.min(values / peaks - 1.0))


def dcf_value(
    revenue0: float,
    growth: Iterable[float],
    ebit_margin: Iterable[float],
    tax_rate: float,
    depreciation: float,
    capex: float,
    nwc_ratio: float,
    discount_rate: float,
    terminal_growth: float,
    net_debt: float = 0.0,
    shares: float = 1.0,
) -> dict[str, object]:
    """Simple unlevered DCF with explicit forecast rows."""
    growth_values = list(growth)
    margin_values = list(ebit_margin)
    if len(growth_values) != len(margin_values) or not growth_values:
        raise ValueError("growth and margin forecasts must have equal positive length")
    if discount_rate <= terminal_growth:
        raise ValueError("discount rate must exceed terminal growth")
    revenues = []
    revenue = float(revenue0)
    for g in growth_values:
        revenue *= 1.0 + g
        revenues.append(revenue)
    previous_revenue = revenue0
    ufcf = []
    for current_revenue, margin in zip(revenues, margin_values):
        ebit = current_revenue * margin
        taxes = ebit * tax_rate
        delta_nwc = (current_revenue - previous_revenue) * nwc_ratio
        ufcf.append(ebit - taxes + depreciation - capex - delta_nwc)
        previous_revenue = current_revenue
    discount_factors = [(1.0 + discount_rate) ** (-i) for i in range(1, len(ufcf) + 1)]
    pv_forecast = [cash * factor for cash, factor in zip(ufcf, discount_factors)]
    terminal = ufcf[-1] * (1.0 + terminal_growth) / (discount_rate - terminal_growth)
    pv_terminal = terminal * discount_factors[-1]
    enterprise_value = float(sum(pv_forecast) + pv_terminal)
    equity_value = enterprise_value - net_debt
    return {
        "revenue": revenues,
        "ufcf": ufcf,
        "discount_factors": discount_factors,
        "pv_forecast": pv_forecast,
        "terminal_value": terminal,
        "pv_terminal": pv_terminal,
        "enterprise_value": enterprise_value,
        "equity_value": equity_value,
        "value_per_share": equity_value / shares,
    }


def generate_simulated_data(output_dir: Path, figure_dir: Path, seed: int = 20260717) -> None:
    """Generate labelled simulated daily prices, returns, and figures."""
    output_dir.mkdir(parents=True, exist_ok=True)
    figure_dir.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range("2023-01-02", periods=756)
    names = ["Equity_Sim", "Bond_Sim", "Commodity_Sim"]
    starts = np.array([100.0, 100.0, 100.0])
    drifts = np.array([0.06, 0.025, 0.04])
    vols = np.array([0.18, 0.05, 0.30])
    corr = np.array([[1.00, 0.15, 0.35], [0.15, 1.00, 0.10], [0.35, 0.10, 1.00]])
    chol = np.linalg.cholesky(corr)
    dt = 1.0 / 252.0
    shocks = rng.standard_normal((len(dates), 3)) @ chol.T
    log_returns = (drifts - 0.5 * vols**2) * dt + shocks * vols * math.sqrt(dt)
    prices = starts * np.exp(np.vstack([np.zeros(3), np.cumsum(log_returns, axis=0)]))
    prices_df = pd.DataFrame(prices, columns=names)
    prices_df.insert(0, "date", pd.date_range("2022-12-30", periods=len(dates) + 1, freq="B"))
    returns_df = prices_df.copy()
    returns_df.loc[:, names] = returns_df[names].pct_change()
    returns_df = returns_df.iloc[1:].reset_index(drop=True)
    prices_df.to_csv(output_dir / "simulated_prices.csv", index=False, float_format="%.8f")
    returns_df.to_csv(output_dir / "simulated_returns.csv", index=False, float_format="%.8f")
    (output_dir / "README.md").write_text(
        "# Simulated data\n\n"
        "These files are simulated, not historical market data. They were generated by "
        f"`finance_models.py` with seed `{seed}`, 756 business-day observations, a "
        "correlated GBM-style innovation process, and illustrative parameters. "
        "They contain no fees, taxes, dividends, borrow costs, or investability claims.\n\n"
        "Columns: `date`, `Equity_Sim`, `Bond_Sim`, and `Commodity_Sim`. Prices start at "
        "100. Returns are simple one-period percentage changes.\n",
        encoding="utf-8",
    )
    try:
        import matplotlib.pyplot as plt

        style = {
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.grid": True,
            "grid.alpha": 0.25,
            "figure.dpi": 140,
        }
        with plt.rc_context(style):
            fig, ax = plt.subplots(figsize=(8.2, 4.6))
            for name in names:
                ax.plot(prices_df["date"], prices_df[name], label=name.replace("_", " "))
            ax.set_title("Simulated price paths (not historical performance)")
            ax.set_ylabel("Index level")
            ax.legend(frameon=False, ncol=3)
            fig.tight_layout()
            fig.savefig(figure_dir / "simulated_paths.png", bbox_inches="tight")
            plt.close(fig)

            summary = returns_df[names].agg(["mean", "std"]).T
            fig, ax = plt.subplots(figsize=(7.0, 4.6))
            ax.scatter(summary["std"] * math.sqrt(252), summary["mean"] * 252, s=70)
            for name, row in summary.iterrows():
                ax.annotate(name.replace("_", " "), (row["std"] * math.sqrt(252), row["mean"] * 252), xytext=(5, 5), textcoords="offset points")
            ax.set_title("Simulated annualised mean and volatility")
            ax.set_xlabel("Volatility")
            ax.set_ylabel("Arithmetic mean return")
            fig.tight_layout()
            fig.savefig(figure_dir / "simulated_risk_return.png", bbox_inches="tight")
            plt.close(fig)
    except ImportError:
        # Data generation and tests do not require plotting.
        pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Finance textbook examples")
    parser.add_argument("--generate-data", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=Path("data"))
    parser.add_argument("--figure-dir", type=Path, default=Path("figures"))
    args = parser.parse_args()
    if args.generate_data:
        generate_simulated_data(args.output_dir, args.figure_dir)
    else:
        print("Use --generate-data to create the labelled simulated dataset and figures.")


if __name__ == "__main__":
    main()
