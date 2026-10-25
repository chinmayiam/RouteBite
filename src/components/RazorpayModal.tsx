import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, ShieldCheck, AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface RazorpayModalProps {
  amount: number;
  orderSummary: {
    itemsCount: number;
    restaurantName: string;
    stopName: string;
  };
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  amount,
  orderSummary,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('passenger@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateFailure) {
        onFailure('Payment declined by simulated issuing bank (Sandbox Test Err: INSUFFICIENT_FUNDS).');
      } else {
        const mockPaymentId = `pay_rzp_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        onSuccess(mockPaymentId);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Razorpay Brand Bar */}
        <div className="bg-[#0c2340] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-wide text-sm">Razorpay</span>
                <span className="bg-amber-400 text-slate-950 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded">
                  Test Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-300">RouteBite Verified Bus Delivery Escrow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-stone-50 px-6 py-3 border-b border-stone-200 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-stone-900">{orderSummary.restaurantName}</div>
            <div className="text-stone-500 text-[11px]">Halt Stop: {orderSummary.stopName}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-stone-500">Payable Amount</div>
            <div className="text-base font-bold text-stone-900 tabular-nums">₹{amount.toFixed(2)}</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-5">
          <div className="flex rounded-lg bg-stone-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-md transition-colors ${
                paymentMethod === 'upi'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> UPI / QR
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-md transition-colors ${
                paymentMethod === 'card'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-md transition-colors ${
                paymentMethod === 'netbanking'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> NetBanking
            </button>
          </div>

          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Supports GPay, PhonePe, Paytm, BHIM, and Cred UPI handles</span>
              </div>
            </div>
          )}

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Test Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Netbanking */}
          {paymentMethod === 'netbanking' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-stone-700">Choose Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option>HDFC Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>ICICI Bank</option>
                <option>Canara Bank</option>
                <option>Kotak Mahindra Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* Testing toggle for payment failure simulation */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-stone-900 select-none">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-stone-700">Simulate bank gateway failure</span>
            </label>
            {simulateFailure && (
              <span className="text-[11px] text-amber-700 font-medium">Tests refund handling</span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-orange-600/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying with Razorpay...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pay ₹{amount.toFixed(2)} (Test Mode)</span>
              </>
            )}
          </button>

          {/* Security footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit TLS Encrypted · 100% Refundable if bus halts elsewhere</span>
          </div>
        </div>
      </div>
    </div>
  );
};
