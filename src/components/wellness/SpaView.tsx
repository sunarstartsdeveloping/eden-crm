import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Service, ServiceBooking, ServiceCategory } from '../../types/crm';
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle2,
  X,
  Tag,
  BedDouble
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SpaView: React.FC = () => {
  const {
    services,
    serviceBookings,
    createServiceBooking,
    updateServiceBookingStatus,
    guests,
    rooms
  } = useCRM();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Modal form states
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedGuestId, setSelectedGuestId] = useState(guests[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [date, setDate] = useState('2026-09-17');
  const [timeSlot, setTimeSlot] = useState('04:30 PM - 05:45 PM');
  const [staffAssigned, setStaffAssigned] = useState('Dr. Ananya Bhatt');
  const [notes, setNotes] = useState('');

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  const spaAndWellnessBookings = serviceBookings.filter(
    sb => sb.category === 'spa' || sb.category === 'wellness' || sb.category === 'salon'
  );

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === selectedServiceId);
    const guest = guests.find(g => g.id === selectedGuestId);
    const room = rooms.find(r => r.id === selectedRoomId);

    if (!service || !guest) return;

    createServiceBooking({
      guestId: guest.id,
      guestName: guest.name,
      roomId: room?.id,
      roomNumber: room?.number,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      date,
      timeSlot,
      staffAssigned,
      status: 'scheduled',
      price: service.price,
      notes
    });

    setIsBookModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
              Spa & Wellness
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              Dr. Ananya Bhatt
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Therapies, Himalayan treatments, yoga sessions, and jacuzzi reservations.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Appointments (2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  Today's Treatment Schedule
                </h3>
                <p className="text-xs text-zinc-500">
                  {spaAndWellnessBookings.length} sessions active or completed
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {spaAndWellnessBookings.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-4 text-center">
                  No appointments booked for today.
                </p>
              ) : (
                spaAndWellnessBookings.map(sb => {
                  const isDone = sb.status === 'completed';
                  return (
                    <div
                      key={sb.id}
                      className={`p-4 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-zinc-50 border-zinc-200 opacity-70'
                          : 'bg-white border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                            {sb.timeSlot}
                          </span>
                          <h4 className="font-semibold text-sm text-zinc-900">
                            {sb.serviceName}
                          </h4>
                        </div>
                        <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-medium text-zinc-800">{sb.guestName}</span>
                          </span>
                          {sb.roomNumber && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Suite {sb.roomNumber}</span>
                            </span>
                          )}
                          <span className="text-zinc-500">
                            Therapist: {sb.staffAssigned}
                          </span>
                        </div>
                        {sb.notes && (
                          <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-md mt-1">
                            {sb.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                        <span className="font-semibold text-sm text-zinc-900">
                          {formatCurrency(sb.price)}
                        </span>
                        {!isDone && (
                          <button
                            onClick={() => updateServiceBookingStatus(sb.id, 'completed')}
                            className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Menu of Treatments & Services */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                Therapy Menu
              </h3>
              <p className="text-xs text-zinc-500">
                Ayurvedic and hydrotherapy experiences
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 border-b border-zinc-200 pb-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'spa', label: 'Ayurveda & Body' },
                { id: 'wellness', label: 'Yoga & Hydro' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    activeCategory === tab.id
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Service List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {filteredServices.map(service => (
                <div
                  key={service.id}
                  className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-1 text-xs hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-zinc-900">
                      {service.name}
                      <span className="text-[10px] text-zinc-500 ml-1.5">
                        ({service.durationMinutes} mins)
                      </span>
                    </div>
                    <span className="font-semibold text-zinc-900">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Book Service Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full border border-zinc-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Book Wellness Experience</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Reserve therapist slot and room charge</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookService} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Select Experience</label>
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes}m) • {formatCurrency(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Guest Profile</label>
                  <select
                    value={selectedGuestId}
                    onChange={e => setSelectedGuestId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    {guests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Suite Charged</label>
                  <select
                    value={selectedRoomId}
                    onChange={e => setSelectedRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="">Non-resident / Walk-in</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.number} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="e.g. 05:00 PM - 06:15 PM"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-1">Therapist Assigned</label>
                <input
                  type="text"
                  value={staffAssigned}
                  onChange={e => setStaffAssigned(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-1">Health Notes / Focus Area</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Lower back focus, cedar aromatherapy"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs transition-colors"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
