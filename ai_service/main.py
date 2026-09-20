"""
SpendWise Python AI Analytics Microservice (FastAPI)
Listens on port 5001 to provide real-time spending trends,
category surge detection, MoM changes, ML forecasting,
and AI budget recommendations.
"""

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import os

from ai_service.analyzer import analyze_spending_trends
from ai_service.budget_engine import calculate_budget_recommendations
from ai_service.report_engine import generate_weekly_report, generate_monthly_report

app = FastAPI(
    title="SpendWise AI Analytics Service",
    description="Python ML engine for spending trends, surges, projections, and budget recommendations",
    version="1.1.0"
)

# Enable CORS for frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    transactions: List[Dict[str, Any]] = []


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SpendWise Python AI Analytics",
        "version": "1.1.0"
    }


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    """
    Month-over-month spending trends, surges, and burn-rate projections.
    """
    try:
        return analyze_spending_trends(payload.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")


@app.post("/budget")
def budget(payload: AnalyzeRequest):
    """
    Rule-based personalized budget recommendations per category,
    savings targets, and structured insights ready for LLM explanation.
    """
    try:
        return calculate_budget_recommendations(payload.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget calculation failed: {str(e)}")


@app.post("/report/weekly")
def report_weekly(payload: AnalyzeRequest):
    """
    Weekly financial report: current week vs. previous week.
    Returns verified stats, category comparisons, and daily trend data
    for LLM natural-language summarization.
    """
    try:
        return generate_weekly_report(payload.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weekly report failed: {str(e)}")


@app.post("/report/monthly")
def report_monthly(payload: AnalyzeRequest):
    """
    Monthly financial report: current month vs. previous month.
    Returns verified stats, category comparisons, daily trends,
    and month-end projection for LLM summarization.
    """
    try:
        return generate_monthly_report(payload.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monthly report failed: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 5001))
    print(f"Starting SpendWise AI Analytics service on port {port}...")
    uvicorn.run("ai_service.main:app", host="0.0.0.0", port=port, reload=True)
