import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  Users,
  Activity,
  UtensilsCrossed,
  MessageSquare,
  FileText,
  BarChart3,
  CheckSquare,
  ShieldAlert
} from 'lucide-react';
import { getDaysInactive } from '../../utils/formatters';

export type NavView =
  | 'dashboard'
  | 'leads'
  | 'calendar'
  | 'guests'
  | 'wellness'
  | 'fnb'
  | 'communication'
  | 'quotes'
  | 'reports'
  | 'tasks';

interface SidebarProps {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { currentUser, leads, bookings, tasks } = useCRM();

  // Inactive leads count (> 2 days without touch)
  const inactiveLeadsCount = leads.filter(
    l => l.stage !== 'confirmed' && l.stage !== 'lost' && getDaysInactive(l.lastContactedAt) >= 2
  ).length;

  // Active bookings count
  const activeBookingsCount = bookings.filter(
    b => b.status === 'confirmed' || b.status === 'checked_in'
  ).length;

  // Incomplete tasks count
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  interface NavItem {
    id: NavView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    allowedRoles: string[];
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      allowedRoles: ['owner', 'frontdesk', 'spa', 'fnb', 'marketing'],
    },
    {
      id: 'leads',
      label: 'Lead Pipeline',
      icon: Kanban,
      allowedRoles: ['owner', 'frontdesk', 'marketing'],
      badge: inactiveLeadsCount > 0 ? inactiveLeadsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'calendar',
      label: 'Room Calendar',
      icon: CalendarDays,
      allowedRoles: ['owner', 'frontdesk'],
      badge: activeBookingsCount,
      badgeColor: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    },
    {
      id: 'guests',
      label: 'Guest Directory',
      icon: Users,
      allowedRoles: ['owner', 'frontdesk', 'marketing'],
    },
    {
      id: 'wellness',
      label: 'Spa & Wellness',
      icon: Activity,
      allowedRoles: ['owner', 'frontdesk', 'spa'],
    },
    {
      id: 'fnb',
      label: 'Dining & Outlets',
      icon: UtensilsCrossed,
      allowedRoles: ['owner', 'frontdesk', 'fnb'],
    },
    {
      id: 'communication',
      label: 'WhatsApp Hub',
      icon: MessageSquare,
      allowedRoles: ['owner', 'frontdesk', 'marketing'],
    },
    {
      id: 'quotes',
      label: 'Quotes & Folios',
      icon: FileText,
      allowedRoles: ['owner', 'frontdesk'],
    },
    {
      id: 'reports',
      label: 'Marketing ROI',
      icon: BarChart3,
      allowedRoles: ['owner', 'marketing'],
    },
    {
      id: 'tasks',
      label: 'Tasks & Reminders',
      icon: CheckSquare,
      allowedRoles: ['owner', 'frontdesk', 'spa', 'fnb', 'marketing'],
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-zinc-900 text-white',
    },
  ];

  const visibleItems = navItems.filter(item =>
    item.allowedRoles.includes(currentUser.role)
  );

  return (
    <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-105px)]">
      <div className="p-3 space-y-0.5">
        <div className="px-3 py-2 text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
          Navigation
        </div>

        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white font-medium shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role info card at bottom */}
      <div className="p-3 m-3 bg-zinc-50 border border-zinc-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="p-1 rounded bg-zinc-200/70 text-zinc-700 mt-0.5">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-900">
              {currentUser.title}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
              {currentUser.role === 'owner' && 'Full administrative authority across all modules.'}
              {currentUser.role === 'frontdesk' && 'Manage enquiries, check-ins, room inventory.'}
              {currentUser.role === 'spa' && 'Manage therapist slots & wellness treatments.'}
              {currentUser.role === 'fnb' && 'Manage Nouveau Table & The Nook dining reservations.'}
              {currentUser.role === 'marketing' && 'Manage lead channels, campaign tags & ROI.'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
