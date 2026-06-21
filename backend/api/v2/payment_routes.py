"""
CoastGuard — Payment Routes
POST /api/v2/payment/create-intent — Create a Stripe PaymentIntent
POST /api/v2/payment/confirm       — Confirm payment and upgrade user
"""
import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from models import Customer
from core.auth import get_current_user
from api.v2.auth_routes import _subscription_status

from config import get_settings

router = APIRouter(prefix="/api/v2/payment", tags=["payment"])
settings = get_settings()

# Initialize Stripe
stripe.api_key = settings.stripe_secret_key or "sk_test_..."

# Amount map (in cents)
PLAN_AMOUNTS = {
    "standard-monthly": 4900,   # $49
    "standard-yearly": 46800,   # $39 * 12
    "pro-monthly": 14900,       # $149
    "pro-yearly": 142800,       # $119 * 12
}

class CreateIntentRequest(BaseModel):
    plan_id: str  # e.g., "pro-monthly", "standard-monthly"

class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    plan_id: str  # pass plan_id from frontend so we set the right plan

@router.post("/create-intent")
def create_payment_intent(data: CreateIntentRequest, current_user: Customer = Depends(get_current_user)):
    """Creates a Stripe PaymentIntent for the requested plan."""

    amount = PLAN_AMOUNTS.get(data.plan_id, 14900)

    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            metadata={
                "user_id": current_user.id,
                "email": current_user.email,
                "plan_id": data.plan_id
            }
        )
        return {"clientSecret": payment_intent.client_secret, "plan_id": data.plan_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/confirm")
def confirm_payment(data: ConfirmPaymentRequest, current_user: Customer = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Confirms the dummy payment and upgrades the user.
    Sets the plan based on what plan_id was submitted from the frontend.
    """

    # Determine the plan label: plan_id is like "standard-monthly" or "pro-yearly"
    plan_label = "standard" if data.plan_id.startswith("standard") else "pro"

    current_user.subscription_plan = plan_label

    # Set expiration: monthly = 30 days, yearly = 365 days
    days = 365 if "yearly" in data.plan_id else 30
    current_user.subscription_expires_at = datetime.utcnow() + timedelta(days=days)

    db.commit()
    db.refresh(current_user)

    return {
        "message": f"Payment successful. Account upgraded to {plan_label.title()}.",
        "subscription": _subscription_status(current_user)
    }
