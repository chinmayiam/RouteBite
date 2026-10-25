import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { QrCodeDisplay } from './QrCodeDisplay';
import {
  CheckCircle,
  Clock,
  MapPin,
  Bus,
  AlertCircle,
  Star,
  CornerUpLeft,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderTrackerProps {
  orders: Order[];
  onCancelOrder: (orderId: string, reason: string) => void;
  onSubmitReview: (orderId: string, rating: number, comment: string) => void;
  onSubmitComplaint: (orderId: string, subject: string, message: string) => void;
  onExploreMore: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onCancelOrder,
  onSubmitReview,
  onSubmitComplaint,
  onExploreMore,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of travel plan');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('Late food handover at stop');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'placed':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'collected':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received by kitchen' },
    { label: 'Kitchen Confirmed', desc: 'Slot scheduled' },
    { label: 'Preparing Fresh', desc: 'Piping hot cooking' },
    { label: 'At Pickup Bay', desc: 'Ready for handoff' },
    { label: 'Collected', desc: 'Enjoy your meal!' },
  ];

  if (!activeOrder || orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">No Orders Placed Yet</h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          You have not placed any highway meal orders yet. Select your bus route and pre-order fresh food from top stops!
        </p>
        <button
          onClick={onExploreMore}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm inline-block"
        >
          Find Highway Restaurants
        </button>
      </div>
    );
  }

  const stepIndex = getStatusStepIndex(activeOrder.orderStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Multiple Orders Selector */}
      {orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">Your Orders:</span>
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                o.id === activeOrder.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              #{o.orderNumber} ({o.restaurantName.split(' ')[0]})
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Pickup Card with OTP & QR */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-stone-100 pb-4">
            <div>
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Secure Collection Pass</span>
              <h3 className="text-lg font-bold text-stone-900 mt-0.5">Order #{activeOrder.orderNumber}</h3>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                activeOrder.orderStatus === 'collected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeOrder.orderStatus === 'cancelled'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {activeOrder.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>

          {/* OTP Code Display */}
          <div className="text-center p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Single-Use Pickup OTP
            </span>
            <div className="text-4xl font-mono font-black tracking-widest text-stone-900 select-all">
              {activeOrder.otpCode}
            </div>
            <p className="text-[11px] text-stone-500">
              Provide this 4-digit code to the RouteBite counter executive at the halt stop.
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-stone-50/60 rounded-xl border border-stone-200/80">
            <QrCodeDisplay data={activeOrder.qrCodeData} size={150} />
            <span className="text-[11px] text-stone-400 mt-2 font-mono">Scan for Instant Touchless Handoff</span>
          </div>

          {/* Location & Bay Instructions */}
          <div className="space-y-3 pt-2 border-t border-stone-100 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Pickup Counter Location</span>
                <p className="text-stone-600 mt-0.5 leading-relaxed">{activeOrder.pickupInstruction}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Bus className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Bus & Halt Timing</span>
                <p className="text-stone-600 mt-0.5">
                  {activeOrder.busOperatorName} · Seat: <span className="font-semibold text-stone-900">{activeOrder.seatNumber}</span>
                </p>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Est. Bus Arrival at Stop: <span className="font-semibold text-stone-900 tabular-nums">{activeOrder.busEstimatedArrival}</span> ({activeOrder.busStopDurationMinutes} min scheduled halt)
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            {['placed', 'accepted'].includes(activeOrder.orderStatus) && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="w-full py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>Cancel Order & Auto-Refund</span>
              </button>
            )}

            {activeOrder.orderStatus === 'collected' && !activeOrder.review && (
              <button
                onClick={() => {
                  setReviewModalOpen(true);
                  triggerCelebration();
                }}
                className="w-full py-2.5 text-xs font-semibold text-stone-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-amber-600" />
                <span>Leave Meal Rating & Review</span>
              </button>
            )}

            <button
              onClick={() => setComplaintModalOpen(true)}
              className="w-full py-2 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need Help / Report Stop Issue</span>
            </button>
          </div>
        </div>

        {/* Right Column (2 cols wide): Order Pipeline & Bill */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Stepper */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Live Preparation & Handoff Pipeline</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Synced directly with {activeOrder.restaurantName}’s kitchen terminal
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400">Order Placed At</span>
                <div className="text-xs font-medium text-stone-800">
                  {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Stepper horizontal */}
            {activeOrder.orderStatus === 'cancelled' ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Order Cancelled
                </div>
                <p>Reason: {activeOrder.cancellationReason}</p>
                <p className="font-medium">
                  Refund of ₹{activeOrder.refundAmount?.toFixed(2)} processed via original payment source.
                </p>
              </div>
            ) : (
              <div className="relative pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {steps.map((step, idx) => {
                    const isDone = idx < stepIndex;
                    const isCurrent = idx === stepIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-orange-50/80 border-orange-300 ring-1 ring-orange-400'
                            : isDone
                            ? 'bg-stone-50 border-stone-200 text-stone-800'
                            : 'bg-white border-stone-100 text-stone-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isCurrent ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-600 border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-[10px] text-stone-400 font-mono">
                              {idx + 1}
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold leading-tight ${
                              isCurrent ? 'text-orange-900' : isDone ? 'text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-tight">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preparation Feasibility Trust Box */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Highway Timing Assurance</span>
                <p className="text-stone-600 mt-0.5 leading-relaxed">
                  Bus operator arrival feed is actively monitored. If the bus halts behind schedule, the kitchen maintains your food inside thermal insulated warming containers until you arrive at {activeOrder.stopName}.
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Food Items List & Bill Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Meal Items Ordered</h3>
            <div className="divide-y divide-stone-100">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs shrink-0 ${
                        item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}
                      />
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span className="text-stone-500 ml-2">× {item.quantity}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-stone-900 tabular-nums">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Food Subtotal</span>
                <span className="font-medium text-stone-900 tabular-nums">₹{activeOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Spill-proof Thermal Packaging</span>
                <span className="font-medium text-stone-900 tabular-nums">₹{activeOrder.packagingTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% Restaurant Services)</span>
                <span className="font-medium text-stone-900 tabular-nums">₹{activeOrder.gstTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Highway Delivery Fee</span>
                <span className="font-medium text-stone-900 tabular-nums">₹{activeOrder.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Total Paid via Razorpay</span>
                <span className="tabular-nums">₹{activeOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Passenger Review (if submitted) */}
            {activeOrder.review && (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1 font-semibold text-amber-900">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Your Verified Review ({activeOrder.review.rating} / 5 Stars)</span>
                </div>
                <p className="text-stone-700 italic">"{activeOrder.review.comment}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">Cancel Highway Food Order</h3>
            <p className="text-xs text-stone-600">
              Since the kitchen has not yet started preparing your meal, you are eligible for a 100% full refund of ₹
              {activeOrder.totalAmount.toFixed(2)}.
            </p>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Select Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option>Change of travel plan / Bus cancelled</option>
                <option>Bus diverted to different highway stop</option>
                <option>Ordered by mistake</option>
                <option>Other personal reason</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  onCancelOrder(activeOrder.id, cancelReason);
                  setCancelModalOpen(false);
                  setActionNotice(`Order #${activeOrder.orderNumber} successfully cancelled. Refund processed.`);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">Rate Your Meal Experience</h3>
            <p className="text-xs text-stone-600">
              Help other Karnataka bus passengers find the best dishes on this corridor.
            </p>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Your Feedback & Dish Review</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the food temperature, packaging, and pickup speed?"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmitReview(activeOrder.id, reviewRating, reviewComment || 'Great hot food at the highway halt!');
                  setReviewModalOpen(false);
                  setActionNotice('Thank you! Your verified rating was recorded.');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Support Ticket Modal */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">File Highway Transit Grievance</h3>
            <p className="text-xs text-stone-600">
              Our 24x7 Transit Operations Desk will investigate with the stop manager and bus operator.
            </p>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Subject</label>
              <select
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option>Late food handover at stop</option>
                <option>Bus departed early / Driver refused to wait for scheduled break</option>
                <option>Packaging spill or missing item</option>
                <option>Payment deducted but order failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={complaintMessage}
                onChange={(e) => setComplaintMessage(e.target.value)}
                placeholder="Please describe what happened..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setComplaintModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmitComplaint(
                    activeOrder.orderNumber,
                    complaintSubject,
                    complaintMessage || 'Assistance requested for order handover.'
                  );
                  setComplaintModalOpen(false);
                  setActionNotice('Support ticket registered. Our transit executive is reviewing.');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
