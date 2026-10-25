import React, { useState } from 'react';
import {
  Restaurant,
  BusRoute,
  BusStop,
  Order,
  AuditLog,
  SupportComplaint,
  OrderStatus,
} from '../types';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Store,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface AdminPortalProps {
  restaurants: Restaurant[];
  routes: BusRoute[];
  stops: BusStop[];
  orders: Order[];
  auditLogs: AuditLog[];
  complaints: SupportComplaint[];
  platformCommissionRate: number;
  onSetApproval: (restaurantId: string, status: 'approved' | 'rejected' | 'suspended') => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onResolveComplaint: (complaintId: string, notes: string) => void;
  onUpdateCommissionRate: (rate: number) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  restaurants,
  routes,
  stops,
  orders,
  auditLogs,
  complaints,
  platformCommissionRate,
  onSetApproval,
  onUpdateOrderStatus,
  onResolveComplaint,
  onUpdateCommissionRate,
}) => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'partners' | 'orders' | 'complaints' | 'audit'>('kpis');
  const [selectedCommission, setSelectedCommission] = useState(platformCommissionRate);
  const [resolutionInput, setResolutionInput] = useState<Record<string, string>>({});

  // KPIs
  const totalOrders = orders.length;
  const gmv = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const platformRevenue = Math.round(gmv * (platformCommissionRate / 100));
  const activePartnersCount = restaurants.filter((r) => r.approvalStatus === 'approved').length;
  const collectedOrders = orders.filter((o) => o.orderStatus === 'collected').length;
  const pickupRate = totalOrders > 0 ? Math.round((collectedOrders / totalOrders) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title Strip */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
              Operations & Regulatory Console
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500">RouteBite Karnataka HQ</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Platform Command Center</h1>
          <p className="text-xs text-stone-500">
            Monitoring 4 highway corridors, {stops.length} halting stop food plazas, and {restaurants.length} kitchens.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'kpis'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Overview & KPIs
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'partners'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Restaurants ({restaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Grievances ({complaints.filter((c) => c.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'kpis' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Gross Merchandise Value (GMV)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 tabular-nums">
                ₹{gmv.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-400">Total volume on Karnataka corridors</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Platform Commission ({platformCommissionRate}%)</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-600 tabular-nums">
                ₹{platformRevenue.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-400">Net platform revenue</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Approved Kitchen Partners</span>
                <Store className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 tabular-nums">
                {activePartnersCount} / {restaurants.length}
              </div>
              <p className="text-[11px] text-stone-400">FSSAI verified highway stations</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Pickup Success Rate</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 tabular-nums">
                {pickupRate}%
              </div>
              <p className="text-[11px] text-stone-400">Verified via 4-digit OTP</p>
            </div>
          </div>

          {/* Commission Configuration Slider & Corridors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-stone-900 text-sm">Platform Commission Rate Setup</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Configure standard platform fee collected from participating restaurant orders.
              </p>
              <div className="flex items-center gap-3">
                {[8, 10, 12, 15, 18].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setSelectedCommission(rate);
                      onUpdateCommissionRate(rate);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedCommission === rate
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-stone-400 block">
                Current active rate: {selectedCommission}% (applied during restaurant net payout computation).
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-sm">Active Bus Corridors</h3>
              <div className="space-y-2 text-xs">
                {routes.map((r) => (
                  <div key={r.id} className="p-2.5 bg-stone-50 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-900">
                        {r.fromCity} ➔ {r.toCity}
                      </span>
                      <span className="text-stone-400 text-[11px] block">{r.highwayName}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESTAURANT ONBOARDING & APPROVALS */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Restaurant Partner Directory & Approvals</h2>
            <div className="text-xs text-stone-500">Enforcing FSSAI and highway hygiene standards</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Restaurant & Location</th>
                    <th className="px-6 py-3">Halt Stop</th>
                    <th className="px-6 py-3">FSSAI License</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {restaurants.map((rest) => (
                    <tr key={rest.id} className="hover:bg-stone-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-900">{rest.name}</div>
                        <div className="text-[11px] text-stone-400">{rest.cuisineTypes.join(', ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{rest.stopName}</div>
                        <div className="text-[11px] text-stone-400">{rest.highwayName}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">{rest.fssaiLicense}</td>
                      <td className="px-6 py-4 font-bold text-stone-900 tabular-nums">★ {rest.rating}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            rest.approvalStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rest.approvalStatus === 'suspended'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {rest.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rest.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => onSetApproval(rest.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {rest.approvalStatus === 'approved' && (
                            <button
                              onClick={() => onSetApproval(rest.id, 'suspended')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold cursor-pointer border border-rose-200"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL ORDERS MANAGEMENT & REFUNDS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Comprehensive Orders Ledger</h2>
            <div className="text-xs text-stone-500">Live order state management and escrow records</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Order Number</th>
                    <th className="px-6 py-3">Passenger & Bus</th>
                    <th className="px-6 py-3">Restaurant & Stop</th>
                    <th className="px-6 py-3">Total Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-stone-900">#{ord.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900">{ord.passengerName}</div>
                        <div className="text-[11px] text-stone-500">
                          {ord.busOperatorName} (Seat {ord.seatNumber})
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900">{ord.restaurantName}</div>
                        <div className="text-[11px] text-stone-500">{ord.stopName}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-900 tabular-nums">
                        ₹{ord.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ord.orderStatus === 'collected'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ord.orderStatus !== 'cancelled' && ord.orderStatus !== 'collected' && (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'collected')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Mark Collected
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLAINTS & GRIEVANCE TICKETS */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Passenger Transit Grievances</h2>
            <div className="text-xs text-stone-500">24x7 resolution tracking</div>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                No active complaints filed.
              </div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{c.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-stone-500 text-[11px] mt-0.5">
                        Filed by {c.passengerName} ({c.passengerPhone}) · Order Ref: {c.orderId}
                      </div>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
                    "{c.message}"
                  </p>

                  {c.status === 'open' ? (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Resolution notes (e.g. Refund issued / Operator notified)..."
                        value={resolutionInput[c.id] || ''}
                        onChange={(e) =>
                          setResolutionInput((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => {
                          onResolveComplaint(
                            c.id,
                            resolutionInput[c.id] || 'Investigated with stop controller and resolved.'
                          );
                        }}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Resolve Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg">
                      Resolved: {c.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Platform Security Audit Log</h2>
            <div className="text-xs text-stone-500">Immutable chronological trace of actions</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 divide-y divide-stone-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{log.action}</span>
                    <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded uppercase">
                      {log.role}
                    </span>
                  </div>
                  <p className="text-stone-600">{log.details}</p>
                </div>
                <div className="text-right sm:shrink-0 text-[11px] text-stone-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
