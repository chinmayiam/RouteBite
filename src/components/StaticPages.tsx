import React from 'react';
import { BusRoute, BusStop } from '../types';
import { Clock, ShieldCheck, MapPin, CheckCircle, Coffee, AlertTriangle } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onStartJourney: () => void }> = ({ onStartJourney }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-orange-600 tracking-wider uppercase">Frictionless Highway Dining</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          How RouteBite Works
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          No more unhygienic bus halts or rushed eating. Get piping hot, authentic meals handed to you the moment your bus pulls into the stop.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
            01
          </div>
          <h3 className="text-lg font-semibold text-stone-900">Enter Your Journey & Stop</h3>
          <p className="text-stone-600 text-xs leading-relaxed">
            Select your origin, destination, and bus service (e.g. KSRTC Airavat, VRL, SRS). Our route engine identifies your scheduled highway halt stop and computes preparation feasibility.
          </p>
          <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Real-time buffer checks prevent tight-window orders</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
            02
          </div>
          <h3 className="text-lg font-semibold text-stone-900">Pre-Order from Verified Kitchens</h3>
          <p className="text-stone-600 text-xs leading-relaxed">
            Browse authentic South Indian tiffins, royal biryanis, fresh filter coffee, or wholesome thalis from FSSAI-certified highway food plazas. Checkout via Razorpay with instant confirmation.
          </p>
          <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Spill-proof, insulated thermal travel packaging</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
            03
          </div>
          <h3 className="text-lg font-semibold text-stone-900">Collect with 4-Digit OTP / QR</h3>
          <p className="text-stone-600 text-xs leading-relaxed">
            When your bus halts, step down to the designated RouteBite pickup counter. Show your secure single-use OTP or QR code to the executive and collect your fresh, steaming meal in under 60 seconds!
          </p>
          <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero lines, zero waiting, zero bus miss anxiety</span>
          </div>
        </div>
      </div>

      <div className="bg-stone-900 text-white p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold">Ready for a tastier highway journey?</h3>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">Explore available restaurants across Bengaluru-Mysuru, Mangaluru & Hubballi corridors.</p>
        </div>
        <button
          onClick={onStartJourney}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-md whitespace-nowrap"
        >
          Book Your Bus Meal Now
        </button>
      </div>
    </div>
  );
};

export const SupportedRoutesPage: React.FC<{
  routes: BusRoute[];
  stops: BusStop[];
  onSelectRoute: (routeId: string) => void;
}> = ({ routes, stops, onSelectRoute }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-orange-600 tracking-wider uppercase">Karnataka Highway Network</span>
        <h1 className="text-3xl font-bold text-stone-900">Supported Corridors & Food Halt Plazas</h1>
        <p className="text-stone-600 text-sm max-w-2xl">
          RouteBite operates on key high-density highway corridors in Karnataka with dedicated restaurant delivery counters at official bus halts.
        </p>
      </div>

      <div className="space-y-6">
        {routes.map((route) => {
          const routeStops = stops.filter((s) => s.routeId === route.id);
          return (
            <div key={route.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="bg-stone-50 p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900">
                      {route.fromCity} ➔ {route.toCity}
                    </h3>
                    <span className="text-xs font-mono font-medium text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {route.routeCode}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{route.highwayName}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-stone-600">
                    <span className="font-semibold text-stone-900 tabular-nums">{route.distanceKm} km</span> distance
                  </div>
                  <div className="text-stone-300">·</div>
                  <div className="text-stone-600">
                    <span className="font-semibold text-stone-900 tabular-nums">~{Math.round(route.totalDurationMinutes / 60)} hrs</span> journey
                  </div>
                  <button
                    onClick={() => onSelectRoute(route.id)}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Restaurants
                  </button>
                </div>
              </div>

              {/* Stop timeline */}
              <div className="p-6">
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
                  Designated Highway Halt Stops ({routeStops.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routeStops.map((stop) => (
                    <div key={stop.id} className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-sm">
                          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>{stop.stopName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-500 shrink-0">{stop.highwayMilestone}</span>
                      </div>
                      <div className="text-xs text-stone-600 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {stop.stopBreakDurationMinutes} min break
                        </span>
                        <span>·</span>
                        <span>{stop.distanceFromOriginKm} km from start</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">{stop.pickupBayInstructions}</p>
                      <div className="pt-1 flex flex-wrap gap-1">
                        {stop.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white text-stone-600 px-1.5 py-0.5 rounded border border-stone-200"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SafetyStandardsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">Hygiene & Quality Mandate</span>
        <h1 className="text-3xl font-bold text-stone-900">Food Safety & Travel Packaging Guidelines</h1>
        <p className="text-stone-600 text-sm">
          Eating while traveling requires exceptional safety standards. Here is how RouteBite protects every passenger meal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">FSSAI Certified Highway Kitchens</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every participating restaurant must submit an active 14-digit FSSAI license, water safety tests, and undergo surprise kitchen audits before being approved on RouteBite.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">Spill-Proof Insulated Travel Trays</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            All gravies, sambars, and chutneys are sealed in airtight leak-resistant containers with thermal insulation so your meal stays steaming hot even if the bus is delayed by 15 minutes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">Freshly Prepared On-Demand</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Kitchens only begin preparation 25 minutes prior to the verified arrival estimate of your bus. Food is never pre-packed hours in advance or reheated.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">Zero-Fault Route Divert Guarantee</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            If your bus changes stops unexpectedly or encounters an unmanageable highway diversion, 100% of your payment is automatically refunded back to your account with zero cancellation fee.
          </p>
        </div>
      </div>
    </div>
  );
};
