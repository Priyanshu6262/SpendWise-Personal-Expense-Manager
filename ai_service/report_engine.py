"""
SpendWise Financial Report Engine
Generates verified weekly and monthly financial reports with:
- Total income, expense, savings
- Category-wise breakdowns
- Period-over-period comparisons
- Spending trend data points
- Structured data for LLM natural-language summarization
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, date
import pandas as pd
import numpy as np


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _to_df(transactions: List[Dict[str, Any]]) -> pd.DataFrame:
    if not transactions:
        return pd.DataFrame()
    df = pd.DataFrame(transactions)
    df["amount"] = pd.to_numeric(df.get("amount", 0), errors="coerce").fillna(0)
    df["date"]   = pd.to_datetime(df.get("date", ""), errors="coerce", format="mixed", utc=True).dt.tz_localize(None)
    df = df.dropna(subset=["date"])
    return df


def _period_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """Compute income, expense, savings, category breakdown for a filtered df."""
    if df.empty:
        return {
            "total_income": 0, "total_expense": 0, "savings": 0,
            "savings_pct": 0, "transaction_count": 0,
            "expense_count": 0, "income_count": 0,
            "category_breakdown": [], "top_category": None,
        }

    expense_df = df[df["type"] == "Expense"]
    income_df  = df[df["type"] == "Income"]

    total_income  = float(income_df["amount"].sum())
    total_expense = float(expense_df["amount"].sum())
    savings       = total_income - total_expense
    savings_pct   = round((savings / total_income * 100), 1) if total_income > 0 else 0

    # Category breakdown
    cat_totals = expense_df.groupby("category")["amount"].sum().sort_values(ascending=False)
    category_breakdown = [
        {
            "category": cat,
            "amount": float(amt),
            "percentage": round(float(amt) / total_expense * 100, 1) if total_expense > 0 else 0,
        }
        for cat, amt in cat_totals.items()
    ]

    top_category = category_breakdown[0]["category"] if category_breakdown else None

    return {
        "total_income":        round(total_income, 0),
        "total_expense":       round(total_expense, 0),
        "savings":             round(savings, 0),
        "savings_pct":         savings_pct,
        "transaction_count":   len(df),
        "expense_count":       len(expense_df),
        "income_count":        len(income_df),
        "category_breakdown":  category_breakdown,
        "top_category":        top_category,
    }


def _pct_change(curr: float, prev: float) -> float:
    if prev == 0:
        return 100.0 if curr > 0 else 0.0
    return round(((curr - prev) / prev) * 100, 1)


def _daily_trend(df: pd.DataFrame, start: datetime, end: datetime) -> List[Dict[str, Any]]:
    """Daily expense totals for a date range."""
    expense_df = df[(df["type"] == "Expense") & (df["date"] >= start) & (df["date"] <= end)].copy()
    if expense_df.empty:
        return []
    expense_df["day"] = expense_df["date"].dt.date
    daily = expense_df.groupby("day")["amount"].sum().reset_index()
    return [
        {"date": str(row["day"]), "amount": round(float(row["amount"]), 0)}
        for _, row in daily.iterrows()
    ]


def _category_comparison(curr_breakdown: List, prev_breakdown: List) -> List[Dict[str, Any]]:
    """Compare category spending between two periods."""
    curr_map = {c["category"]: c["amount"] for c in curr_breakdown}
    prev_map = {c["category"]: c["amount"] for c in prev_breakdown}
    all_cats = sorted(set(list(curr_map.keys()) + list(prev_map.keys())))
    result = []
    for cat in all_cats:
        c = curr_map.get(cat, 0.0)
        p = prev_map.get(cat, 0.0)
        pct = _pct_change(c, p)
        result.append({
            "category":       cat,
            "current_amount": round(c, 0),
            "previous_amount": round(p, 0),
            "change_amount":  round(c - p, 0),
            "change_pct":     pct,
            "direction":      "up" if pct > 5 else "down" if pct < -5 else "stable",
        })
    result.sort(key=lambda x: abs(x["change_amount"]), reverse=True)
    return result


# ─── Weekly Report ────────────────────────────────────────────────────────────

def generate_weekly_report(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates a report for the current week vs. previous week.
    Week = Mon–Sun.
    """
    df = _to_df(transactions)
    if df.empty:
        return {"status": "empty", "period": "weekly", "message": "No transactions found."}

    today    = datetime.now()
    # Current week: Monday of this week → today
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end   = today

    # Previous week
    prev_week_end   = week_start - timedelta(seconds=1)
    prev_week_start = prev_week_end - timedelta(days=6)
    prev_week_start = prev_week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    curr_df = df[(df["date"] >= week_start) & (df["date"] <= week_end)]
    prev_df = df[(df["date"] >= prev_week_start) & (df["date"] <= prev_week_end)]

    curr_stats = _period_stats(curr_df)
    prev_stats = _period_stats(prev_df)

    expense_change_pct = _pct_change(curr_stats["total_expense"], prev_stats["total_expense"])
    income_change_pct  = _pct_change(curr_stats["total_income"],  prev_stats["total_income"])
    savings_change_pct = _pct_change(curr_stats["savings"],       prev_stats["savings"])

    category_comparison = _category_comparison(
        curr_stats["category_breakdown"],
        prev_stats["category_breakdown"]
    )

    # Biggest increase/decrease
    increases = [c for c in category_comparison if c["direction"] == "up" and c["current_amount"] > 0]
    decreases = [c for c in category_comparison if c["direction"] == "down" and c["previous_amount"] > 0]

    daily_trend   = _daily_trend(df, week_start, week_end)
    prev_trend    = _daily_trend(df, prev_week_start, prev_week_end)

    # LLM prompt data (structured summary, not raw DB)
    llm_context = {
        "period":              "weekly",
        "current_week":        f"{week_start.strftime('%b %d')} – {week_end.strftime('%b %d, %Y')}",
        "previous_week":       f"{prev_week_start.strftime('%b %d')} – {prev_week_end.strftime('%b %d, %Y')}",
        "curr_expense":        curr_stats["total_expense"],
        "prev_expense":        prev_stats["total_expense"],
        "expense_change_pct":  expense_change_pct,
        "curr_income":         curr_stats["total_income"],
        "curr_savings":        curr_stats["savings"],
        "top_category":        curr_stats["top_category"],
        "biggest_increase":    increases[0] if increases else None,
        "biggest_decrease":    decreases[0] if decreases else None,
    }

    return {
        "status":               "success",
        "period":               "weekly",
        "current_period_label": f"{week_start.strftime('%b %d')} – {week_end.strftime('%b %d')}",
        "previous_period_label":f"{prev_week_start.strftime('%b %d')} – {prev_week_end.strftime('%b %d')}",
        "current":              curr_stats,
        "previous":             prev_stats,
        "changes": {
            "expense_pct":  expense_change_pct,
            "income_pct":   income_change_pct,
            "savings_pct":  savings_change_pct,
        },
        "category_comparison":  category_comparison,
        "daily_trend":          daily_trend,
        "prev_daily_trend":     prev_trend,
        "llm_context":          llm_context,
    }


