"""
SpendWise Budget Recommendations Calculator
Analyzes transaction history to produce rule-based personalized budget limits,
category spending averages, savings targets, and structured data for LLM explanation.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date
import numpy as np
import pandas as pd
import math


# ─── Canonical Budget Model ──────────────────────────────────────────────────
# Industry-standard "50/30/20" model adapted for Indian spending patterns
CATEGORY_TYPE = {
    "Food":          "needs",
    "Bills":         "needs",
    "Healthcare":    "needs",
    "Education":     "needs",
    "Travel":        "wants",
    "Shopping":      "wants",
    "Entertainment": "wants",
    "Other":         "wants",
}

# Recommended % of income for each category (heuristic upper bounds)
INCOME_PCT_TARGETS = {
    "Food":          0.20,
    "Bills":         0.15,
    "Healthcare":    0.10,
    "Education":     0.10,
    "Travel":        0.08,
    "Shopping":      0.10,
    "Entertainment": 0.05,
    "Other":         0.07,
}

# Minimum floor budgets (INR) – practical minimums regardless of income
MIN_BUDGET_FLOOR = {
    "Food":          2000,
    "Bills":         500,
    "Healthcare":    500,
    "Education":     500,
    "Travel":        1000,
    "Shopping":      1000,
    "Entertainment": 500,
    "Other":         500,
}

SAVINGS_TARGET_PCT = 0.20          # Ideal: save 20% of income
MIN_SAVINGS_PCT    = 0.10          # Minimum: save at least 10%
MONTHS_HISTORY     = 3             # Rolling months for average calculation


def _to_df(transactions: List[Dict[str, Any]]) -> pd.DataFrame:
    if not transactions:
        return pd.DataFrame()
    df = pd.DataFrame(transactions)
    df["amount"] = pd.to_numeric(df.get("amount", 0), errors="coerce").fillna(0)
    df["date"]   = pd.to_datetime(df.get("date", ""), errors="coerce")
    df = df.dropna(subset=["date"])
    df["year_month"] = df["date"].dt.to_period("M")
    return df


def calculate_budget_recommendations(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Main calculation engine.  Returns structured data ready for LLM explanation.
    """

    df = _to_df(transactions)

    # ── Guard: no valid data ──────────────────────────────────────────────────
    if df.empty:
        return _empty_response()

    expenses_df = df[df["type"] == "Expense"].copy()
    income_df   = df[df["type"] == "Income"].copy()

    # ── Rolling Average Monthly Income (last MONTHS_HISTORY months) ──────────
    all_months = sorted(df["year_month"].unique())
    recent_months = all_months[-MONTHS_HISTORY:]

    recent_income = income_df[income_df["year_month"].isin(recent_months)]
    monthly_incomes = recent_income.groupby("year_month")["amount"].sum()
    avg_monthly_income = float(monthly_incomes.mean()) if not monthly_incomes.empty else 0.0

    # ── Rolling Average Monthly Expense per Category ─────────────────────────
    recent_expenses = expenses_df[expenses_df["year_month"].isin(recent_months)]
    if recent_expenses.empty:
        return _empty_response()

    # Per-category monthly averages across rolling window
    cat_monthly = (
        recent_expenses
        .groupby(["year_month", "category"])["amount"]
        .sum()
        .reset_index()
    )
    avg_cat_monthly = cat_monthly.groupby("category")["amount"].mean().to_dict()

    # Total average monthly expense
    monthly_expense_total = recent_expenses.groupby("year_month")["amount"].sum()
    avg_total_expense = float(monthly_expense_total.mean()) if not monthly_expense_total.empty else 0.0

    # Current month spend (to show progress)
    current_period = all_months[-1]
    current_month_df = expenses_df[expenses_df["year_month"] == current_period]
    current_cat_spend = current_month_df.groupby("category")["amount"].sum().to_dict()

    # ── Savings Capacity ─────────────────────────────────────────────────────
    current_savings = avg_monthly_income - avg_total_expense
    savings_pct      = (current_savings / avg_monthly_income * 100) if avg_monthly_income > 0 else 0
    ideal_savings    = avg_monthly_income * SAVINGS_TARGET_PCT
    savings_gap      = max(0.0, ideal_savings - current_savings)

    # ── Generate Recommended Budget Per Category ─────────────────────────────
    category_recommendations: List[Dict[str, Any]] = []

    all_categories = set(list(avg_cat_monthly.keys()) + list(INCOME_PCT_TARGETS.keys()))

    for cat in sorted(all_categories):
        avg_spend = avg_cat_monthly.get(cat, 0.0)
        income_based_limit = avg_monthly_income * INCOME_PCT_TARGETS.get(cat, 0.05)
        floor = MIN_BUDGET_FLOOR.get(cat, 500)

        # Recommended = blend of: historical average * 0.9 (10% cut), income cap, and floor
        if avg_spend > 0:
            blended = avg_spend * 0.90  # aim to reduce by 10%
            recommended = max(floor, min(blended, income_based_limit))
        else:
            recommended = max(floor, income_based_limit * 0.5)

        recommended = round(recommended, -2)  # round to nearest 100

        # Status
        current_spend = current_cat_spend.get(cat, 0.0)
        if current_spend > recommended * 1.2:
            status = "over_budget"
        elif current_spend > recommended * 0.8:
            status = "on_track"
        else:
            status = "under_budget"

        # Trend vs previous month
        if len(recent_months) >= 2:
            prev_period   = recent_months[-2]
            prev_spend    = float(
                expenses_df[(expenses_df["year_month"] == prev_period) & (expenses_df["category"] == cat)]["amount"].sum()
            )
            curr_period_spend = float(
                expenses_df[(expenses_df["year_month"] == recent_months[-1]) & (expenses_df["category"] == cat)]["amount"].sum()
            )
            if prev_spend > 0:
                trend_pct = round(((curr_period_spend - prev_spend) / prev_spend) * 100, 1)
            else:
                trend_pct = 0.0
        else:
            trend_pct = 0.0

        category_recommendations.append({
            "category":          cat,
            "type":              CATEGORY_TYPE.get(cat, "wants"),
            "avg_monthly_spend": round(avg_spend, 0),
            "recommended_budget": recommended,
            "current_month_spend": round(current_spend, 0),
            "income_based_cap":  round(income_based_limit, 0),
            "status":            status,
            "trend_pct":         trend_pct,
        })

    # Sort: over_budget first, then on_track, then under
    order = {"over_budget": 0, "on_track": 1, "under_budget": 2}
    category_recommendations.sort(key=lambda x: (order.get(x["status"], 3), -x["avg_monthly_spend"]))

    # ── Insight Strings (rule-based, for LLM to enrich) ─────────────────────
    raw_insights: List[str] = []

    for r in category_recommendations:
        cat  = r["category"]
        avg  = r["avg_monthly_spend"]
        rec  = r["recommended_budget"]
        stat = r["status"]

        if avg > 0:
            if stat == "over_budget":
                raw_insights.append(
                    f"{cat}: Currently spending ₹{r['current_month_spend']:,.0f} this month vs. recommended ₹{rec:,.0f}. "
                    f"Your {MONTHS_HISTORY}-month average is ₹{avg:,.0f} — consider cutting back."
                )
            else:
                raw_insights.append(
                    f"{cat}: Based on your {MONTHS_HISTORY}-month average of ₹{avg:,.0f}, "
                    f"consider setting a budget of ₹{rec:,.0f}."
                )

    if savings_gap > 500:
        raw_insights.append(
            f"Savings: To reach your 20% savings target (₹{ideal_savings:,.0f}/month), "
            f"you need to reduce total expenses by ₹{savings_gap:,.0f}."
        )

    # ── Build Structured Return Payload ──────────────────────────────────────
    return {
        "status": "success",
        "summary": {
            "avg_monthly_income":    round(avg_monthly_income, 0),
            "avg_monthly_expense":   round(avg_total_expense, 0),
            "current_savings":       round(current_savings, 0),
            "savings_pct":           round(savings_pct, 1),
            "ideal_savings":         round(ideal_savings, 0),
            "savings_gap":           round(savings_gap, 0),
            "months_analyzed":       len(recent_months),
        },
        "category_recommendations": category_recommendations,
        "raw_insights":             raw_insights,
        "current_period":           str(current_period),
    }


def _empty_response() -> Dict[str, Any]:
    return {
        "status": "empty",
        "message": "Not enough transaction history to generate budget recommendations. Add at least 1 month of transactions.",
        "summary": {},
        "category_recommendations": [],
        "raw_insights": [],
        "current_period": None,
    }
