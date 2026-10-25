import {
  User,
  UserRole,
  BusRoute,
  BusStop,
  BusOperator,
  BusJourney,
  Restaurant,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  AuditLog,
  SupportComplaint,
} from '../types';
import {
  INITIAL_OPERATORS,
  INITIAL_ROUTES,
  INITIAL_STOPS,
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_JOURNEYS,
  DEMO_USERS,
  INITIAL_ORDERS,
  INITIAL_COMPLAINTS,
} from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'routebite_current_user',
  ORDERS: 'routebite_orders',
  RESTAURANTS: 'routebite_restaurants',
  MENU_ITEMS: 'routebite_menu_items',
  JOURNEYS: 'routebite_journeys',
  STOPS: 'routebite_stops',
  ROUTES: 'routebite_routes',
  CART: 'routebite_cart',
  AUDIT_LOGS: 'routebite_audit_logs',
  COMPLAINTS: 'routebite_complaints',
};

// Safe local storage helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export class AppStore {
  private static instance: AppStore;

  currentUser: User;
  routes: BusRoute[];
  stops: BusStop[];
  operators: BusOperator[];
  journeys: BusJourney[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  auditLogs: AuditLog[];
  complaints: SupportComplaint[];
  selectedJourneyId: string | null = null;
  selectedStopId: string | null = null;
  platformCommissionRate: number = 12; // 12%

  private listeners: (() => void)[] = [];

  private constructor() {
    this.currentUser = loadFromStorage<User>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.passenger);
    this.routes = loadFromStorage<BusRoute[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
    this.stops = loadFromStorage<BusStop[]>(STORAGE_KEYS.STOPS, INITIAL_STOPS);
    this.operators = INITIAL_OPERATORS;
    this.journeys = loadFromStorage<BusJourney[]>(STORAGE_KEYS.JOURNEYS, INITIAL_JOURNEYS);
    this.restaurants = loadFromStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
    this.menuItems = loadFromStorage<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
    this.orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.cart = loadFromStorage<CartItem[]>(STORAGE_KEYS.CART, []);
    this.complaints = loadFromStorage<SupportComplaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    this.auditLogs = loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        action: 'PLATFORM_BOOTSTRAP',
        performedBy: 'System',
        role: 'admin',
        timestamp: new Date().toISOString(),
        details: 'RouteBite Karnataka highway nodes initialized with 4 corridors and verified stop plazas.',
      },
    ]);
  }

  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- Auth & Role Switching ---
  public switchRole(role: UserRole): void {
    this.currentUser = DEMO_USERS[role];
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.logAudit(`SWITCH_ROLE_${role.toUpperCase()}`, `User switched role session to ${role}`);
    this.notify();
  }

  public updateProfile(updated: Partial<User>): void {
    this.currentUser = { ...this.currentUser, ...updated };
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  // --- Audit Logger ---
  public logAudit(action: string, details: string): void {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy: this.currentUser.name,
      role: this.currentUser.role,
      timestamp: new Date().toISOString(),
      details,
    };
    this.auditLogs = [log, ...this.auditLogs];
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- Route & Feasibility Engine ---
  public calculateStopArrivalTime(departureTime: string, offsetMinutes: number, delayMinutes: number): string {
    const [depHours, depMins] = departureTime.split(':').map(Number);
    const totalMinutes = depHours * 60 + depMins + offsetMinutes + delayMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(arrivalHours)}:${pad(arrivalMinutes)}`;
  }

  public checkOrderFeasibility(
    journey: BusJourney,
    stop: BusStop,
    maxPrepTimeMinutes: number
  ): {
    feasible: boolean;
    estimatedArrival: string;
    bufferMinutes: number;
    warning?: string;
  } {
    const estimatedArrival = this.calculateStopArrivalTime(
      journey.departureTime,
      stop.scheduledArrivalOffsetMinutes,
      journey.currentDelayMinutes
    );

    // Calculate available window from now until bus arrival at stop
    const now = new Date();
    const [arrH, arrM] = estimatedArrival.split(':').map(Number);
    const targetArrivalDate = new Date();
    targetArrivalDate.setHours(arrH, arrM, 0, 0);

    // If target arrival passed in same day, assume ahead or simulate 45 mins buffer
    let diffMinutes = Math.round((targetArrivalDate.getTime() - now.getTime()) / (60 * 1000));
    if (diffMinutes < 0) {
      // For demo testing, provide simulated realistic highway lead time
      diffMinutes = stop.scheduledArrivalOffsetMinutes - 20;
    }

    const requiredPrepTimeWithSafetyBuffer = maxPrepTimeMinutes + 15; // 15 mins safety window
    const bufferMinutes = Math.max(0, diffMinutes - maxPrepTimeMinutes);

    if (diffMinutes < requiredPrepTimeWithSafetyBuffer) {
      return {
        feasible: false,
        estimatedArrival,
        bufferMinutes,
        warning: `Insufficient preparation window! The bus reaches ${stop.stopName} in ~${diffMinutes} mins, but this restaurant needs at least ${requiredPrepTimeWithSafetyBuffer} mins (including safe packaging & bus bay dispatch).`,
      };
    }

    if (bufferMinutes < 25) {
      return {
        feasible: true,
        estimatedArrival,
        bufferMinutes,
        warning: `Tight window warning: Order should be placed promptly. Estimated bus arrival at ${estimatedArrival} leaves a ${bufferMinutes} min safety buffer.`,
      };
    }

    return {
      feasible: true,
      estimatedArrival,
      bufferMinutes,
    };
  }

  // --- Cart Management ---
  public addToCart(item: MenuItem, quantity: number = 1, notes?: string): void {
    // If cart has items from another restaurant, prompt or replace
    const existingIndex = this.cart.findIndex((c) => c.menuItem.id === item.id);
    const hasDifferentRestaurant = this.cart.length > 0 && this.cart[0].menuItem.restaurantId !== item.restaurantId;

    if (hasDifferentRestaurant) {
      // Clear previous restaurant items
      this.cart = [{ menuItem: item, quantity, notes }];
    } else if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += quantity;
      if (notes) this.cart[existingIndex].notes = notes;
    } else {
      this.cart.push({ menuItem: item, quantity, notes });
    }

    saveToStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public updateCartQuantity(itemId: string, delta: number): void {
    const itemIndex = this.cart.findIndex((c) => c.menuItem.id === itemId);
    if (itemIndex >= 0) {
      this.cart[itemIndex].quantity += delta;
      if (this.cart[itemIndex].quantity <= 0) {
        this.cart.splice(itemIndex, 1);
      }
      saveToStorage(STORAGE_KEYS.CART, this.cart);
      this.notify();
    }
  }

  public clearCart(): void {
    this.cart = [];
    saveToStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public getCartBill() {
    const subtotal = this.cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
    const packagingTotal = this.cart.reduce((sum, c) => sum + (c.menuItem.packagingCharge || 10) * c.quantity, 0);
    const gstTax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST on Restaurant Services
    const platformFee = this.cart.length > 0 ? 10 : 0; // Flat ₹10 Platform Tech Fee
    const totalAmount = Math.round((subtotal + packagingTotal + gstTax + platformFee) * 100) / 100;

    return {
      subtotal,
      packagingTotal,
      gstTax,
      platformFee,
      totalAmount,
      totalItems: this.cart.reduce((s, c) => s + c.quantity, 0),
    };
  }

  // --- Order Placement & Razorpay Payment Simulation ---
  public async placeOrder(params: {
    journey: BusJourney;
    stop: BusStop;
    restaurant: Restaurant;
    seatNumber: string;
    pnrNumber: string;
    paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'test_mode';
    simulateFailure?: boolean;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    const bill = this.getCartBill();
    if (bill.totalItems === 0) {
      return { success: false, error: 'Shopping cart is empty.' };
    }

    if (params.simulateFailure) {
      this.logAudit('PAYMENT_FAILED_SIMULATION', `Passenger simulated payment failure for cart worth ₹${bill.totalAmount}`);
      return {
        success: false,
        error: 'Razorpay simulated payment failed: Insufficient funds / bank gateway timeout. Please retry.',
      };
    }

    // Generate single-use secure 4-digit pickup code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNum = `RB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const estimatedArrival = this.calculateStopArrivalTime(
      params.journey.departureTime,
      params.stop.scheduledArrivalOffsetMinutes,
      params.journey.currentDelayMinutes
    );

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      passengerId: this.currentUser.id,
      passengerName: this.currentUser.name,
      passengerPhone: this.currentUser.phone,
      journeyId: params.journey.id,
      busOperatorName: params.journey.operatorName,
      busServiceNumber: params.journey.busServiceNumber,
      seatNumber: params.seatNumber || 'Unassigned',
      pnrNumber: params.pnrNumber || `PNR-${Math.floor(100000 + Math.random() * 900000)}`,
      stopId: params.stop.id,
      stopName: params.stop.stopName,
      restaurantId: params.restaurant.id,
      restaurantName: params.restaurant.name,
      items: this.cart.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
        packagingCharge: c.menuItem.packagingCharge,
        isVeg: c.menuItem.isVeg,
      })),
      subtotal: bill.subtotal,
      packagingTotal: bill.packagingTotal,
      gstTax: bill.gstTax,
      platformFee: bill.platformFee,
      totalAmount: bill.totalAmount,
      paymentStatus: 'paid',
      paymentMethod: params.paymentMethod,
      razorpayPaymentId: `pay_RZP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      orderStatus: 'placed',
      otpCode,
      qrCodeData: `ROUTEBITE-PICKUP:${orderNum}:OTP-${otpCode}:STOP-${params.stop.id}`,
      createdAt: new Date().toISOString(),
      busEstimatedArrival: estimatedArrival,
      busStopDurationMinutes: params.stop.stopBreakDurationMinutes,
      feasibilityBufferMinutes: 25,
      pickupInstruction: params.stop.pickupBayInstructions,
    };

    this.orders = [newOrder, ...this.orders];
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.clearCart();

    this.logAudit(
      'ORDER_CREATED',
      `Order ${orderNum} placed by ${this.currentUser.name} at ${params.restaurant.name} for Stop: ${params.stop.stopName} (Amount: ₹${bill.totalAmount})`
    );

    this.notify();
    return { success: true, order: newOrder };
  }

  // --- Order Status Transitions (Restaurant & Admin) ---
  public updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex >= 0) {
      const prevStatus = this.orders[orderIndex].orderStatus;
      this.orders[orderIndex].orderStatus = newStatus;
      saveToStorage(STORAGE_KEYS.ORDERS, this.orders);

      this.logAudit(
        'ORDER_STATUS_CHANGED',
        `Order ${this.orders[orderIndex].orderNumber} changed from ${prevStatus} to ${newStatus}`
      );
      this.notify();
    }
  }

  // --- Pickup Verification (Restaurant Partner) ---
  public verifyAndCollectOrder(orderId: string, inputOtp: string): { success: boolean; message: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: 'Order not found in database.' };
    }

    if (order.orderStatus === 'collected') {
      return { success: false, message: 'This food parcel has already been collected.' };
    }

    if (order.otpCode !== inputOtp.trim()) {
      this.logAudit('PICKUP_OTP_FAILED', `Failed OTP attempt for Order ${order.orderNumber}. Entered: ${inputOtp}`);
      return { success: false, message: 'Invalid 4-digit Pickup OTP code! Please cross-check passenger app.' };
    }

    order.orderStatus = 'collected';
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.logAudit('PICKUP_VERIFIED_SUCCESS', `Food handover completed for Order ${order.orderNumber} via OTP ${inputOtp}`);
    this.notify();

    return {
      success: true,
      message: `Pickup verified successfully! Food handed over to passenger for Order #${order.orderNumber}.`,
    };
  }

  // --- Cancel & Refund Flow ---
  public cancelOrder(orderId: string, reason: string): { success: boolean; message: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (['preparing', 'ready_for_pickup', 'collected'].includes(order.orderStatus)) {
      return {
        success: false,
        message: 'Order cannot be cancelled because the restaurant has already started kitchen preparation.',
      };
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    order.cancellationReason = reason;
    order.refundAmount = order.totalAmount;

    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.logAudit('ORDER_CANCELLED', `Order ${order.orderNumber} cancelled. Refund of ₹${order.totalAmount} processed.`);
    this.notify();

    return {
      success: true,
      message: `Order #${order.orderNumber} cancelled. ₹${order.totalAmount} refund initiated to original payment source.`,
    };
  }

  // --- Bus Delay Updates (Bus Operator) ---
  public updateJourneyDelay(journeyId: string, newDelayMinutes: number, updateNotes?: string): void {
    const journeyIndex = this.journeys.findIndex((j) => j.id === journeyId);
    if (journeyIndex >= 0) {
      const prevDelay = this.journeys[journeyIndex].currentDelayMinutes;
      this.journeys[journeyIndex].currentDelayMinutes = newDelayMinutes;
      if (updateNotes) {
        this.journeys[journeyIndex].lastLocationUpdate = updateNotes;
      }
      saveToStorage(STORAGE_KEYS.JOURNEYS, this.journeys);

      // Recalculate estimated arrival times for active orders on this journey
      this.orders.forEach((ord) => {
        if (ord.journeyId === journeyId && ord.orderStatus !== 'collected' && ord.orderStatus !== 'cancelled') {
          const stop = this.stops.find((s) => s.id === ord.stopId);
          if (stop) {
            ord.busEstimatedArrival = this.calculateStopArrivalTime(
              this.journeys[journeyIndex].departureTime,
              stop.scheduledArrivalOffsetMinutes,
              newDelayMinutes
            );
          }
        }
      });
      saveToStorage(STORAGE_KEYS.ORDERS, this.orders);

      this.logAudit(
        'BUS_DELAY_UPDATED',
        `Bus journey ${this.journeys[journeyIndex].busServiceNumber} delay adjusted from ${prevDelay}m to ${newDelayMinutes}m. Active orders updated.`
      );
      this.notify();
    }
  }

  // --- Restaurant Menu & Profile Management ---
  public toggleMenuItemAvailability(itemId: string): void {
    const item = this.menuItems.find((m) => m.id === itemId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      saveToStorage(STORAGE_KEYS.MENU_ITEMS, this.menuItems);
      this.logAudit('MENU_ITEM_TOGGLE', `${item.name} availability set to ${item.isAvailable ? 'AVAILABLE' : '86-OUT_OF_STOCK'}`);
      this.notify();
    }
  }

  public addMenuItem(newItem: Omit<MenuItem, 'id'>): void {
    const item: MenuItem = {
      ...newItem,
      id: `item-${Date.now()}`,
    };
    this.menuItems.push(item);
    saveToStorage(STORAGE_KEYS.MENU_ITEMS, this.menuItems);
    this.logAudit('MENU_ITEM_ADDED', `Added new dish "${item.name}" for restaurant.`);
    this.notify();
  }

  public updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): void {
    const rest = this.restaurants.find((r) => r.id === restaurantId);
    if (rest) {
      Object.assign(rest, updates);
      saveToStorage(STORAGE_KEYS.RESTAURANTS, this.restaurants);
      this.notify();
    }
  }

  // --- Admin Approvals & Routes ---
  public setRestaurantApproval(restaurantId: string, status: 'approved' | 'rejected' | 'suspended'): void {
    const rest = this.restaurants.find((r) => r.id === restaurantId);
    if (rest) {
      rest.approvalStatus = status;
      saveToStorage(STORAGE_KEYS.RESTAURANTS, this.restaurants);
      this.logAudit('RESTAURANT_APPROVAL_CHANGED', `Restaurant "${rest.name}" status changed to ${status.toUpperCase()}`);
      this.notify();
    }
  }

  public submitSupportTicket(orderId: string, subject: string, message: string): void {
    const complaint: SupportComplaint = {
      id: `comp-${Date.now()}`,
      orderId,
      passengerName: this.currentUser.name,
      passengerPhone: this.currentUser.phone,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.complaints = [complaint, ...this.complaints];
    saveToStorage(STORAGE_KEYS.COMPLAINTS, this.complaints);
    this.logAudit('SUPPORT_TICKET_OPENED', `New grievance ticket filed for Order ${orderId}`);
    this.notify();
  }

  public resolveSupportTicket(ticketId: string, notes: string): void {
    const t = this.complaints.find((c) => c.id === ticketId);
    if (t) {
      t.status = 'resolved';
      t.resolutionNotes = notes;
      saveToStorage(STORAGE_KEYS.COMPLAINTS, this.complaints);
      this.notify();
    }
  }

  // --- Review Submission ---
  public submitReview(orderId: string, rating: number, comment: string): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.review = {
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
      this.logAudit('ORDER_REVIEW_SUBMITTED', `Passenger reviewed Order ${order.orderNumber}: ${rating} stars`);
      this.notify();
    }
  }

  // --- Metrics for Admin & Partner ---
  public getPlatformMetrics() {
    const totalOrders = this.orders.length;
    const gmv = this.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const platformCommission = Math.round(gmv * (this.platformCommissionRate / 100));
    const activePartners = this.restaurants.filter((r) => r.approvalStatus === 'approved').length;
    const collectedOrders = this.orders.filter((o) => o.orderStatus === 'collected').length;
    const pickupSuccessRate = totalOrders > 0 ? Math.round((collectedOrders / totalOrders) * 100) : 100;

    return {
      totalOrders,
      gmv,
      platformCommission,
      activePartners,
      pickupSuccessRate,
      activeRoutes: this.routes.filter((r) => r.isActive).length,
      totalStops: this.stops.length,
    };
  }

  public getRestaurantMetrics(restaurantId: string) {
    const restaurantOrders = this.orders.filter((o) => o.restaurantId === restaurantId);
    const completedOrders = restaurantOrders.filter((o) => o.orderStatus === 'collected');
    const grossRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const commRate = this.restaurants.find((r) => r.id === restaurantId)?.commissionRate || 12;
    const commissionPayable = Math.round(grossRevenue * (commRate / 100));
    const netPayout = grossRevenue - commissionPayable;

    return {
      totalOrders: restaurantOrders.length,
      pendingOrders: restaurantOrders.filter((o) => ['placed', 'accepted', 'preparing'].includes(o.orderStatus)).length,
      readyOrders: restaurantOrders.filter((o) => o.orderStatus === 'ready_for_pickup').length,
      completedOrders: completedOrders.length,
      grossRevenue,
      commissionPayable,
      netPayout,
      commRate,
    };
  }
}

export const store = AppStore.getInstance();
