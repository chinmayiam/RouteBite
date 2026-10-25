import React from 'react';
import { UserRole } from '../types';
import { User, Store, Shield, Bus } from 'lucide-react';

interface RoleSwitcherBarProps {
  currentRole: UserRole;
  userName: string;
  onSwitchRole: (role: UserRole) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentRole,
  userName,
  onSwitchRole,
}) => {
  return (
    <div className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs py-2 px-4 md:px-8 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
        <span className="font-semibold text-white tracking-wide uppercase text-[11px]">Role Simulation</span>
        <span className="hidden sm:inline text-stone-400">· Active Session:</span>
        <span className="text-amber-400 font-medium">{userName}</span>
      </div>

      <div className="flex items-center gap-1.5 bg-stone-800/80 p-1 rounded-lg border border-stone-700">
        <button
          type="button"
          onClick={() => onSwitchRole('passenger')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-xs font-medium cursor-pointer ${
            currentRole === 'passenger'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Passenger</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchRole('restaurant')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-xs font-medium cursor-pointer ${
            currentRole === 'restaurant'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Restaurant Partner</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchRole('operator')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-xs font-medium cursor-pointer ${
            currentRole === 'operator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>Bus Operator</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchRole('admin')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-xs font-medium cursor-pointer ${
            currentRole === 'admin'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Administrator</span>
        </button>
      </div>
    </div>
  );
};
