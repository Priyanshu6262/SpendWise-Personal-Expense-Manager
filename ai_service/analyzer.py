"""
SpendWise AI Analytics Engine
Analyzes transaction history using Pandas & NumPy to detect spending trends,
month-over-month category surges, burn-rate projections, and anomalies.
"""

from datetime import datetime, date
from typing import List, Dict, Any, Optional
import math
import numpy as np
import pandas as pd


def analyze_spending_trends(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Main entry point for transaction trend analysis.
    """
    if not transactions:
        return {
            "status": "empty",
            "message": "No transactions provided for analysis.",
            "insights": ["Start logging your transactions to unlock AI trend detection."],
            "mom_changes": [],
            "surging_categories": [],
            "reduced_categories": [],
            "month_end_projection": 0,
            "anomalies": [],
            "summary": {
                "total_expense": 0,
                "total_income": 0,
                "current_month_expense": 0,
                "previous_month_expense": 0,
            }
        }

    # Convert to DataFrame
    df = pd.DataFrame(transactions)

    # Ensure required columns exist
    for col in ['amount', 'type', 'category', 'date']:
        if col not in df.columns:
            df[col] = None

    # Clean amount and date
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])

    if df.empty:
        return {
            "status": "empty",
            "message": "Transactions contained no valid dates.",
            "insights": ["No valid transaction dates found."],
            "mom_changes": [],
            "surging_categories": [],
            "reduced_categories": [],
            "month_end_projection": 0,
            "anomalies": [],
            "summary": {"total_expense": 0, "total_income": 0}
        }

    # Filter Expenses
    expense_df = df[df['type'] == 'Expense'].copy()
    income_df = df[df['type'] == 'Income'].copy()

    total_expense = float(expense_df['amount'].sum()) if not expense_df.empty else 0.0
    total_income = float(income_df['amount'].sum()) if not income_df.empty else 0.0

    if expense_df.empty:
        return {
            "status": "income_only",
            "message": "Only income transactions recorded.",
            "insights": [f"You have recorded ₹{total_income:,.0f} in total income. Log some expenses to uncover spending trends."],
            "mom_changes": [],
            "surging_categories": [],
            "reduced_categories": [],
            "month_end_projection": 0,
            "anomalies": [],
            "summary": {
                "total_expense": 0,
                "total_income": total_income,
                "current_month_expense": 0,
                "previous_month_expense": 0,
            }
        }

    # Extract Year-Month
    expense_df['year_month'] = expense_df['date'].dt.to_period('M')
    unique_periods = sorted(expense_df['year_month'].unique())

    # Determine Current & Previous Month
    current_period = unique_periods[-1]
    has_previous_month = len(unique_periods) >= 2
    previous_period = unique_periods[-2] if has_previous_month else None

    curr_df = expense_df[expense_df['year_month'] == current_period]
    prev_df = expense_df[expense_df['year_month'] == previous_period] if has_previous_month else pd.DataFrame()

    curr_month_total = float(curr_df['amount'].sum())
    prev_month_total = float(prev_df['amount'].sum()) if has_previous_month else 0.0

    # Group by category
    curr_cat = curr_df.groupby('category')['amount'].sum().to_dict()
    prev_cat = prev_df.groupby('category')['amount'].sum().to_dict() if has_previous_month else {}

    all_categories = sorted(list(set(list(curr_cat.keys()) + list(prev_cat.keys()))))

    mom_changes = []
    surging_categories = []
    reduced_categories = []
    insights = []

    for cat in all_categories:
        c_amt = float(curr_cat.get(cat, 0.0))
        p_amt = float(prev_cat.get(cat, 0.0))
        delta = c_amt - p_amt

        if p_amt > 0:
            pct_change = round(((c_amt - p_amt) / p_amt) * 100, 1)
        elif c_amt > 0 and has_previous_month:
            pct_change = 100.0  # Brand new spending category this month
        else:
            pct_change = 0.0

        status = 'stable'
        if pct_change >= 15.0 and delta >= 300:
            status = 'surge'
            surging_categories.append({
                "category": cat,
                "current_amount": c_amt,
                "previous_amount": p_amt,
                "delta": delta,
                "pct_change": pct_change,
            })
        elif pct_change <= -15.0 and delta <= -300:
            status = 'reduced'
            reduced_categories.append({
                "category": cat,
                "current_amount": c_amt,
                "previous_amount": p_amt,
                "delta": delta,
                "pct_change": pct_change,
            })

        mom_changes.append({
            "category": cat,
            "current_amount": c_amt,
            "previous_amount": p_amt,
            "delta": delta,
            "pct_change": pct_change,
            "status": status,
        })

    # Sort mom_changes by largest delta increase
    mom_changes.sort(key=lambda x: x['delta'], reverse=True)
    surging_categories.sort(key=lambda x: x['delta'], reverse=True)
    reduced_categories.sort(key=lambda x: x['pct_change'])

    # Generate Natural Language AI Insights
    # 1. Primary Highlight: Surging Category (Matches user example: "Your travel expenses increased compared with the previous month.")
    if surging_categories:
        top_surge = surging_categories[0]
        if top_surge['previous_amount'] > 0:
            insights.append(
                f"Your {top_surge['category']} expenses increased by {top_surge['pct_change']}% compared with the previous month (₹{top_surge['current_amount']:,.0f} vs ₹{top_surge['previous_amount']:,.0f})."
            )
        else:
            insights.append(
                f"Your {top_surge['category']} expenses increased significantly to ₹{top_surge['current_amount']:,.0f} compared with no spend in the previous month."
            )

    # 2. Second Surge if exists
    if len(surging_categories) > 1:
        second_surge = surging_categories[1]
        insights.append(
            f"Noticeable uptick: {second_surge['category']} spending rose by ₹{second_surge['delta']:,.0f} ({second_surge['pct_change']}% MoM)."
        )

    # 3. Highlight Category Reductions (Positive Reinforcement)
    if reduced_categories:
        top_reduced = reduced_categories[0]
        abs_pct = abs(top_reduced['pct_change'])
        insights.append(
            f"Positive savings: You reduced your {top_reduced['category']} expenses by {abs_pct}% compared with the previous month (saved ₹{abs(top_reduced['delta']):,.0f})."
        )

    # 4. Overall Month-over-Month Velocity
    if has_previous_month and prev_month_total > 0:
        overall_mom_pct = round(((curr_month_total - prev_month_total) / prev_month_total) * 100, 1)
        if overall_mom_pct > 10:
            insights.append(
                f"Total monthly expenses are pacing {overall_mom_pct}% higher than last month's pace."
            )
        elif overall_mom_pct < -10:
            insights.append(
                f"Overall spending is currently {abs(overall_mom_pct)}% lower than the same period last month."
            )

    # 5. Fallback if single month or no major surges
    if not insights:
        if curr_cat:
            top_cat = max(curr_cat.items(), key=lambda x: x[1])
            pct_of_total = round((top_cat[1] / curr_month_total) * 100, 1) if curr_month_total > 0 else 0
            insights.append(
                f"{top_cat[0]} is currently your highest expenditure at ₹{top_cat[1]:,.0f} ({pct_of_total}% of this month's spending)."
            )
        insights.append("Spending patterns are currently stable across all tracked categories.")

    # Month-end Projection based on Burn Rate
    today = datetime.now()
    days_in_month = 30
    current_day = max(today.day, 1)

    # If the latest recorded transaction is in current month, project based on days elapsed
    daily_burn_rate = curr_month_total / current_day if current_day > 0 else 0
    projected_month_end = round(curr_month_total + (daily_burn_rate * (days_in_month - current_day)), 0)

    # Statistical Anomaly Detection (Z-Score & IQR)
    anomalies = []
    if len(expense_df) >= 3:
        amounts = expense_df['amount'].values
        mean_amt = float(np.mean(amounts))
        std_amt = float(np.std(amounts))

        for _, row in expense_df.head(15).iterrows():
            z_score = (row['amount'] - mean_amt) / std_amt if std_amt > 0 else 0
            if z_score >= 1.8 or (row['amount'] > mean_amt * 2.2 and row['amount'] > 1500):
                anomalies.append({
                    "title": str(row.get('title', 'Unknown')),
                    "amount": float(row['amount']),
                    "category": str(row.get('category', 'Other')),
                    "date": row['date'].strftime('%Y-%m-%d'),
                    "z_score": round(float(z_score), 2),
                    "reason": f"Amount (₹{row['amount']:,.0f}) is significantly above your average transaction (₹{mean_amt:,.0f})."
                })

    return {
        "status": "success",
        "current_period": str(current_period),
        "previous_period": str(previous_period) if previous_period else None,
        "insights": insights,
        "mom_changes": mom_changes,
        "surging_categories": surging_categories,
        "reduced_categories": reduced_categories,
        "month_end_projection": projected_month_end,
        "daily_burn_rate": round(daily_burn_rate, 0),
        "anomalies": anomalies[:5],
        "summary": {
            "total_expense": total_expense,
            "total_income": total_income,
            "current_month_expense": curr_month_total,
            "previous_month_expense": prev_month_total,
            "net_flow": total_income - total_expense,
        }
    }
