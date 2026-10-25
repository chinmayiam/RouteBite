import React from 'react';
import { Shield, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-lg font-bold text-white">
              <span className="text-orange-500">Route</span>
              <span>Bite</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Karnataka’s premier highway bus meal pre-ordering network. Authentic food from vetted highway restaurants, delivered piping-hot to your bus stop.
            </p>
            <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% FSSAI-Licensed Highway Kitchens</span>
            </div>
          </div>

          {/* Supported Corridors */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Karnataka Corridors</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>Bengaluru — Mysuru Expressway (NH 275)</li>
              <li>Bengaluru — Mangaluru via Hassan (NH 75)</li>
              <li>Bengaluru — Hubballi Golden Quad (NH 48)</li>
              <li>Mangaluru — Udupi — Goa Coast (NH 66)</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform</h4>
            <div className="flex flex-col space-y-1.5 text-xs">
              <button
                onClick={() => onNavigate('explore')}
                className="text-left text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Find Restaurants & Menu
              </button>
              <button
                onClick={() => onNavigate('how-it-works')}
                className="text-left text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                How Highway Delivery Works
              </button>
              <button
                onClick={() => onNavigate('routes')}
                className="text-left text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Supported Bus Stops
              </button>
              <button
                onClick={() => onNavigate('safety')}
                className="text-left text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Packaging & Hygiene Standards
              </button>
            </div>
          </div>

          {/* Operational Support & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">24x7 Transit Helpdesk</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Transit Support: 1800-419-BITE (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>support@routebite.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>MG Road, Bengaluru, Karnataka 560001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Regulatory Notice */}
        <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} RouteBite Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="text-[11px] max-w-xl text-center md:text-right">
            Independent food delivery aggregator. Schedules and stop locations are integrated via participating private operators and official public timetables.
          </p>
        </div>
      </div>
    </footer>
  );
};
