import React, { useState } from 'react';
import { BusJourney, BusStop, Restaurant, CartItem } from '../types';
import {
  MapPin,
  Bus,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface CheckoutViewProps {
  journey: BusJourney;
  stop: BusStop;
  restaurant: Restaurant;
  cart: CartItem[];
  passengerName: string;
  passengerPhone: string;
  onUpdateQty: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onProceedToRazorpay: (details: {
    seatNumber: string;
    pnrNumber: string;
    instructions: string;
  }) => void;
  onBackToMenu: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  journey,
  stop,
  restaurant,
  cart,
  passengerName,
  passengerPhone,
  onUpdateQty,
  onClearCart,
  onProceedToRazorpay,
  onBackToMenu,
}) => {
  const [seatNumber, setSeatNumber] = useState('14B');
  const [pnrNumber, setPnrNumber] = useState(`KSRTC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [instructions, setInstructions] = useState('Pack extra coconut chutney and napkins in spill-proof box.');
  const [agreedTerms, setAgreedTerms] = useState(true);

  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const packagingTotal = cart.reduce(
    (sum, item) => sum + (item.menuItem.packagingCharge || 10) * item.quantity,
    0
  );
  const gstTax = Math.round(subtotal * 0.05 * 100) / 100;
  const platformFee = 10;
  const grandTotal = Math.round((subtotal + packagingTotal + gstTax + platformFee) * 100) / 100;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs text-stone-600">Choose dishes from the highway restaurant menu to proceed.</p>
        <button
          onClick={onBackToMenu}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBackToMenu}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {restaurant.name} Menu</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Order Items & Bus Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Journey & Stop Context */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Halt & Pickup Verification Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-2.5">
                <Bus className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900">{journey.operatorName}</span>
                  <p className="text-stone-500 mt-0.5">{journey.busServiceNumber}</p>
                  <p className="text-stone-500 text-[11px]">Departure: {journey.departureTime}</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900">{stop.stopName}</span>
                  <p className="text-stone-500 mt-0.5">{stop.highwayMilestone}</p>
                  <p className="text-emerald-700 text-[11px] font-medium">{stop.stopBreakDurationMinutes} min bus halt</p>
                </div>
              </div>
            </div>

            {/* Seat & PNR Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Bus Seat Number *
                </label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder="e.g. 14B, Lower Berth"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Bus Ticket / PNR Number
                </label>
                <input
                  type="text"
                  value={pnrNumber}
                  onChange={(e) => setPnrNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kitchen Packaging Notes (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Mild spice, pack extra cutlery"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Selected Dishes ({cart.length})</h3>
              <button
                type="button"
                onClick={onClearCart}
                className="text-stone-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs shrink-0 ${
                        item.menuItem.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.menuItem.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{item.menuItem.name}</div>
                      <div className="text-[11px] text-stone-500">₹{item.menuItem.price} each</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-2 py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.menuItem.id, -1)}
                        className="p-1 hover:text-orange-600 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold px-1 tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.menuItem.id, 1)}
                        className="p-1 hover:text-orange-600 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs font-bold text-stone-900 w-16 text-right tabular-nums">
                      ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Transparent Bill & Pay Button */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <h3 className="font-bold text-stone-900 text-sm">Bill Breakdown</h3>

          <div className="space-y-2.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-medium text-stone-900 tabular-nums">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Spill-proof Eco Packaging</span>
              <span className="font-medium text-stone-900 tabular-nums">₹{packagingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5% Restaurant Service)</span>
              <span className="font-medium text-stone-900 tabular-nums">₹{gstTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Highway Delivery</span>
              <span className="font-medium text-stone-900 tabular-nums">₹{platformFee.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
              <span>Grand Total</span>
              <span className="tabular-nums">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-[11px] text-stone-500 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Refund Protection</span>
            </div>
            <p>
              If your bus changes scheduled stops or cannot halt for at least 10 minutes, your payment will be refunded immediately.
            </p>
          </div>

          <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <span>I agree to collect the meal using the generated 4-digit OTP during the scheduled bus break.</span>
          </label>

          <button
            type="button"
            disabled={!agreedTerms || !seatNumber.trim()}
            onClick={() =>
              onProceedToRazorpay({
                seatNumber,
                pnrNumber,
                instructions,
              })
            }
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay ₹{grandTotal.toFixed(2)} via Razorpay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
