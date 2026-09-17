import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  TrendingUp,
  BedDouble,
  Users,
  Percent,
  Activity,
  UtensilsCrossed,
  PhoneCall,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysInactive } from '../../utils/formatters';
import { exportLeadsCsv, exportBookingsCsv } from '../../utils/exportCsv';

interface DashboardViewProps {
  onNavigate: (view: any) => void;
  onOpenNewLead: () => void;
  onOpenBooking: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewLead,
  onOpenBooking
}) => {
  const { rooms, bookings, leads, guests, serviceBookings, currentUser } = useCRM();

  // Metrics Calculations
  const totalRooms = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRoomsCount / totalRooms) * 100);

  // Revenue (bookings + add-ons)
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.advanceAmount || b.totalAmount), 0);

  // Total room nights booked
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const totalNights = activeBookings.reduce((sum, b) => {
    const start = new Date(b.checkIn).getTime();
    const end = new Date(b.checkOut).getTime();
    return sum + Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, 0);

  const adr = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

  // Lead conversion
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.stage === 'confirmed').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Repeat guest rate
  const totalGuests = guests.length;
  const repeatGuests = guests.filter(g => g.totalStays >= 2).length;
  const repeatRate = totalGuests > 0 ? Math.round((repeatGuests / totalGuests) * 100) : 0;

  // Channel breakdown
  const channelCounts: Record<string, { total: number; confirmed: number }> = {};
  leads.forEach(l => {
    if (!channelCounts[l.source]) {
      channelCounts[l.source] = { total: 0, confirmed: 0 };
    }
    channelCounts[l.source].total += 1;
    if (l.stage === 'confirmed') {
      channelCounts[l.source].confirmed += 1;
    }
  });

  // Leads needing attention (inactive > 2 days)
  const leadsNeedingAttention = leads.filter(
    l => l.stage !== 'confirmed' && l.stage !== 'lost' && getDaysInactive(l.lastContactedAt) >= 2
  );

  // Today's Operations (using simulated today date 2026-09-17)
  const todayStr = '2026-09-17';
  const todayCheckIns = bookings.filter(b => b.checkIn === todayStr);
  const todayCheckOuts = bookings.filter(b => b.checkOut === todayStr);
  const todayServices = serviceBookings.filter(s => s.date === todayStr);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Welcome + Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
              Operations Console
            </span>
            <span className="text-xs text-zinc-400">Thursday, 17 September 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
            Eden Wellness & Hospitality
          </h2>
          <p className="text-xs text-zinc-500 max-w-xl">
            Salan Gaon, Dehradun & Mussoorie. 15 boutique suites, serviced apartments, and guest experiences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewLead}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xs flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>New Enquiry</span>
          </button>
          <button
            onClick={onOpenBooking}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 transition-all flex items-center gap-1.5"
          >
            <BedDouble className="w-3.5 h-3.5 text-zinc-500" />
            <span>Check Availability</span>
          </button>
          <button
            onClick={() => exportBookingsCsv(bookings)}
            className="p-2 rounded-lg text-xs bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 transition-all"
            title="Export Bookings CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Current Occupancy</span>
            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-zinc-900">
              {occupancyRate}%
            </span>
            <span className="text-xs text-zinc-500">
              ({occupiedRoomsCount}/{totalRooms} Rooms)
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: 75% for Autumn</span>
          </div>
        </div>

        {/* Revenue MTD */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Revenue Realized</span>
            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
              <span className="text-xs font-semibold">₹</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-zinc-900">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>ADR: {formatCurrency(adr)}</span>
            <span className="font-medium text-zinc-900">15 Stays</span>
          </div>
        </div>

        {/* Lead Conversion */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Lead Conversion</span>
            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-zinc-900">
              {conversionRate}%
            </span>
            <span className="text-xs text-zinc-500">
              ({convertedLeads}/{totalLeads} won)
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-600 font-medium">
            Top Channel: Instagram
          </div>
        </div>

        {/* Repeat Guest Rate */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Repeat Guest Rate</span>
            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-zinc-900">
              {repeatRate}%
            </span>
            <span className="text-xs text-zinc-500">
              ({repeatGuests} repeat visitors)
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-600 font-medium">
            High loyalty in Delhi & Mumbai
          </div>
        </div>
      </div>

      {/* Inactivity Alert Banner if leads > 2 days idle */}
      {leadsNeedingAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900">
                {leadsNeedingAttention.length} High-Intent Enquiries Need Follow-Up
              </div>
              <p className="text-xs text-amber-800">
                These leads have had no touchpoint in over 48 hours. Don't let valuable bookings slip away!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap shadow-sm transition-colors"
          >
            Review Pipeline →
          </button>
        </div>
      )}

      {/* Two Column Layout: Today's Operations & Lead Source Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Operations Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operations Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  Today's Operational Schedule
                </h3>
                <p className="text-xs text-zinc-500">
                  Arrivals, departures, wellness slots & dining covers for 17 Sep 2026
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md">
                {todayCheckIns.length} In • {todayCheckOuts.length} Out • {todayServices.length} Add-ons
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check-ins & Check-outs */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Front Desk Movements</span>
                </div>

                {todayCheckIns.length === 0 && todayCheckOuts.length === 0 ? (
                  <div className="text-xs text-zinc-400 p-4 bg-zinc-50 rounded-lg text-center">
                    No check-ins or departures scheduled today.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayCheckIns.map(b => (
                      <div
                        key={b.id}
                        className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                              Arrival
                            </span>
                            <span className="text-xs font-semibold text-zinc-900">{b.guestName}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {b.roomName} (Room {b.roomNumber}) • {b.numGuests} Guests
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-800">
                          {formatCurrency(b.totalAmount)}
                        </span>
                      </div>
                    ))}

                    {todayCheckOuts.map(b => (
                      <div
                        key={b.id}
                        className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-700 text-white">
                              Departure
                            </span>
                            <span className="text-xs font-semibold text-zinc-900">{b.guestName}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {b.roomName} (Room {b.roomNumber})
                          </div>
                        </div>
                        <span className="text-xs font-medium text-zinc-500">
                          Inspect Room
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Spa & Dining */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Spa & Dining Covers</span>
                </div>

                {todayServices.length === 0 ? (
                  <div className="text-xs text-zinc-400 p-4 bg-zinc-50 rounded-lg text-center">
                    No add-on bookings scheduled today.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayServices.map(s => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          s.category === 'fnb'
                            ? 'bg-rose-50/40 border-rose-200'
                            : 'bg-teal-50/40 border-teal-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                                s.category === 'fnb'
                                  ? 'bg-rose-700 text-white'
                                  : 'bg-teal-700 text-white'
                              }`}
                            >
                              {s.category === 'fnb' ? 'Dining' : 'Spa'}
                            </span>
                            <span className="text-xs font-semibold text-zinc-900">{s.guestName}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {s.serviceName} • {s.timeSlot}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Host: {s.staffAssigned}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-zinc-900">
                          {formatCurrency(s.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Room Occupancy Matrix */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  Room Inventory Status
                </h3>
                <p className="text-xs text-zinc-500">
                  15 boutique units in Salan Gaon
                </p>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-zinc-900 font-medium hover:underline flex items-center gap-1"
              >
                Open Full Calendar <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
              {rooms.map(room => {
                const isOccupied = room.status === 'occupied';
                const isDirty = room.status === 'dirty';
                const isMaint = room.status === 'maintenance';

                return (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isOccupied
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                        : isDirty
                        ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                        : isMaint
                        ? 'bg-rose-50/60 border-rose-300 text-rose-950'
                        : 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900'
                    }`}
                  >
                    <div className="text-sm font-semibold">{room.number}</div>
                    <div className="text-[10px] truncate text-zinc-500 mt-0.5">
                      {room.name}
                    </div>
                    <div className="mt-1.5">
                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                          isOccupied
                            ? 'bg-emerald-700 text-white'
                            : isDirty
                            ? 'bg-amber-600 text-white'
                            : isMaint
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Lead Source Attribution & Marketing Insights */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  Lead Source Attribution
                </h3>
                <p className="text-xs text-zinc-500">
                  Performance across acquisition channels
                </p>
              </div>
              <button
                onClick={() => exportLeadsCsv(leads)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                title="Export Leads CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(channelCounts)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([source, stats]) => {
                  const percent = Math.round((stats.total / totalLeads) * 100);
                  const winRate =
                    stats.total > 0
                      ? Math.round((stats.confirmed / stats.total) * 100)
                      : 0;

                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize text-zinc-900">
                          {source === 'instagram' && 'Instagram'}
                          {source === 'whatsapp' && 'WhatsApp'}
                          {source === 'google' && 'Google Ads'}
                          {source === 'agoda' && 'Agoda'}
                          {source === 'hotels_com' && 'Hotels.com'}
                          {source === 'walkin' && 'Walk-in'}
                          {source === 'referral' && 'Referral'}
                          {source === 'website' && 'Direct Website'}
                        </span>
                        <div className="text-[11px] text-zinc-500">
                          <span className="font-medium text-zinc-900">{stats.total} leads</span>
                          <span className="mx-1.5">•</span>
                          <span className="text-emerald-700 font-medium">{winRate}% won</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-zinc-900 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
              <div className="font-medium text-zinc-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                <span>Growth Note:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Instagram reels featuring the private plunge pool & infinity jacuzzi yield 48% higher conversion into high-budget stays.
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
            <h4 className="font-semibold text-zinc-900 text-sm">
              Quick Shortcuts
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('quotes')}
                className="w-full text-left px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-900 flex items-center justify-between transition-all"
              >
                <span>Generate Official PDF Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <button
                onClick={() => onNavigate('communication')}
                className="w-full text-left px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-900 flex items-center justify-between transition-all"
              >
                <span>Launch WhatsApp Quick Response</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <button
                onClick={() => onNavigate('wellness')}
                className="w-full text-left px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-900 flex items-center justify-between transition-all"
              >
                <span>Book Spa / Yoga Therapy Slot</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
