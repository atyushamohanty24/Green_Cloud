from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import GreenScoreRead
from app.services.green_score_calc import green_score_calculator

router = APIRouter(prefix="/green-score", tags=["Green Score"])

@router.get("", response_model=GreenScoreRead)
def get_green_score(
    w_util: Optional[float] = Query(None),
    w_cost: Optional[float] = Query(None),
    w_carbon: Optional[float] = Query(None),
    w_safety: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    kwargs = {}
    if w_util is not None: kwargs["w_util"] = w_util
    if w_cost is not None: kwargs["w_cost"] = w_cost
    if w_carbon is not None: kwargs["w_carbon"] = w_carbon
    if w_safety is not None: kwargs["w_safety"] = w_safety

    result = green_score_calculator.calculate_score(db, **kwargs)
    return result
