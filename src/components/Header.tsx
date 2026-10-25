import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  userRole: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  userRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('explore')}
          className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-orange-600 font-black">Route</span>
          <span>Bite</span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'explore'
                ? 'border-orange-600 text-stone-900 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Find Meals
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'routes'
                ? 'border-orange-600 text-stone-900 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Highway Routes
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'orders'
                ? 'border-orange-600 text-stone-900 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'how-it-works'
                ? 'border-orange-600 text-stone-900 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'safety'
                ? 'border-orange-600 text-stone-900 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            FSSAI Safety
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {userRole !== 'passenger' ? (
            <button
              onClick={() => setActiveTab('portal')}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{userRole === 'restaurant' ? 'Kitchen Portal' : userRole === 'operator' ? 'Operator Portal' : 'Admin Control'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('cart')}
              className="relative px-3.5 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer border border-stone-200"
            >
              <ShoppingBag className="w-4 h-4 text-stone-700" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
