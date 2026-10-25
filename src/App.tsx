import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { UserRole, BusJourney, BusStop, Restaurant, MenuItem, OrderStatus } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { PassengerFlow } from './components/PassengerFlow';
import { CheckoutView } from './components/CheckoutView';
import { OrderTracker } from './components/OrderTracker';
import { RestaurantPortal } from './components/RestaurantPortal';
import { OperatorPortal } from './components/OperatorPortal';
import { AdminPortal } from './components/AdminPortal';
import { HowItWorksPage, SupportedRoutesPage, SafetyStandardsPage } from './components/StaticPages';
import { RazorpayModal } from './components/RazorpayModal';
import confetti from 'canvas-confetti';

export default function App() {
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string | null>(null);

  // Checkout modal & payment state
  const [checkoutParams, setCheckoutParams] = useState<{
    journey: BusJourney;
    stop: BusStop;
    restaurant: Restaurant;
  } | null>(null);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [pendingCheckoutDetails, setPendingCheckoutDetails] = useState<{
    seatNumber: string;
    pnrNumber: string;
    instructions: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = store.currentUser;
  const currentRole = currentUser.role;

  const handleSwitchRole = (newRole: UserRole) => {
    store.switchRole(newRole);
    if (newRole === 'passenger') {
      setActiveTab('explore');
    } else {
      setActiveTab('portal');
    }
  };

  const handleOpenCheckout = (journey: BusJourney, stop: BusStop, restaurant: Restaurant) => {
    setCheckoutParams({ journey, stop, restaurant });
    setActiveTab('cart');
  };

  const handleProceedToRazorpay = (details: {
    seatNumber: string;
    pnrNumber: string;
    instructions: string;
  }) => {
    setPendingCheckoutDetails(details);
    setRazorpayModalOpen(true);
  };

  const handleRazorpaySuccess = async (paymentId: string) => {
    if (!checkoutParams || !pendingCheckoutDetails) return;

    setRazorpayModalOpen(false);

    const result = await store.placeOrder({
      journey: checkoutParams.journey,
      stop: checkoutParams.stop,
      restaurant: checkoutParams.restaurant,
      seatNumber: pendingCheckoutDetails.seatNumber,
      pnrNumber: pendingCheckoutDetails.pnrNumber,
      paymentMethod: 'razorpay_upi',
    });

    if (result.success && result.order) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setToastMessage({
        type: 'success',
        text: `Order #${result.order.orderNumber} placed successfully! Pickup OTP: ${result.order.otpCode}`,
      });
      setActiveTab('orders');
    } else {
      setToastMessage({
        type: 'error',
        text: result.error || 'Failed to place order.',
      });
    }
  };

  const handleRazorpayFailure = (errMsg: string) => {
    setRazorpayModalOpen(false);
    setToastMessage({
      type: 'error',
      text: errMsg,
    });
  };

  const bill = store.getCartBill();

  // Find active restaurant partner for restaurant portal
  const activePartnerRestaurant =
    store.restaurants.find((r) => r.id === currentUser.restaurantId) ||
    store.restaurants[0];

  // Find active operator for operator portal
  const activeOperator =
    store.operators.find((op) => op.id === currentUser.operatorId) ||
    store.operators[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Simulation Role Switcher Bar */}
      <RoleSwitcherBar
        currentRole={currentRole}
        userName={currentUser.name}
        onSwitchRole={handleSwitchRole}
      />

      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={bill.totalItems}
        userRole={currentRole}
      />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-md p-4 rounded-xl shadow-lg border text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-500 hover:text-stone-900 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Body Content based on activeTab & userRole */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <PassengerFlow
            routes={store.routes}
            stops={store.stops}
            journeys={store.journeys}
            restaurants={store.restaurants}
            menuItems={store.menuItems}
            cart={store.cart}
            onAddToCart={(item, qty) => {
              store.addToCart(item, qty);
              setToastMessage({
                type: 'success',
                text: `Added "${item.name}" to cart.`,
              });
              setTimeout(() => setToastMessage(null), 2500);
            }}
            onUpdateCartQty={(itemId, delta) => store.updateCartQuantity(itemId, delta)}
            onClearCart={() => store.clearCart()}
            onOpenCheckout={handleOpenCheckout}
            onSelectRouteFilter={selectedRouteFilter}
          />
        )}

        {activeTab === 'cart' && checkoutParams && (
          <CheckoutView
            journey={checkoutParams.journey}
            stop={checkoutParams.stop}
            restaurant={checkoutParams.restaurant}
            cart={store.cart}
            passengerName={currentUser.name}
            passengerPhone={currentUser.phone}
            onUpdateQty={(itemId, delta) => store.updateCartQuantity(itemId, delta)}
            onClearCart={() => store.clearCart()}
            onProceedToRazorpay={handleProceedToRazorpay}
            onBackToMenu={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'orders' && (
          <OrderTracker
            orders={store.orders}
            onCancelOrder={(orderId, reason) => store.cancelOrder(orderId, reason)}
            onSubmitReview={(orderId, rating, comment) =>
              store.submitReview(orderId, rating, comment)
            }
            onSubmitComplaint={(orderId, subject, message) =>
              store.submitSupportTicket(orderId, subject, message)
            }
            onExploreMore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'routes' && (
          <SupportedRoutesPage
            routes={store.routes}
            stops={store.stops}
            onSelectRoute={(routeId) => {
              setSelectedRouteFilter(routeId);
              setActiveTab('explore');
            }}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorksPage onStartJourney={() => setActiveTab('explore')} />
        )}

        {activeTab === 'safety' && <SafetyStandardsPage />}

        {/* Portals */}
        {activeTab === 'portal' && currentRole === 'restaurant' && (
          <RestaurantPortal
            restaurant={activePartnerRestaurant}
            menuItems={store.menuItems}
            orders={store.orders}
            onUpdateOrderStatus={(orderId, status) =>
              store.updateOrderStatus(orderId, status)
            }
            onVerifyOtp={(orderId, otp) => store.verifyAndCollectOrder(orderId, otp)}
            onToggleAvailability={(itemId) => store.toggleMenuItemAvailability(itemId)}
            onAddMenuItem={(item) => store.addMenuItem(item)}
          />
        )}

        {activeTab === 'portal' && currentRole === 'operator' && (
          <OperatorPortal
            operator={activeOperator}
            journeys={store.journeys}
            stops={store.stops}
            orders={store.orders}
            onUpdateDelay={(journeyId, delayMins, notes) =>
              store.updateJourneyDelay(journeyId, delayMins, notes)
            }
          />
        )}

        {activeTab === 'portal' && currentRole === 'admin' && (
          <AdminPortal
            restaurants={store.restaurants}
            routes={store.routes}
            stops={store.stops}
            orders={store.orders}
            auditLogs={store.auditLogs}
            complaints={store.complaints}
            platformCommissionRate={store.platformCommissionRate}
            onSetApproval={(restId, status) => store.setRestaurantApproval(restId, status)}
            onUpdateOrderStatus={(ordId, status) => store.updateOrderStatus(ordId, status)}
            onResolveComplaint={(compId, notes) => store.resolveSupportTicket(compId, notes)}
            onUpdateCommissionRate={(rate) => {
              store.platformCommissionRate = rate;
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Razorpay Sandbox Checkout Modal */}
      {razorpayModalOpen && checkoutParams && (
        <RazorpayModal
          amount={bill.totalAmount}
          orderSummary={{
            itemsCount: bill.totalItems,
            restaurantName: checkoutParams.restaurant.name,
            stopName: checkoutParams.stop.stopName,
          }}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
          onClose={() => setRazorpayModalOpen(false)}
        />
      )}
    </div>
  );
}
