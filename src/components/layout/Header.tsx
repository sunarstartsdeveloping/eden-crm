import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { UserRole } from '../../types/crm';
import {
  CalendarPlus,
  UserCheck,
  RotateCcw,
  Plus,
  Clock,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  onOpenNewLeadModal: () => void;
  onOpenNewBookingModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewLeadModal, onOpenNewBookingModal }) => {
  const { currentUser, switchRole, resetDemoData } = useCRM();

  const roleLabels: { role: UserRole; label: string }[] = [
    { role: 'owner', label: 'Owner / GM' },
    { role: 'frontdesk', label: 'Front Desk' },
    { role: 'spa', label: 'Spa & Wellness' },
    { role: 'fnb', label: 'F&B Outlets' },
    { role: 'marketing', label: 'Marketing (Aryan)' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-zinc-900 text-white border-b border-zinc-800">
      {/* Top Banner: Location info + Minimal Role Switcher */}
      <div className="px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 border-b border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-200">Eden Wellness & Hospitality</span>
          <span className="text-zinc-600">•</span>
          <span>Salan Gaon, Dehradun & Mussoorie</span>
          <span className="text-zinc-600">•</span>
          <span className="hidden sm:inline text-zinc-400">15 Suites & Residences</span>
        </div>

        {/* Minimal Role Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium text-[11px]">Role View:</span>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-700/60">
            {roleLabels.map(item => {
              const isActive = currentUser.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={`View CRM as ${item.label}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-900 font-bold text-sm tracking-tight">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base sm:text-lg tracking-tight text-white">
                Eden CRM
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Hospitality OS
              </span>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/50">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Thu, 17 Sep 2026</span>
          </div>

          <button
            onClick={resetDemoData}
            title="Reset to fresh demo data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* New Enquiry Button */}
          {(currentUser.role === 'owner' || currentUser.role === 'frontdesk' || currentUser.role === 'marketing') && (
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-900 hover:bg-zinc-100 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Enquiry</span>
            </button>
          )}

          {/* Book Suite Button */}
          {(currentUser.role === 'owner' || currentUser.role === 'frontdesk') && (
            <button
              onClick={onOpenNewBookingModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-xs transition-all"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-zinc-300" />
              <span>Book Suite</span>
            </button>
          )}

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-zinc-700"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-white leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {currentUser.title}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
