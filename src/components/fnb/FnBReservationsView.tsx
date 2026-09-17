import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  UtensilsCrossed,
  Coffee,
  Plus,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BedDouble,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FnBReservationsView: React.FC = () => {
  const {
    serviceBookings,
    createServiceBooking,
    updateServiceBookingStatus,
    guests,
    rooms
  } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<'all' | 'nouveau' | 'nook' | 'private'>('all');

  // Form states
  const [serviceName, setServiceName] = useState('Nouveau Table 5-Course Himalayan Tasting');
  const [guestId, setGuestId] = useState(guests[0]?.id || '');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [date, setDate] = useState('2026-09-17');
  const [timeSlot, setTimeSlot] = useState('08:00 PM - 10:00 PM');
  const [covers, setCovers] = useState(2);
  const [price, setPrice] = useState(4200 * 2);
  const [notes, setNotes] = useState('');

  const fnbBookings = serviceBookings.filter(s => s.category === 'fnb');

  const filteredBookings = selectedOutlet === 'all'
    ? fnbBookings
    : fnbBookings.filter(b => {
        if (selectedOutlet === 'nouveau') return b.serviceName.includes('Nouveau');
        if (selectedOutlet === 'nook') return b.serviceName.includes('Nook');
        if (selectedOutlet === 'private') return b.serviceName.includes('Balcony');
        return true;
      });

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const guest = guests.find(g => g.id === guestId);
    const room = rooms.find(r => r.id === roomId);
    if (!guest) return;

    createServiceBooking({
      guestId: guest.id,
      guestName: guest.name,
      roomId: room?.id,
      roomNumber: room?.number,
      serviceId: `fnb-${Date.now()}`,
      serviceName,
      category: 'fnb',
      date,
      timeSlot,
      staffAssigned: 'Chef Raghavendra Joshi',
      status: 'scheduled',
      price: Number(price),
      notes: `${covers} Covers. ${notes}`
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
              Dining & Outlets
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              Chef Raghavendra Joshi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Nouveau Table, The Nook artisanal café & bakery, and private balcony candlelight dinners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedOutlet}
            onChange={e => setSelectedOutlet(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="all">All Outlets</option>
            <option value="nouveau">Nouveau Table</option>
            <option value="nook">The Nook (Café)</option>
            <option value="private">Balcony Dinners</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Reserve Table</span>
          </button>
        </div>
      </div>

      {/* Outlets Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-zinc-500" />
              <span>Nouveau Table</span>
            </h4>
            <span className="text-[10px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
              7 AM - 11 PM
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Multi-cuisine dining blending seasonal Garhwali slow-cooking with Mediterranean luxury. 32 covers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-zinc-500" />
              <span>The Nook & Bakery</span>
            </h4>
            <span className="text-[10px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
              8 AM - 9 PM
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Artisanal bakery, sourdough boules, single-estate mountain teas, and specialty pour-overs.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-zinc-500" />
              <span>Private Balcony Dining</span>
            </h4>
            <span className="text-[10px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
              Pre-booked
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Personal butler & customized 4-course candlelight dinner on private suite terrace.
          </p>
        </div>
      </div>

      {/* Reservations Table / Feed */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Reserved Covers & Dietary Alerts
            </h3>
            <p className="text-xs text-zinc-500">
              Kitchen prep sheet & guest seating times
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-zinc-50 rounded-full border border-zinc-200 text-zinc-700">
            {filteredBookings.length} Table Reservations
          </span>
        </div>

        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 italic bg-zinc-50 rounded-lg">
              No dining reservations found for selected filter.
            </div>
          ) : (
            filteredBookings.map(b => {
              const guest = guests.find(g => g.id === b.guestId);

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                        {b.serviceName}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900">
                        {b.timeSlot}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500 font-medium">
                        {formatDate(b.date)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                      <span className="font-medium text-zinc-900 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        {b.guestName}
                      </span>
                      {b.roomNumber ? (
                        <span className="flex items-center gap-1 text-zinc-500">
                          <BedDouble className="w-3.5 h-3.5 text-zinc-400" />
                          Suite {b.roomNumber}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Walk-in Non-resident</span>
                      )}
                    </div>

                    {/* Dietary Warning Box */}
                    {guest?.preferences?.dietary && (
                      <div className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-medium">Dietary Note:</span>
                        <span>{guest.preferences.dietary}</span>
                      </div>
                    )}

                    {b.notes && (
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-md">
                        {b.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0">
                    <span className="font-semibold text-sm text-zinc-900">
                      {formatCurrency(b.price)}
                    </span>
                    {b.status === 'scheduled' && (
                      <button
                        onClick={() => updateServiceBookingStatus(b.id, 'completed')}
                        className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Seated / Done</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full border border-zinc-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Reserve Table Cover</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Kitchen cover reservation and seating</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Outlet & Experience</label>
                <select
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="Nouveau Table 5-Course Himalayan Tasting">
                    Nouveau Table 5-Course Himalayan Tasting (₹4,200/cover)
                  </option>
                  <option value="The Nook Artisanal High Tea for Two">
                    The Nook Artisanal High Tea (₹2,400)
                  </option>
                  <option value="Private Candlelight Balcony Dinner">
                    Private Candlelight Balcony Dinner (₹8,500)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Guest Profile</label>
                  <select
                    value={guestId}
                    onChange={e => setGuestId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    {guests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Room / Suite</label>
                  <select
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="">Non-resident</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.number} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    placeholder="08:00 PM"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Covers</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={covers}
                    onChange={e => setCovers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-1">Total Bill (INR)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-1">Kitchen & Seating Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Window table facing Doon valley, anniversary dessert..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs transition-colors"
                >
                  Confirm Table Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
