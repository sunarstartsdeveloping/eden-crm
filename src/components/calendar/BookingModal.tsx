import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Booking, BookingStatus, LeadSource, PaymentStatus } from '../../types/crm';
import {
  X,
  User,
  Calendar,
  Home,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Trash2
} from 'lucide-react';
import { formatCurrency, calculateNights } from '../../utils/formatters';
import { checkRoomAvailability } from '../../utils/availability';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingToEdit?: Booking | null;
  prefillRoomId?: string;
  prefillDate?: string;
  onNavigateToQuote?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingToEdit,
  prefillRoomId,
  prefillDate,
  onNavigateToQuote
}) => {
  const {
    rooms,
    guests,
    addGuest,
    bookings,
    createBooking,
    updateBookingStatus,
    cancelBooking
  } = useCRM();

  const [selectedGuestId, setSelectedGuestId] = useState<string>(
    bookingToEdit?.guestId || (guests[0]?.id || '')
  );
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('+91 ');
  const [newGuestEmail, setNewGuestEmail] = useState('');

  const [roomId, setRoomId] = useState<string>(
    bookingToEdit?.roomId || prefillRoomId || (rooms[0]?.id || '')
  );

  const initialCheckIn = bookingToEdit?.checkIn || prefillDate || '2026-09-22';
  const initialCheckOut = bookingToEdit?.checkOut || '2026-09-25';

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [numGuests, setNumGuests] = useState<number>(bookingToEdit?.numGuests || 2);
  const [status, setStatus] = useState<BookingStatus>(bookingToEdit?.status || 'confirmed');
  const [source, setSource] = useState<LeadSource>(bookingToEdit?.source || 'website');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    bookingToEdit?.paymentStatus || 'advance_paid'
  );

  const activeRoom = rooms.find(r => r.id === roomId) || rooms[0];
  const [ratePerNight, setRatePerNight] = useState<number>(
    bookingToEdit?.ratePerNight || activeRoom?.baseRate || 20000
  );
  const [advanceAmount, setAdvanceAmount] = useState<number>(
    bookingToEdit?.advanceAmount || Math.round((activeRoom?.baseRate || 20000) * 1.5)
  );
  const [notes, setNotes] = useState<string>(bookingToEdit?.notes || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (bookingToEdit) {
      setSelectedGuestId(bookingToEdit.guestId);
      setRoomId(bookingToEdit.roomId);
      setCheckIn(bookingToEdit.checkIn);
      setCheckOut(bookingToEdit.checkOut);
      setNumGuests(bookingToEdit.numGuests);
      setStatus(bookingToEdit.status);
      setSource(bookingToEdit.source);
      setPaymentStatus(bookingToEdit.paymentStatus);
      setRatePerNight(bookingToEdit.ratePerNight);
      setAdvanceAmount(bookingToEdit.advanceAmount);
      setNotes(bookingToEdit.notes || '');
    } else if (prefillRoomId) {
      setRoomId(prefillRoomId);
      const r = rooms.find(room => room.id === prefillRoomId);
      if (r) setRatePerNight(r.baseRate);
    }
  }, [bookingToEdit, prefillRoomId]);

  if (!isOpen) return null;

  const nights = calculateNights(checkIn, checkOut);
  const roomSubtotal = nights * ratePerNight;
  const gst = Math.round(roomSubtotal * 0.12);
  const totalAmount = roomSubtotal + gst;

  // Conflict check (exclude current booking if editing)
  const conflict = checkRoomAvailability(
    roomId,
    checkIn,
    checkOut,
    bookings,
    bookingToEdit?.id
  );

  const handleRoomChange = (newId: string) => {
    setRoomId(newId);
    const r = rooms.find(room => room.id === newId);
    if (r) {
      setRatePerNight(r.baseRate);
      setAdvanceAmount(Math.round(r.baseRate * nights * 0.5));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let guestName = '';
    let guestPhone = '';
    let guestId = selectedGuestId;

    if (isNewGuest) {
      if (!newGuestName.trim() || !newGuestPhone.trim()) {
        setErrorMessage('Please enter new guest name and contact phone.');
        return;
      }
      const created = addGuest({
        name: newGuestName,
        phone: newGuestPhone,
        email: newGuestEmail,
        tags: ['New Guest'],
        preferences: { specialNotes: notes }
      });
      guestId = created.id;
      guestName = created.name;
      guestPhone = created.phone;
    } else {
      const g = guests.find(guest => guest.id === selectedGuestId);
      if (!g) {
        setErrorMessage('Please select a valid guest profile.');
        return;
      }
      guestName = g.name;
      guestPhone = g.phone;
    }

    if (bookingToEdit) {
      updateBookingStatus(bookingToEdit.id, status);
      onClose();
      return;
    }

    const result = createBooking({
      guestId,
      guestName,
      guestPhone,
      roomId,
      roomNumber: activeRoom.number,
      roomName: activeRoom.name,
      checkIn,
      checkOut,
      numGuests,
      status,
      ratePerNight,
      totalAmount,
      advanceAmount,
      source,
      paymentStatus,
      notes,
      addOns: []
    });

    if (!result.success) {
      setErrorMessage(result.message || 'Could not create booking.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-xl w-full border border-zinc-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {bookingToEdit ? 'Reservation Details' : 'New Suite Reservation'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live inventory collision verification active
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Conflict Alert */}
          {conflict.hasConflict && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Booking Conflict:</span>
                <p className="mt-0.5 text-rose-700">{conflict.message}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
              {errorMessage}
            </div>
          )}

          {/* Guest Selector */}
          {!bookingToEdit && (
            <div className="space-y-2 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" /> Guest Profile
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewGuest(!isNewGuest)}
                  className="text-zinc-900 font-medium hover:underline text-[11px]"
                >
                  {isNewGuest ? 'Select Existing Guest' : '+ New Guest'}
                </button>
              </div>

              {!isNewGuest ? (
                <select
                  value={selectedGuestId}
                  onChange={e => setSelectedGuestId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                >
                  {guests.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.phone}) • {g.totalStays} Stays
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Guest Name"
                    value={newGuestName}
                    onChange={e => setNewGuestName(e.target.value)}
                    className="text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phone"
                    value={newGuestPhone}
                    onChange={e => setNewGuestPhone(e.target.value)}
                    className="text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newGuestEmail}
                    onChange={e => setNewGuestEmail(e.target.value)}
                    className="text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              )}
            </div>
          )}

          {bookingToEdit && (
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">
                  Guest Name
                </span>
                <div className="font-semibold text-zinc-900">
                  {bookingToEdit.guestName}
                </div>
                <div className="text-zinc-500 text-[11px]">{bookingToEdit.guestPhone}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-medium">
                  Booking ID
                </span>
                <div className="font-mono text-xs font-medium text-zinc-700">
                  {bookingToEdit.id}
                </div>
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div>
            <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
              <Home className="w-3.5 h-3.5 text-zinc-400" /> Suite / Residence
            </label>
            <select
              value={roomId}
              onChange={e => handleRoomChange(e.target.value)}
              disabled={!!bookingToEdit}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.number} - {r.name} ({r.category}) • Base: {formatCurrency(r.baseRate)}
                </option>
              ))}
            </select>
          </div>

          {/* Dates & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Check-in
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                disabled={!!bookingToEdit}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Check-out
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                disabled={!!bookingToEdit}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Guests
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={numGuests}
                onChange={e => setNumGuests(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Status & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Booking Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BookingStatus)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              >
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="tentative">Tentative / Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              >
                <option value="paid">Fully Paid</option>
                <option value="advance_paid">Deposit Paid</option>
                <option value="pending">Payment Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Pricing Folio Box */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-600">
              <span>Rate per Night:</span>
              <div className="flex items-center gap-1 font-medium">
                <span>₹</span>
                <input
                  type="number"
                  value={ratePerNight}
                  onChange={e => setRatePerNight(Number(e.target.value))}
                  disabled={!!bookingToEdit}
                  className="w-24 text-right px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-900 font-medium"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span>Duration:</span>
              <span className="font-medium text-zinc-900">{nights} Nights</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span>GST (12% Hospitality):</span>
              <span>{formatCurrency(gst)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex items-center justify-between font-semibold text-zinc-900 text-sm">
              <span>Total Stay Amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex items-center justify-between">
              <span className="font-medium text-zinc-700">Advance Deposit Paid:</span>
              <input
                type="number"
                value={advanceAmount}
                onChange={e => setAdvanceAmount(Number(e.target.value))}
                className="w-28 text-right px-2 py-1 rounded border border-zinc-200 font-medium text-xs bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1.5">
              Special Requests & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Vegetarian breakfast, airport pickup, anniversary cake..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            {bookingToEdit ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Cancel this booking?')) {
                      cancelBooking(bookingToEdit.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>
                {onNavigateToQuote && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToQuote(bookingToEdit);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 rounded-lg text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>View Folio / Quote</span>
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={conflict.hasConflict}
                className={`px-4 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1.5 transition-colors shadow-xs ${
                  conflict.hasConflict
                    ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{bookingToEdit ? 'Save Changes' : 'Confirm Reservation'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
