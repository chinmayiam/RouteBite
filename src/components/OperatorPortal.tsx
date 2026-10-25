import React, { useState } from 'react';
import { BusJourney, BusStop, BusOperator, Order } from '../types';
import { Bus, Clock, MapPin, AlertTriangle, Users, CheckCircle2, Radio } from 'lucide-react';

interface OperatorPortalProps {
  operator: BusOperator;
  journeys: BusJourney[];
  stops: BusStop[];
  orders: Order[];
  onUpdateDelay: (journeyId: string, delayMins: number, notes?: string) => void;
}

export const OperatorPortal: React.FC<OperatorPortalProps> = ({
  operator,
  journeys,
  stops,
  orders,
  onUpdateDelay,
}) => {
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    journeys.find((j) => j.operatorId === operator.id)?.id || journeys[0]?.id || ''
  );
  const [customDelayInput, setCustomDelayInput] = useState<number>(0);
  const [delayNotes, setDelayNotes] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const activeJourney = journeys.find((j) => j.id === selectedJourneyId) || journeys[0];
  const journeyOrders = orders.filter((o) => o.journeyId === activeJourney?.id);
  const routeStops = stops.filter((s) => s.routeId === activeJourney?.routeId);

  const handleApplyDelay = (delayMins: number, reason?: string) => {
    if (!activeJourney) return;
    onUpdateDelay(activeJourney.id, delayMins, reason || delayNotes);
    setUpdateSuccess(
      `Trip ${activeJourney.busServiceNumber} delay adjusted to +${delayMins} mins. Passenger & Restaurant kitchen terminals notified.`
    );
    setTimeout(() => setUpdateSuccess(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Operator Header Strip */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Authorized Fleet Dispatch Terminal
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500">{operator.brandTag}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{operator.name}</h1>
          <p className="text-xs text-stone-500">
            Active Fleet on RouteBite: {operator.activeFleetCount} Luxury Coaches · Helpline: {operator.helpline}
          </p>
        </div>

        {/* Journey Dropdown Selector */}
        <div className="space-y-1 min-w-[280px]">
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Active Monitored Trip
          </label>
          <select
            value={selectedJourneyId}
            onChange={(e) => setSelectedJourneyId(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {journeys
              .filter((j) => j.operatorId === operator.id)
              .map((j) => (
                <option key={j.id} value={j.id}>
                  {j.busServiceNumber} (Dep: {j.departureTime})
                </option>
              ))}
          </select>
        </div>
      </div>

      {updateSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{updateSuccess}</span>
        </div>
      )}

      {/* Main Grid: Live Delay Broadcaster & Manifest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delay Update Controller */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Real-Time Delay & Transit Broadcast</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              When traffic or weather alters bus progress, broadcast updates here to ensure highway restaurants calibrate hot meal preparation.
            </p>
          </div>

          {/* Current Status Box */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Current Delay Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs tabular-nums ${
                  activeJourney.currentDelayMinutes === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {activeJourney.currentDelayMinutes === 0
                  ? 'Running On Time'
                  : `+${activeJourney.currentDelayMinutes} mins Behind Schedule`}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed italic">
              "{activeJourney.lastLocationUpdate || 'Cruising on scheduled corridor.'}"
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">Quick Delay Presets</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleApplyDelay(0, 'Cleared traffic; running on scheduled timetable.')}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                On Time (0 min)
              </button>
              <button
                type="button"
                onClick={() => handleApplyDelay(10, 'Minor toll plaza congestion; running 10 mins late.')}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg transition-colors cursor-pointer border border-amber-200"
              >
                +10 mins (Toll)
              </button>
              <button
                type="button"
                onClick={() => handleApplyDelay(20, 'Heavy expressway rush; running 20 mins late.')}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg transition-colors cursor-pointer border border-amber-200"
              >
                +20 mins (Traffic)
              </button>
              <button
                type="button"
                onClick={() => handleApplyDelay(35, 'Ghat section rain/fog; safety slow speed 35m delay.')}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-900 font-semibold rounded-lg transition-colors cursor-pointer border border-rose-200"
              >
                +35 mins (Weather)
              </button>
            </div>
          </div>

          {/* Custom delay input */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700">Custom Delay Adjustment</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="180"
                value={customDelayInput}
                onChange={(e) => setCustomDelayInput(Number(e.target.value))}
                placeholder="Minutes"
                className="w-24 px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => handleApplyDelay(customDelayInput, delayNotes || 'Custom delay updated by operator.')}
                className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Publish Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Route Stops Timeline & Passenger Food Manifest */}
        <div className="lg:col-span-2 space-y-6">
          {/* Corridor Stops & Halts */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Designated Food Stops for this Trip</h3>
                <p className="text-xs text-stone-500">Official halting points where meals can be collected</p>
              </div>
              <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                Departure: {activeJourney.departureTime}
              </span>
            </div>

            <div className="space-y-3">
              {routeStops.map((stop, idx) => {
                const [depH, depM] = activeJourney.departureTime.split(':').map(Number);
                const totalMins = depH * 60 + depM + stop.scheduledArrivalOffsetMinutes + activeJourney.currentDelayMinutes;
                const arrH = Math.floor(totalMins / 60) % 24;
                const arrM = totalMins % 60;
                const estArrival = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

                return (
                  <div
                    key={stop.id}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{stop.stopName}</div>
                        <div className="text-stone-500 mt-0.5">{stop.pickupBayInstructions}</div>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="font-semibold text-stone-900">
                        Arrival: <strong className="tabular-nums">{estArrival}</strong>
                      </div>
                      <div className="text-[11px] text-stone-500">{stop.stopBreakDurationMinutes} min scheduled break</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passenger Food Manifest */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Passenger Meal Pickup Manifest</h3>
                <p className="text-xs text-stone-500">
                  Crew reference to ensure all dining passengers board back on time
                </p>
              </div>
              <span className="text-xs font-semibold bg-orange-100 text-orange-900 px-2.5 py-0.5 rounded-full">
                {journeyOrders.length} {journeyOrders.length === 1 ? 'Order' : 'Orders'} on Trip
              </span>
            </div>

            {journeyOrders.length === 0 ? (
              <div className="p-8 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                No food orders booked on this specific bus trip yet. Orders will sync here in real time.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {journeyOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-stone-900">
                        Seat {ord.seatNumber} · {ord.passengerName}
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        Order #{ord.orderNumber} · Pickup at <span className="font-semibold text-stone-700">{ord.stopName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          ord.orderStatus === 'collected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