# ─── Monthly Report ───────────────────────────────────────────────────────────

def generate_monthly_report(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates a report for the current calendar month vs. previous month.
    """
    df = _to_df(transactions)
    if df.empty:
        return {"status": "empty", "period": "monthly", "message": "No transactions found."}

    today = datetime.now()

    # Current month
    curr_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    curr_end   = today

    # Previous month
    prev_end   = curr_start - timedelta(seconds=1)
    prev_start = prev_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    curr_df = df[(df["date"] >= curr_start) & (df["date"] <= curr_end)]
    prev_df = df[(df["date"] >= prev_start) & (df["date"] <= prev_end)]

    curr_stats = _period_stats(curr_df)
    prev_stats = _period_stats(prev_df)

    expense_change_pct = _pct_change(curr_stats["total_expense"], prev_stats["total_expense"])
    income_change_pct  = _pct_change(curr_stats["total_income"],  prev_stats["total_income"])
    savings_change_pct = _pct_change(curr_stats["savings"],       prev_stats["savings"])

    category_comparison = _category_comparison(
        curr_stats["category_breakdown"],
        prev_stats["category_breakdown"]
    )

    increases = [c for c in category_comparison if c["direction"] == "up" and c["current_amount"] > 0]
    decreases = [c for c in category_comparison if c["direction"] == "down" and c["previous_amount"] > 0]

    daily_trend = _daily_trend(df, curr_start, curr_end)
    prev_trend  = _daily_trend(df, prev_start, prev_end)

    # Month-end projection: linear extrapolation from current daily burn rate
    days_elapsed  = max(today.day, 1)
    days_in_month = 30
    daily_burn    = curr_stats["total_expense"] / days_elapsed if days_elapsed > 0 else 0
    projected_end = round(curr_stats["total_expense"] + daily_burn * (days_in_month - days_elapsed), 0)

    llm_context = {
        "period":              "monthly",
        "current_month":       curr_start.strftime("%B %Y"),
        "previous_month":      prev_start.strftime("%B %Y"),
        "curr_expense":        curr_stats["total_expense"],
        "prev_expense":        prev_stats["total_expense"],
        "expense_change_pct":  expense_change_pct,
        "curr_income":         curr_stats["total_income"],
        "curr_savings":        curr_stats["savings"],
        "savings_pct":         curr_stats["savings_pct"],
        "top_category":        curr_stats["top_category"],
        "biggest_increase":    increases[0] if increases else None,
        "biggest_decrease":    decreases[0] if decreases else None,
        "projected_month_end": projected_end,
    }

    return {
        "status":               "success",
        "period":               "monthly",
        "current_period_label": curr_start.strftime("%B %Y"),
        "previous_period_label":prev_start.strftime("%B %Y"),
        "current":              curr_stats,
        "previous":             prev_stats,
        "changes": {
            "expense_pct":  expense_change_pct,
            "income_pct":   income_change_pct,
            "savings_pct":  savings_change_pct,
        },
        "category_comparison":  category_comparison,
        "daily_trend":          daily_trend,
        "prev_daily_trend":     prev_trend,
        "projected_month_end":  projected_end,
        "llm_context":          llm_context,
    }
