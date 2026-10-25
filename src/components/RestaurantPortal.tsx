import React, { useState } from 'react';
import { Restaurant, MenuItem, Order, OrderStatus } from '../types';
import {
  Store,
  CheckCircle,
  Clock,
  KeyRound,
  Plus,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RestaurantPortalProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onVerifyOtp: (orderId: string, otp: string) => { success: boolean; message: string };
  onToggleAvailability: (itemId: string) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
}

export const RestaurantPortal: React.FC<RestaurantPortalProps> = ({
  restaurant,
  menuItems,
  orders,
  onUpdateOrderStatus,
  onVerifyOtp,
  onToggleAvailability,
  onAddMenuItem,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'verify' | 'menu' | 'finances'>('orders');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpMessages, setOtpMessages] = useState<Record<string, { success: boolean; text: string }>>({});
  const [addDishModalOpen, setAddDishModalOpen] = useState(false);

  // New Dish Form State
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState(150);
  const [dishCategory, setDishCategory] = useState<MenuItem['category']>('Quick Bites & Tiffins');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrepTime, setDishPrepTime] = useState(12);
  const [dishIsVeg, setDishIsVeg] = useState(true);

  // Filter orders for this restaurant
  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);
  const activeOrders = restaurantOrders.filter((o) =>
    ['placed', 'accepted', 'preparing', 'ready_for_pickup'].includes(o.orderStatus)
  );
  const completedOrders = restaurantOrders.filter((o) => o.orderStatus === 'collected');

  // Financial calculations
  const grossSales = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const commission = Math.round(grossSales * (restaurant.commissionRate / 100));
  const netEarnings = grossSales - commission;

  const handleOtpSubmit = (orderId: string) => {
    const input = otpInputs[orderId] || '';
    const res = onVerifyOtp(orderId, input);
    setOtpMessages((prev) => ({
      ...prev,
      [orderId]: { success: res.success, text: res.message },
    }));

    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
    }
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    onAddMenuItem({
      restaurantId: restaurant.id,
      name: dishName,
      description: dishDescription || 'Freshly prepared for highway travelers.',
      price: Number(dishPrice),
      category: dishCategory,
      isVeg: dishIsVeg,
      isAvailable: true,
      prepTimeMinutes: Number(dishPrepTime),
      packagingCharge: 15,
      rating: 4.8,
    });

    setDishName('');
    setDishDescription('');
    setAddDishModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Restaurant Header Strip */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Kitchen Terminal Active
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500">FSSAI: {restaurant.fssaiLicense}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{restaurant.name}</h1>
          <p className="text-xs text-stone-500">
            Halt Station: <span className="font-semibold text-stone-700">{restaurant.stopName}</span> · {restaurant.pickupCounterDescription}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pickup OTP Desk
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Menu & 86 Items
          </button>
          <button
            onClick={() => setActiveTab('finances')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'finances'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sales & Commission
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE ORDERS PIPELINE */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Incoming & Active Kitchen Queue</h2>
            <div className="text-xs text-stone-500">
              Auto-updating with live bus arrival ETAs
            </div>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <Store className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">All Current Orders Handed Over!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No active orders in the queue right now. New passenger orders on upcoming bus trips will chime here immediately.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => {
                const message = otpMessages[order.id];
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-mono text-stone-400">#{order.orderNumber}</span>
                          <h3 className="font-bold text-stone-900 text-sm mt-0.5">
                            {order.passengerName}
                          </h3>
                          <div className="text-[11px] text-stone-500">
                            Seat: <span className="font-bold text-stone-800">{order.seatNumber}</span> · {order.busOperatorName}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            order.orderStatus === 'placed'
                              ? 'bg-amber-100 text-amber-900'
                              : order.orderStatus === 'accepted'
                              ? 'bg-blue-100 text-blue-900'
                              : order.orderStatus === 'preparing'
                              ? 'bg-orange-100 text-orange-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Bus ETA Banner */}
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs flex items-center justify-between text-stone-700">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          Bus Halt ETA: <strong className="tabular-nums">{order.busEstimatedArrival}</strong>
                        </span>
                        <span className="text-[11px] text-stone-500">Halt: {order.busStopDurationMinutes}m</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-stone-800">
                            <span>
                              {it.quantity}× {it.name}
                            </span>
                            <span className="font-mono text-stone-600">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order transition buttons */}
                    <div className="space-y-2 pt-3 border-t border-stone-100">
                      {order.orderStatus === 'placed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                            className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Accept & Queue
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {order.orderStatus === 'accepted' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                          className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Start Kitchen Preparation
                        </button>
                      )}

                      {order.orderStatus === 'preparing' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ready_for_pickup')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Pack & Move to Pickup Bay
                        </button>
                      )}

                      {order.orderStatus === 'ready_for_pickup' && (
                        <div className="space-y-2">
                          <div className="text-[11px] text-emerald-800 font-medium">
                            Food bag ready at Counter. Enter passenger 4-digit OTP:
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="4-digit OTP"
                              value={otpInputs[order.id] || ''}
                              onChange={(e) =>
                                setOtpInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                              }
                              className="w-28 px-3 py-1.5 text-xs border border-stone-300 rounded-lg font-mono text-center tracking-widest font-bold"
                            />
                            <button
                              onClick={() => handleOtpSubmit(order.id)}
                              className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Verify & Handover
                            </button>
                          </div>
                          {message && (
                            <div
                              className={`text-[11px] p-2 rounded-lg ${
                                message.success
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-rose-50 text-rose-800'
                              }`}
                            >
                              {message.text}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RAPID OTP PICKUP DESK */}
      {activeTab === 'verify' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <KeyRound className="w-10 h-10 text-orange-600 mx-auto" />
            <h2 className="text-xl font-bold text-stone-900">Passenger Pickup Verification Desk</h2>
            <p className="text-xs text-stone-500">
              When a passenger arrives at your highway counter during the bus halt, ask for their 4-digit RouteBite collection code.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Awaiting Handover at Counter ({activeOrders.filter((o) => o.orderStatus === 'ready_for_pickup').length})
            </h3>

            {activeOrders.filter((o) => o.orderStatus === 'ready_for_pickup').length === 0 ? (
              <div className="p-6 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                No orders currently marked "Ready for Pickup". Update preparing orders when packaged!
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders
                  .filter((o) => o.orderStatus === 'ready_for_pickup')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-stone-900 text-sm">
                          {order.passengerName} (Seat {order.seatNumber})
                        </div>
                        <div className="text-xs text-stone-500">
                          Order #{order.orderNumber} · {order.items.length} items
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="OTP"
                          value={otpInputs[order.id] || ''}
                          onChange={(e) =>
                            setOtpInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          className="w-24 px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-center font-bold tracking-widest bg-white"
                        />
                        <button
                          onClick={() => handleOtpSubmit(order.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          Confirm Handover
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MENU MANAGEMENT & 86 STOCK TOGGLE */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Manage Menu Dishes & Stock</h2>
              <p className="text-xs text-stone-500">Toggle items on/off if kitchen ingredients run out</p>
            </div>
            <button
              onClick={() => setAddDishModalOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems
              .filter((m) => m.restaurantId === restaurant.id)
              .map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.isAvailable
                      ? 'bg-white border-stone-200'
                      : 'bg-stone-100 border-stone-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs shrink-0 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</h4>
                    </div>
                    <span className="font-bold text-stone-900 text-xs tabular-nums">₹{item.price}</span>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{item.description}</p>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">{item.prepTimeMinutes}m prep</span>
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(item.id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock (Available)' : '86’d (Out of Stock)'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: FINANCES & COMMISSION SETTLEMENT */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Gross Food Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 tabular-nums">
                ₹{grossSales.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-400">Total fulfilled passenger orders</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Platform Commission ({restaurant.commissionRate}%)</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 tabular-nums">
                ₹{commission.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-400">Includes payment gateway charges</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Net Partner Payout</span>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 tabular-nums">
                ₹{netEarnings.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-400">Direct NEFT/RTGS settlement</p>
            </div>
          </div>

          {/* Past completed orders log */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Completed Order Handover Log</h3>
            <div className="divide-y divide-stone-100">
              {completedOrders.length === 0 ? (
                <p className="text-xs text-stone-500 py-4">No completed orders yet today.</p>
              ) : (
                completedOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">
                        #{ord.orderNumber} · {ord.passengerName}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {ord.busOperatorName} (Seat {ord.seatNumber}) · OTP Verified
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-stone-900 tabular-nums">₹{ord.subtotal.toFixed(2)}</div>
                      <span className="text-[10px] text-emerald-700 font-medium">Collected</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {addDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateDish}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200"
          >
            <h3 className="text-lg font-bold text-stone-900">Add New Dish to Highway Menu</h3>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Dish Name *</label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g. Mangalore Buns Travel Pack (2 pcs)"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Prep Time (mins)</label>
                <input
                  type="number"
                  value={dishPrepTime}
                  onChange={(e) => setDishPrepTime(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
              <select
                value={dishCategory}
                onChange={(e) => setDishCategory(e.target.value as MenuItem['category'])}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option>Quick Bites & Tiffins</option>
                <option>Meals & Thalis</option>
                <option>Biryani & Pulao</option>
                <option>Combos & Boxes</option>
                <option>Beverages & Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={dishDescription}
                onChange={(e) => setDishDescription(e.target.value)}
                placeholder="Ingredients, packaging type, accompaniments..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={dishIsVeg}
                onChange={(e) => setDishIsVeg(e.target.checked)}
                className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Pure Vegetarian Dish (Green mark)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setAddDishModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg cursor-pointer"
              >
                Save Dish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
