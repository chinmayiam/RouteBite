import React, { useState, useMemo } from 'react';
import {
  BusRoute,
  BusStop,
  BusJourney,
  Restaurant,
  MenuItem,
  CartItem,
  Order,
} from '../types';
import {
  Search,
  MapPin,
  Clock,
  Bus,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PassengerFlowProps {
  routes: BusRoute[];
  stops: BusStop[];
  journeys: BusJourney[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem, qty?: number) => void;
  onUpdateCartQty: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onOpenCheckout: (journey: BusJourney, stop: BusStop, restaurant: Restaurant) => void;
  onSelectRouteFilter?: string | null;
}

export const PassengerFlow: React.FC<PassengerFlowProps> = ({
  routes,
  stops,
  journeys,
  restaurants,
  menuItems,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  onOpenCheckout,
  onSelectRouteFilter,
}) => {
  // Journey Search State
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    onSelectRouteFilter || routes[0]?.id || 'route-blr-mys'
  );
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    journeys.find((j) => j.routeId === selectedRouteId)?.id || journeys[0]?.id || ''
  );
  const [selectedStopId, setSelectedStopId] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  // Filters
  const [filterPureVeg, setFilterPureVeg] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState<number>(500);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>('all');

  // Currently selected route and journey
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const routeJourneys = journeys.filter((j) => j.routeId === selectedRouteId);
  const currentJourney =
    routeJourneys.find((j) => j.id === selectedJourneyId) || routeJourneys[0] || journeys[0];

  // Available stops for this route
  const routeStops = stops.filter((s) => s.routeId === selectedRouteId);
  const activeStop = routeStops.find((s) => s.id === selectedStopId) || routeStops[0];

  // Available restaurants for this stop
  const stopRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (r.stopId !== activeStop?.id) return false;
      if (r.approvalStatus !== 'approved') return false;
      if (filterPureVeg && !r.isPureVeg) return false;
      if (selectedCuisine !== 'all' && !r.cuisineTypes.includes(selectedCuisine)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.cuisineTypes.some((c) => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [restaurants, activeStop, filterPureVeg, selectedCuisine, searchQuery]);

  const activeRestaurant =
    stopRestaurants.find((r) => r.id === selectedRestaurantId) || stopRestaurants[0];

  // Menu items for active restaurant
  const filteredMenuItems = useMemo(() => {
    if (!activeRestaurant) return [];
    return menuItems.filter((item) => {
      if (item.restaurantId !== activeRestaurant.id) return false;
      if (filterPureVeg && !item.isVeg) return false;
      if (activeMenuCategory !== 'all' && item.category !== activeMenuCategory) return false;
      if (item.price > maxBudget) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, activeRestaurant, filterPureVeg, activeMenuCategory, maxBudget, searchQuery]);

  // Feasibility Calculation for the active stop
  const feasibility = useMemo(() => {
    if (!currentJourney || !activeStop) return { feasible: true, bufferMinutes: 30 };
    // Simulated arrival calculation
    const [depH, depM] = currentJourney.departureTime.split(':').map(Number);
    const totalMins = depH * 60 + depM + activeStop.scheduledArrivalOffsetMinutes + currentJourney.currentDelayMinutes;
    const arrH = Math.floor(totalMins / 60) % 24;
    const arrM = totalMins % 60;
    const estArrival = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

    // Available preparation buffer
    const maxPrep = activeRestaurant?.maxPrepTimeMinutes || 20;
    const buffer = activeStop.scheduledArrivalOffsetMinutes - maxPrep;

    return {
      feasible: buffer >= 15,
      estimatedArrival: estArrival,
      bufferMinutes: buffer,
      warning:
        buffer < 15
          ? 'Short prep window! Order only quick tiffins to ensure timely packaging.'
          : undefined,
    };
  }, [currentJourney, activeStop, activeRestaurant]);

  // Cart item count for current restaurant
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">
              Karnataka Highway Bus Food Delivery
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Piping-hot meals at your bus halt. Zero lines.
            </h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Pre-order from authentic restaurants at designated highway stops along your journey. Handed right to you at the bus bay with a single-use 4-digit code.
            </p>
          </div>

          {/* Interactive Journey Search Engine */}
          <div className="bg-white rounded-2xl p-5 shadow-2xl text-stone-900 border border-stone-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Route Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  1. Travel Corridor
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    setSelectedRouteId(e.target.value);
                    const matchedJourneys = journeys.filter((j) => j.routeId === e.target.value);
                    if (matchedJourneys.length > 0) setSelectedJourneyId(matchedJourneys[0].id);
                    const matchedStops = stops.filter((s) => s.routeId === e.target.value);
                    if (matchedStops.length > 0) setSelectedStopId(matchedStops[0].id);
                  }}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fromCity} ➔ {r.toCity} ({r.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Bus Operator / Service */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  2. Bus Service / Trip
                </label>
                <select
                  value={currentJourney?.id || ''}
                  onChange={(e) => setSelectedJourneyId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {routeJourneys.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.operatorName.split(' ')[0]} · Dep: {j.departureTime}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designated Stop */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  3. Pickup Stop
                </label>
                <select
                  value={activeStop?.id || ''}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {routeStops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stopName} ({s.stopBreakDurationMinutes}m break)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status / Feasibility pill */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Timing Window
                </label>
                <div className="h-[42px] px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>ETA: <strong className="tabular-nums">{feasibility.estimatedArrival}</strong></span>
                  </div>
                  <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                    +{feasibility.bufferMinutes}m Safe
                  </span>
                </div>
              </div>
            </div>

            {/* Live delay warning notice if any */}
            {currentJourney?.currentDelayMinutes > 0 && (
              <div className="mt-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Operator Notice: {currentJourney.operatorName} reports a +{currentJourney.currentDelayMinutes} min delay. Food preparation will be automatically adjusted for your updated arrival.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content: Stop Plazas & Food Discovery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Stop Selector Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Participating Restaurants at {activeStop?.stopName}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeStop?.landmark} · {activeStop?.stopBreakDurationMinutes} min scheduled halting duration
              </p>
            </div>
            {/* Quick Switch Stop Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              {routeStops.map((stop) => (
                <button
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    stop.id === activeStop?.id
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {stop.stopName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup instruction strip */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Dedicated Pickup Bay Instructions:</span>{' '}
              {activeStop?.pickupBayInstructions}
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pure Veg Toggle */}
            <button
              type="button"
              onClick={() => setFilterPureVeg(!filterPureVeg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                filterPureVeg
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>Pure Veg Only</span>
            </button>

            {/* Cuisine Pills */}
            {['all', 'South Indian', 'Gourmet Thali', 'Biryani & Pulao', 'Snacks & Tiffins'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCuisine(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCuisine === c
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c === 'all' ? 'All Cuisines' : c}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes or restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Restaurant Cards Grid (lead into menus) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stopRestaurants.map((restaurant) => {
            const isSelected = restaurant.id === activeRestaurant?.id;
            return (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurantId(restaurant.id)}
                className={`group bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Photo Header */}
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-white">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-200 mt-0.5">{restaurant.highwayName}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{restaurant.cuisineTypes.join(' · ')}</span>
                    <span className="font-semibold text-stone-900 tabular-nums">
                      ₹{restaurant.avgCostForTwo} for two
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <span className="flex items-center gap-1 text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {restaurant.minPrepTimeMinutes}-{restaurant.maxPrepTimeMinutes} mins prep
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected ? 'Viewing Menu Below' : 'Browse Restaurant Menu'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Restaurant Menu Section */}
        {activeRestaurant && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-stone-900">{activeRestaurant.name} — Menu</h3>
                  {activeRestaurant.isPureVeg && (
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      Pure Vegetarian
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pick-up Counter: {activeRestaurant.pickupCounterDescription}
                </p>
              </div>

              {/* Menu Categories Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  'all',
                  'Quick Bites & Tiffins',
                  'Meals & Thalis',
                  'Biryani & Pulao',
                  'Combos & Boxes',
                  'Beverages & Desserts',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveMenuCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeMenuCategory === cat
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Dishes' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => {
                const inCart = cart.find((c) => c.menuItem.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-stone-50/60 p-4 rounded-xl border border-stone-200 flex flex-col justify-between space-y-3 hover:border-stone-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
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
                          <h4 className="font-bold text-stone-900 text-sm">{item.name}</h4>
                        </div>
                        {item.isBestseller && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded shrink-0">
                            Bestseller
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-stone-900 tabular-nums">
                          ₹{item.price}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {item.prepTimeMinutes}m prep · ₹{item.packagingCharge} eco-box
                        </div>
                      </div>

                      {/* Add / Stepper controls */}
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-stone-900 text-white rounded-lg px-2 py-1 text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.id, -1)}
                            className="p-1 hover:text-orange-400 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold px-1 tabular-nums">{inCart.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.id, 1)}
                            className="p-1 hover:text-orange-400 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item, 1)}
                          className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          + Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Cart Strip (when items exist) */}
        {cartItemCount > 0 && activeRestaurant && (
          <div className="sticky bottom-4 z-30 max-w-2xl mx-auto bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-700 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-orange-600 text-white px-2 py-0.5 rounded-full tabular-nums">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-sm font-semibold">{activeRestaurant.name}</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Pickup Stop: {activeStop.stopName} (Bay counter)
              </p>
            </div>

            <button
              onClick={() => onOpenCheckout(currentJourney, activeStop, activeRestaurant)}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <span>Review Order & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
