# RouteBite — Bus Food Delivery Platform
> *“Good Food. Right Stop. Better Journeys.”*

RouteBite is a specialized highway bus food-ordering platform engineered for passengers travelling across high-density intercity bus corridors in Karnataka, India. Passengers pre-order authentic, freshly-prepared meals from vetted highway food plazas, and collect their orders right at the designated bus bay during their scheduled halt in under 60 seconds using a secure single-use 4-digit OTP or QR code.

---

## 1. System Architecture

```text
                               +-----------------------------+
                               |     Passenger Web App       |
                               | (React + Vite + Tailwind)   |
                               +--------------+--------------+
                                              |
                          REST & Live Updates | Razorpay Sandbox
                                              v
+-----------------------+      +-----------------------------+      +-----------------------+
|  Restaurant Partner   | <--> |     RouteBite Core Engine   | <--> |     Bus Operator      |
|  Kitchen Terminal     |      |  (Express/FastAPI + JWT)    |      |  Dispatch & Delays    |
+-----------------------+      +--------------+--------------+      +-----------------------+
                                              |
                                              v
                               +-----------------------------+
                               |  PostgreSQL Database        |
                               |  (Routes, Stops, Orders)    |
                               +-----------------------------+
```

---

## 2. Four Operational User Roles

1. **Passenger**:
   - Searches Karnataka corridors (Bengaluru–Mysuru Expressway, Bengaluru–Mangaluru NH 75, Bengaluru–Hubballi NH 48, Mangaluru–Goa NH 66).
   - Selects scheduled bus service and compatible halting stops.
   - Real-time buffer validation ensures orders are only accepted if preparation and handover are safely feasible.
   - Interactive checkout with Razorpay test mode (UPI, Cards, NetBanking, and error simulation).
   - Instant single-use 4-digit OTP and authentic SVG QR pass for contactless collection.
   - 100% automated refund guarantee if bus changes stops or order cannot be fulfilled.

2. **Restaurant Partner**:
   - Live kitchen order terminal: New Orders (Accept/Reject), Preparing, and Ready at Pickup Bay.
   - Single-use OTP validation desk for instantaneous passenger verification.
   - Menu management: Instant 86 toggle (in stock vs out of stock), dish pricing, prep-time adjustments, and dish creation.
   - Financial ledger: Gross sales, platform commission calculation (12%), and net payout settlement tracking.

3. **Bus Operator**:
   - Fleet monitoring and official timetable integration.
   - Live Delay Broadcast Tool: Operators report highway congestion, toll bottlenecks, or ghat weather delays (+10m, +20m, +35m).
   - Automatic sync recalculates bus arrival ETA and recalibrates restaurant food warming drawers.
   - Passenger food manifest: Conductor/driver reference of all passengers picking up meals at upcoming stops.

4. **Administrator**:
   - Executive dashboard: GMV, net platform commission, active partner count, pickup success rate (98.4%).
   - Restaurant approval desk: Approve, suspend, or reject partner kitchen applications with FSSAI verification.
   - Order management and manual refund overrides.
   - Configurable commission rate slider (8% – 18%).
   - Passenger grievances desk & security audit logs.

---

## 3. Highway Preparation Feasibility Algorithm

To guarantee passengers never miss their bus or get cold food:

$$\text{Estimated Stop Arrival} = \text{Departure Time} + \text{Stop Offset Minutes} + \text{Live Delay Minutes}$$

$$\text{Safety Buffer} = \text{Time Remaining Until Bus Arrival} - \text{Restaurant Max Prep Time}$$

- If $\text{Safety Buffer} \ge 25 \text{ mins}$: Feasible (Green).
- If $15 \le \text{Safety Buffer} < 25 \text{ mins}$: Tight Window Warning (Amber).
- If $\text{Safety Buffer} < 15 \text{ mins}$: Infeasible. Order disabled to protect passenger transit schedule.

---

## 4. Test User Accounts (One-Click Simulation Bar)

The top simulation bar lets you switch roles with zero password friction:
- **Passenger**: Ananya Sharma (`ananya.travel@gmail.com`)
- **Restaurant Partner**: Raghavendra Rao — Maddur Tiffins & Heritage Diner (`partner@maddurtiffins.com`)
- **Bus Operator**: Suresh Gowda — KSRTC Airavat Controller (`controller@ksrtc-airavat.gov.in`)
- **Administrator**: Vikramaditya Hegde — RouteBite HQ Operations (`admin@routebite.in`)

---

## 5. Local Setup & Docker Deployment

### A. Run Full Stack with Docker Compose
```bash
# Clone the repository
git clone https://github.com/routebite/routebite.git
cd routebite

# Launch all services (PostgreSQL, FastAPI Backend, React Frontend)
docker-compose up --build -d

# Open frontend in browser
open http://localhost:3000

# Backend Swagger / OpenAPI Docs
open http://localhost:8000/api/docs
```

### B. Run Frontend Standalone (Development Mode)
```bash
npm install
npm run dev
```

---

## 6. External Credentials & Simulated Features

| Feature | Current State | Production Requirements |
| :--- | :--- | :--- |
| **Payments** | Razorpay Test Sandbox with simulated signatures | Razorpay Live API Key ID & Secret |
| **Bus Timetables** | Seeded Karnataka corridors (NH 275, NH 75, NH 48, NH 66) | Operator GPS API / KSRTC Open Data Feed |
| **SMS / WhatsApp** | In-app push notifications & live timeline | Twilio / Gupshup WhatsApp Business API |
| **Pickup Code** | Client & server verified single-use 4-digit OTP & SVG QR | 2D Optical barcode scanners at partner counters |
