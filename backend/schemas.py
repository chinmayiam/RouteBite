"""
Pydantic Request & Response Schemas for RouteBite API
"""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    role: str = "passenger"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    name: str

# Route & Stop Schemas
class FeasibilityCheckRequest(BaseModel):
    journey_id: str
    stop_id: str
    max_prep_time_minutes: int = 20

class FeasibilityCheckResponse(BaseModel):
    feasible: boolean = True
    estimated_arrival_time: str
    buffer_minutes: int
    warning: Optional[str] = None

# Order Schemas
class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int = Field(..., ge=1)
    notes: Optional[str] = None

class OrderCreateRequest(BaseModel):
    journey_id: str
    stop_id: str
    restaurant_id: str
    seat_number: str
    pnr_number: Optional[str] = None
    items: List[OrderItemCreate]
    payment_method: str = "razorpay_upi"
    packaging_notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    new_status: str # placed, accepted, preparing, ready_for_pickup, collected, cancelled
    cancellation_reason: Optional[str] = None

class PickupVerifyRequest(BaseModel):
    otp_code: str = Field(..., min_length=4, max_length=6)

class DelayUpdateRequest(BaseModel):
    journey_id: str
    delay_minutes: int = Field(..., ge=0, le=300)
    notes: Optional[str] = None

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str
    is_veg: bool = True
    prep_time_minutes: int = 15
    packaging_charge: float = 15.0
    image_url: Optional[str] = None

class ComplaintCreate(BaseModel):
    order_id: str
    subject: str
    message: str

class ComplaintResolve(BaseModel):
    resolution_notes: str
