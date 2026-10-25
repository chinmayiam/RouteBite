"""
SQLAlchemy ORM models for RouteBite Platform
"""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(String(20), nullable=False, default="passenger") # passenger, restaurant, operator, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="passenger")
    complaints = relationship("SupportComplaint", back_populates="passenger")

class BusOperator(Base):
    __tablename__ = "bus_operators"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    brand_tag = Column(String(100))
    helpline = Column(String(50))
    rating = Column(Float, default=4.5)
    verified_partner = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    journeys = relationship("BusJourney", back_populates="operator")

class BusRoute(Base):
    __tablename__ = "bus_routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_code = Column(String(50), unique=True, nullable=False, index=True)
    from_city = Column(String(100), nullable=False)
    to_city = Column(String(100), nullable=False)
    distance_km = Column(Integer, nullable=False)
    total_duration_minutes = Column(Integer, nullable=False)
    highway_name = Column(String(150), nullable=False)
    is_active = Column(Boolean, default=True)

    stops = relationship("BusStop", back_populates="route", order_by="BusStop.stop_sequence")
    journeys = relationship("BusJourney", back_populates="route")

class BusStop(Base):
    __tablename__ = "bus_stops"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_id = Column(String(36), ForeignKey("bus_routes.id"), nullable=False)
    stop_name = Column(String(150), nullable=False)
    stop_sequence = Column(Integer, nullable=False)
    highway_milestone = Column(String(100), nullable=False)
    distance_from_origin_km = Column(Integer, nullable=False)
    scheduled_arrival_offset_minutes = Column(Integer, nullable=False)
    stop_break_duration_minutes = Column(Integer, default=20)
    pickup_bay_instructions = Column(Text, nullable=False)
    landmark = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)

    route = relationship("BusRoute", back_populates="stops")
    restaurants = relationship("Restaurant", back_populates="stop")

class BusJourney(Base):
    __tablename__ = "bus_journeys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    operator_id = Column(String(36), ForeignKey("bus_operators.id"), nullable=False)
    route_id = Column(String(36), ForeignKey("bus_routes.id"), nullable=False)
    bus_service_number = Column(String(100), nullable=False)
    bus_type = Column(String(100), nullable=False)
    departure_time = Column(String(10), nullable=False) # "08:30"
    estimated_arrival_time = Column(String(10), nullable=False)
    travel_date = Column(String(20), nullable=False)
    current_delay_minutes = Column(Integer, default=0)
    last_location_update = Column(String(255))
    driver_contact = Column(String(50))

    operator = relationship("BusOperator", back_populates="journeys")
    route = relationship("BusRoute", back_populates="journeys")
    orders = relationship("Order", back_populates="journey")

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    stop_id = Column(String(36), ForeignKey("bus_stops.id"), nullable=False)
    name = Column(String(150), nullable=False)
    highway_name = Column(String(150), nullable=False)
    rating = Column(Float, default=4.5)
    total_reviews = Column(Integer, default=0)
    is_pure_veg = Column(Boolean, default=False)
    avg_cost_for_two = Column(Float, default=300.0)
    min_prep_time_minutes = Column(Integer, default=15)
    max_prep_time_minutes = Column(Integer, default=25)
    operating_hours = Column(String(100))
    pickup_counter_description = Column(Text, nullable=False)
    contact_phone = Column(String(20), nullable=False)
    image_url = Column(String(500))
    approval_status = Column(String(20), default="approved") # pending, approved, rejected, suspended
    commission_rate = Column(Float, default=12.0)
    fssai_license = Column(String(50), nullable=False)
    is_accepting_orders = Column(Boolean, default=True)

    stop = relationship("BusStop", back_populates="restaurants")
    menu_items = relationship("MenuItem", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    prep_time_minutes = Column(Integer, default=15)
    packaging_charge = Column(Float, default=15.0)
    rating = Column(Float, default=4.8)
    image_url = Column(String(500))

    restaurant = relationship("Restaurant", back_populates="menu_items")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    passenger_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    journey_id = Column(String(36), ForeignKey("bus_journeys.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    stop_id = Column(String(36), ForeignKey("bus_stops.id"), nullable=False)
    seat_number = Column(String(20), nullable=False)
    pnr_number = Column(String(50))
    
    subtotal = Column(Float, nullable=False)
    packaging_total = Column(Float, default=0.0)
    gst_tax = Column(Float, nullable=False)
    platform_fee = Column(Float, default=10.0)
    total_amount = Column(Float, nullable=False)

    payment_status = Column(String(20), default="paid") # pending, paid, failed, refunded
    payment_method = Column(String(50), default="razorpay_upi")
    razorpay_payment_id = Column(String(100))

    order_status = Column(String(30), default="placed") # placed, accepted, preparing, ready_for_pickup, collected, cancelled
    otp_code = Column(String(6), nullable=False)
    qr_code_data = Column(String(255), nullable=False)
    cancellation_reason = Column(Text)
    refund_amount = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    passenger = relationship("User", back_populates="orders")
    journey = relationship("BusJourney", back_populates="orders")
    restaurant = relationship("Restaurant", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False)
    name = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    packaging_charge = Column(Float, default=15.0)

    order = relationship("Order", back_populates="items")

class SupportComplaint(Base):
    __tablename__ = "support_complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    passenger_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    order_id = Column(String(50), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="open") # open, in_progress, resolved
    resolution_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    passenger = relationship("User", back_populates="complaints")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action = Column(String(100), nullable=False)
    performed_by = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
