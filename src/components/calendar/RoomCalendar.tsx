import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Room, Booking, BookingStatus, RoomStatus } from '../../types/crm';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  BedDouble,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertOctagon,
  Clock,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RoomCalendarProps {
  onOpenNewBookingModal: (prefillRoomId?: string, prefillDate?: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const RoomCalendar: React.FC<RoomCalendarProps> = ({
  onOpenNewBookingModal,
  onSelectBooking
}) => {
  const { rooms, bookings, updateRoomStatus, updateBookingStatus } = useCRM();

  // Timeline starting from 2026-09-14 (around current simulated date 2026-09-17)
  const [startDateStr, setStartDateStr] = useState<string>('2026-09-15');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const daysToShow = 14;

  // Generate date array
  const dateList: { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
  const baseDate = new Date(startDateStr);

  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = dateStr === '2026-09-17';
    dateList.push({
      dateStr,
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday
    });
  }

  const handlePrev = () => {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() - 7);
    setStartDateStr(d.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + 7);
    setStartDateStr(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setStartDateStr('2026-09-15');
  };

  const filteredRooms = selectedCategory === 'all'
    ? rooms
    : rooms.filter(r => r.category === selectedCategory);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'checked_in':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
      case 'confirmed':
        return 'bg-blue-600 text-white border-blue-700 shadow-xs';
      case 'tentative':
        return 'bg-amber-500 text-white border-amber-600 shadow-xs';
      case 'checked_out':
        return 'bg-gray-500 text-white border-gray-600';
      case 'cancelled':
        return 'bg-rose-500 text-white border-rose-600';
      default:
        return 'bg-zinc-900 text-white';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Room Inventory & Visual Calendar
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
              15 Units
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time availability for all suites, cottages & serviced residences with double-booking prevention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-zinc-200 focus:outline-none focus:border-zinc-900 font-medium text-zinc-800"
          >
            <option value="all">All Room Categories</option>
            <option value="Penthouse Villa">Penthouse Villas</option>
            <option value="Valley Suite">Valley Suites</option>
            <option value="Serviced Apartment">Serviced Apartments</option>
            <option value="Wellness Cottage">Wellness Cottages</option>
          </select>

          {/* Date Navigation */}
          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-zinc-100 text-zinc-700"
              title="Previous 7 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 text-xs font-medium text-zinc-900 hover:bg-zinc-100 rounded"
            >
              Current Week
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-zinc-100 text-zinc-700"
              title="Next 7 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onOpenNewBookingModal()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Legend & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-zinc-900 flex items-center gap-1">
            Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-emerald-600" />
            <span>Checked In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-blue-600" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>Tentative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-zinc-400" />
            <span>Checked Out</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Collision detection active
          </span>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Header Row: Dates */}
          <div className="grid grid-cols-[240px_repeat(14,1fr)] bg-zinc-900 text-white border-b border-zinc-800">
            <div className="p-3 font-semibold text-xs text-zinc-200 border-r border-zinc-800 flex items-center gap-2">
              <BedDouble className="w-3.5 h-3.5" />
              <span>Room / Suite</span>
            </div>

            {dateList.map(d => (
              <div
                key={d.dateStr}
                className={`p-2 text-center border-r border-zinc-800 transition-colors ${
                  d.isToday ? 'bg-white text-zinc-900 font-semibold' : 'text-zinc-300'
                }`}
              >
                <div className="text-[10px] font-medium opacity-80">{d.dayName}</div>
                <div className="text-xs font-semibold">{d.dayNum}</div>
                {d.isToday && (
                  <div className="text-[8px] uppercase tracking-wider font-bold mt-0.5">
                    Today
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Room Rows */}
          <div className="divide-y divide-zinc-200">
            {filteredRooms.map(room => {
              // Find bookings for this room that touch our date range
              const roomBookings = bookings.filter(
                b => b.roomId === room.id && b.status !== 'cancelled'
              );

              return (
                <div
                  key={room.id}
                  className="grid grid-cols-[240px_repeat(14,1fr)] hover:bg-zinc-50/60 transition-colors group"
                >
                  {/* Left Room Info Cell */}
                  <div className="p-3 border-r border-zinc-200 bg-zinc-50/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-zinc-900">
                          {room.number} • {room.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {room.category} • Max {room.capacity} Guests
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="font-medium text-zinc-900">
                        {formatCurrency(room.baseRate)}/nt
                      </span>

                      {/* Room Housekeeping Status Selector */}
                      <select
                        value={room.status}
                        onChange={e => updateRoomStatus(room.id, e.target.value as RoomStatus)}
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${
                          room.status === 'clean'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : room.status === 'occupied'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : room.status === 'dirty'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="clean">Clean</option>
                        <option value="occupied">Occupied</option>
                        <option value="dirty">Dirty</option>
                        <option value="maintenance">Maint</option>
                      </select>
                    </div>
                  </div>

                  {/* 14 Date Grid Cells */}
                  {dateList.map(d => {
                    // Check if a booking covers this date: checkIn <= d.dateStr < checkOut
                    const activeBooking = roomBookings.find(
                      b => b.checkIn <= d.dateStr && b.checkOut > d.dateStr
                    );

                    const isCheckInDay = activeBooking && activeBooking.checkIn === d.dateStr;

                    return (
                      <div
                        key={d.dateStr}
                        onClick={() => {
                          if (activeBooking) {
                            onSelectBooking(activeBooking);
                          } else {
                            onOpenNewBookingModal(room.id, d.dateStr);
                          }
                        }}
                        className={`border-r border-zinc-200 relative p-1 min-h-[64px] flex flex-col justify-center cursor-pointer transition-colors ${
                          d.isToday ? 'bg-zinc-100/50' : ''
                        } hover:bg-zinc-100/40`}
                        title={
                          activeBooking
                            ? `${activeBooking.guestName} (${activeBooking.status.toUpperCase()})\n${activeBooking.checkIn} to ${activeBooking.checkOut}`
                            : `Click to book ${room.name} on ${d.dateStr}`
                        }
                      >
                        {activeBooking ? (
                          <div
                            className={`w-full rounded-md p-1.5 text-[10px] leading-tight font-medium border truncate transition-opacity hover:opacity-90 ${getStatusBadge(
                              activeBooking.status
                            )}`}
                          >
                            <div className="truncate font-medium">
                              {isCheckInDay ? 'Check-in: ' : ''}
                              {activeBooking.guestName}
                            </div>
                            <div className="text-[9px] opacity-90 truncate">
                              {activeBooking.numGuests} guests • {formatCurrency(activeBooking.totalAmount)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-eden-emerald font-bold bg-eden-sand px-1.5 py-0.5 rounded border border-eden-border">
                              + Book
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
