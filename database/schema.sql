-- RouteBite PostgreSQL Production Schema
-- Karnataka Highway Bus Food Delivery Network

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'restaurant', 'operator', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bus Operators
CREATE TABLE bus_operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    brand_tag VARCHAR(100),
    helpline VARCHAR(50),
    rating NUMERIC(3,2) DEFAULT 4.5,
    verified_partner BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bus Routes
CREATE TABLE bus_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code VARCHAR(50) UNIQUE NOT NULL,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    distance_km INTEGER NOT NULL,
    total_duration_minutes INTEGER NOT NULL,
    highway_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Designated Highway Halting Stops
CREATE TABLE bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES bus_routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(150) NOT NULL,
    stop_sequence INTEGER NOT NULL,
    highway_milestone VARCHAR(100) NOT NULL,
    distance_from_origin_km INTEGER NOT NULL,
    scheduled_arrival_offset_minutes INTEGER NOT NULL,
    stop_break_duration_minutes INTEGER DEFAULT 20,
    pickup_bay_instructions TEXT NOT NULL,
    landmark VARCHAR(200),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6)
);

-- Bus Journeys & Live Schedules
CREATE TABLE bus_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID REFERENCES bus_operators(id) ON DELETE CASCADE,
    route_id UUID REFERENCES bus_routes(id) ON DELETE CASCADE,
    bus_service_number VARCHAR(100) NOT NULL,
    bus_type VARCHAR(100) NOT NULL,
    departure_time VARCHAR(10) NOT NULL,
    estimated_arrival_time VARCHAR(10) NOT NULL,
    travel_date DATE NOT NULL,
    current_delay_minutes INTEGER DEFAULT 0,
    last_location_update VARCHAR(255),
    driver_contact VARCHAR(50)
);

-- Highway Restaurant Partners
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stop_id UUID REFERENCES bus_stops(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    highway_name VARCHAR(150) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.5,
    total_reviews INTEGER DEFAULT 0,
    is_pure_veg BOOLEAN DEFAULT FALSE,
    avg_cost_for_two NUMERIC(8,2) DEFAULT 300.00,
    min_prep_time_minutes INTEGER DEFAULT 15,
    max_prep_time_minutes INTEGER DEFAULT 25,
    operating_hours VARCHAR(100),
    pickup_counter_description TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    image_url TEXT,
    approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
    commission_rate NUMERIC(5,2) DEFAULT 12.00,
    fssai_license VARCHAR(50) NOT NULL,
    is_accepting_orders BOOLEAN DEFAULT TRUE
);

-- Restaurant Menus & Dishes
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(8,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    prep_time_minutes INTEGER DEFAULT 15,
    packaging_charge NUMERIC(6,2) DEFAULT 15.00,
    rating NUMERIC(3,2) DEFAULT 4.8,
    image_url TEXT
);

-- Orders Ledger
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    passenger_id UUID REFERENCES users(id),
    journey_id UUID REFERENCES bus_journeys(id),
    restaurant_id UUID REFERENCES restaurants(id),
    stop_id UUID REFERENCES bus_stops(id),
    seat_number VARCHAR(20) NOT NULL,
    pnr_number VARCHAR(50),
    subtotal NUMERIC(10,2) NOT NULL,
    packaging_total NUMERIC(10,2) DEFAULT 0.00,
    gst_tax NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) DEFAULT 10.00,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50) DEFAULT 'razorpay_upi',
    razorpay_payment_id VARCHAR(100),
    order_status VARCHAR(30) DEFAULT 'placed' CHECK (order_status IN ('placed', 'accepted', 'preparing', 'ready_for_pickup', 'collected', 'cancelled')),
    otp_code VARCHAR(6) NOT NULL,
    qr_code_data VARCHAR(255) NOT NULL,
    cancellation_reason TEXT,
    refund_amount NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    name VARCHAR(150) NOT NULL,
    price NUMERIC(8,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    packaging_charge NUMERIC(6,2) DEFAULT 15.00
);

-- Support Complaints Desk
CREATE TABLE support_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID REFERENCES users(id),
    order_id VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security & Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning queries
CREATE INDEX idx_bus_stops_route ON bus_stops(route_id);
CREATE INDEX idx_restaurants_stop ON restaurants(stop_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_orders_passenger ON orders(passenger_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(order_status);
