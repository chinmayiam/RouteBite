export type UserRole = 'passenger' | 'restaurant' | 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  restaurantId?: string;
  operatorId?: string;
}

export interface BusOperator {
  id: string;
  name: string;
  brandTag: string;
  helpline: string;
  rating: number;
  busTypes: string[];
  verifiedPartner: boolean;
  activeFleetCount: number;
}

export interface BusRoute {
  id: string;
  routeCode: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  totalDurationMinutes: number;
  viaCities: string[];
  highwayName: string;
  isActive: boolean;
}

export interface BusStop {
  id: string;
  routeId: string;
  stopName: string;
  cityArea: string;
  stopSequence: number;
  highwayMilestone: string;
  distanceFromOriginKm: number;
  scheduledArrivalOffsetMinutes: number;
  stopBreakDurationMinutes: number;
  coordinates: { lat: number; lng: number };
  pickupBayInstructions: string;
  landmark: string;
  amenities: string[];
}

export interface BusJourney {
  id: string;
  operatorId: string;
  operatorName: string;
  routeId: string;
  routeCode: string;
  busServiceNumber: string;
  busType: string;
  departureTime: string; // e.g. "08:30"
  estimatedArrivalTime: string;
  travelDate: string; // "YYYY-MM-DD"
  currentDelayMinutes: number;
  lastLocationUpdate?: string;
  driverContact?: string;
  busRegistrationNumber: string;
}

export interface Restaurant {
  id: string;
  name: string;
  stopId: string;
  stopName: string;
  routeId: string;
  highwayName: string;
  rating: number;
  totalReviews: number;
  cuisineTypes: string[];
  isPureVeg: boolean;
  avgCostForTwo: number;
  minPrepTimeMinutes: number;
  maxPrepTimeMinutes: number;
  operatingHours: string;
  pickupCounterDescription: string;
  contactPhone: string;
  image: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: number; // e.g. 12%
  fssaiLicense: string;
  isAcceptingOrders: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: 'Meals & Thalis' | 'Quick Bites & Tiffins' | 'Biryani & Pulao' | 'Beverages & Desserts' | 'Combos & Boxes';
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  image?: string;
  packagingCharge: number;
  rating?: number;
  isBestseller?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'collected'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  packagingCharge: number;
  isVeg: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  journeyId: string;
  busOperatorName: string;
  busServiceNumber: string;
  seatNumber: string;
  pnrNumber: string;
  stopId: string;
  stopName: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  gstTax: number;
  platformFee: number;
  packagingTotal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'test_mode';
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  otpCode: string;
  qrCodeData: string;
  createdAt: string;
  busEstimatedArrival: string;
  busStopDurationMinutes: number;
  feasibilityBufferMinutes: number;
  pickupInstruction: string;
  cancellationReason?: string;
  refundAmount?: number;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: UserRole;
  timestamp: string;
  details: string;
}

export interface SupportComplaint {
  id: string;
  orderId: string;
  passengerName: string;
  passengerPhone: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolutionNotes?: string;
  createdAt: string;
}
