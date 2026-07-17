import math
import unittest

import numpy as np

from finance_models import (
    annuity_pv,
    binomial_call,
    bond_price,
    bsm_call,
    bsm_put,
    dcf_value,
    historical_var_es,
    max_drawdown,
    monte_carlo_call,
    portfolio_stats,
    pv,
    simulate_gbm,
)


class FinanceModelTests(unittest.TestCase):
    def test_time_value(self):
        self.assertAlmostEqual(pv(100.0, 0.10, 1), 90.9090909, places=6)
        self.assertAlmostEqual(annuity_pv(100.0, 0.0, 5), 500.0)

    def test_bond_par_at_coupon(self):
        self.assertAlmostEqual(bond_price(1000, 0.05, 0.05, 5), 1000.0, places=8)

    def test_option_parity(self):
        call = bsm_call(100, 100, 0.05, 0.20, 1.0)
        put = bsm_put(100, 100, 0.05, 0.20, 1.0)
        self.assertAlmostEqual(call - put, 100 - 100 * math.exp(-0.05), places=8)

    def test_binomial_converges_to_bsm(self):
        analytic = bsm_call(100, 100, 0.05, 0.20, 1.0)
        lattice = binomial_call(100, 100, 0.05, 0.20, 1.0, steps=800)
        self.assertLess(abs(analytic - lattice), 0.03)

    def test_monte_carlo_reproducible_and_close(self):
        paths = simulate_gbm(100, 0.05, 0.20, 1.0, steps=252, paths=100_000, seed=7)
        estimate, standard_error = monte_carlo_call(paths[:, -1], 100, 0.05, 1.0)
        analytic = bsm_call(100, 100, 0.05, 0.20, 1.0)
        self.assertLess(abs(estimate - analytic), 4.0 * standard_error + 0.05)

    def test_portfolio(self):
        result = portfolio_stats([0.6, 0.4], [0.08, 0.05], [[0.0225, 0.0024], [0.0024, 0.0064]])
        self.assertAlmostEqual(result["expected_return"], 0.068)
        self.assertAlmostEqual(result["variance"], 0.010276)

    def test_risk_ordering_and_drawdown(self):
        var, es = historical_var_es([1, 2, 3, 4, 5], confidence=0.8)
        self.assertGreaterEqual(es, var)
        self.assertAlmostEqual(max_drawdown([100, 120, 90, 95]), -0.25)

    def test_dcf_value(self):
        result = dcf_value(
            100,
            [0.08, 0.07, 0.06, 0.05, 0.04],
            [0.15, 0.155, 0.16, 0.165, 0.17],
            tax_rate=0.25,
            depreciation=3,
            capex=4,
            nwc_ratio=0.10,
            discount_rate=0.09,
            terminal_growth=0.025,
            net_debt=25,
            shares=10,
        )
        self.assertGreater(result["enterprise_value"], 0)
        self.assertAlmostEqual(result["equity_value"], result["enterprise_value"] - 25)


if __name__ == "__main__":
    unittest.main()
