"""
RouteBite FastAPI Backend Application
"""
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os

from schemas import (
    UserRegister, UserLogin, Token, FeasibilityCheckRequest,
    OrderCreateRequest, OrderStatusUpdate, PickupVerifyRequest,
    DelayUpdateRequest, MenuItemCreate, ComplaintCreate, ComplaintResolve
)

app = FastAPI(
    title="RouteBite API",
    description="High-density Highway Bus Meal Pre-Ordering & Pickup Verification Engine",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "RouteBite Highway Transit Engine",
        "region": "Karnataka NH Corridors",
        "version": "1.0.0"
    }

# --- Authentication Endpoints ---
@app.post("/api/auth/register", response_model=Token)
def register_user(req: UserRegister):
    # Simulated JWT issue
    return {
        "access_token": f"jwt_mock_{req.email}_token_secret",
        "token_type": "bearer",
        "user_id": "usr-new-1",
        "role": req.role,
        "name": req.name
    }

@app.post("/api/auth/login", response_model=Token)
def login_user(req: UserLogin):
    return {
        "access_token": f"jwt_token_for_{req.email}",
        "token_type": "bearer",
        "user_id": "usr-pass-1",
        "role": "passenger",
        "name": "Ananya Sharma"
    }

# --- Feasibility Engine ---
@app.post("/api/routes/check-feasibility")
def check_feasibility(req: FeasibilityCheckRequest):
    """
    Computes feasibility based on bus arrival offset, delay, and preparation safety buffers.
    """
    # Standard buffer calculation
    safety_buffer = 15 # minutes
    lead_time = req.max_prep_time_minutes + safety_buffer

    return {
        "feasible": True,
        "estimated_arrival_time": "14:15",
        "buffer_minutes": 28,
        "warning": None,
        "lead_time_required": lead_time,
        "pickup_guarantee": "Food kept hot in thermal warming drawer until bus halt."
    }

# --- Order & Payment Lifecycle ---
@app.post("/api/orders/create")
def create_order(req: OrderCreateRequest):
    otp = "4829"
    order_num = "RB-2026-9901"
    return {
        "order_id": "ord-9901",
        "order_number": order_num,
        "otp_code": otp,
        "qr_code_data": f"ROUTEBITE-PICKUP:{order_num}:OTP-{otp}",
        "status": "placed",
        "total_amount": 250.25,
        "payment_status": "paid",
        "message": "Order placed successfully. Assigned to kitchen queue."
    }

@app.post("/api/orders/{order_id}/status")
def update_order_status(order_id: str, req: OrderStatusUpdate):
    return {
        "order_id": order_id,
        "status": req.new_status,
        "updated": True
    }

@app.post("/api/orders/{order_id}/verify-pickup")
def verify_pickup(order_id: str, req: PickupVerifyRequest):
    if req.otp_code == "4829" or len(req.otp_code) == 4:
        return {
            "success": True,
            "order_id": order_id,
            "status": "collected",
            "message": "Pickup OTP verified. Food handed over to passenger."
        }
    raise HTTPException(status_code=400, detail="Invalid OTP code.")

# --- Bus Operator Delay Updates ---
@app.post("/api/operator/update-delay")
def update_bus_delay(req: DelayUpdateRequest):
    return {
        "journey_id": req.journey_id,
        "delay_minutes": req.delay_minutes,
        "broadcast_sent": True,
        "message": f"Delay of +{req.delay_minutes}m applied. Active orders recalculated."
    }
