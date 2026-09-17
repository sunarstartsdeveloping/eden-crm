import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Lead } from '../../types/crm';
import {
  X,
  AlertOctagon,
  Calendar,
  Home,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { formatCurrency, calculateNights } from '../../utils/formatters';
import { checkRoomAvailability } from '../../utils/availability';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccessNavigate?: () => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccessNavigate
}) => {
  const { rooms, bookings, convertLeadToBooking } = useCRM();

  // Pick suitable initial room
  const initialRoom = rooms.find(r => r.name === lead?.roomTypeInterested) || rooms[0];

  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoom?.id || rooms[0]?.id);
  const [checkIn, setCheckIn] = useState<string>(lead?.preferredCheckIn || '2026-09-25');
  const [checkOut, setCheckOut] = useState<string>(lead?.preferredCheckOut || '2026-09-28');

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
  const [ratePerNight, setRatePerNight] = useState<number>(selectedRoom?.baseRate || 20000);
  const [advanceAmount, setAdvanceAmount] = useState<number>(Math.round((selectedRoom?.baseRate || 20000) * 0.5));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const nights = calculateNights(checkIn, checkOut);
  const roomSubtotal = nights * ratePerNight;
  const gst = Math.round(roomSubtotal * 0.12);
  const totalAmount = roomSubtotal + gst;

  // Real-time conflict preview
  const conflict = checkRoomAvailability(selectedRoomId, checkIn, checkOut, bookings);

  const handleRoomChange = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    const r = rooms.find(room => room.id === newRoomId);
    if (r) {
      setRatePerNight(r.baseRate);
      setAdvanceAmount(Math.round(r.baseRate * nights * 0.5));
    }
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = convertLeadToBooking(
      lead.id,
      selectedRoomId,
      checkIn,
      checkOut,
      ratePerNight,
      advanceAmount
    );

    if (!result.success) {
      setErrorMessage(result.message || 'Could not convert booking.');
      return;
    }

    onClose();
    if (onSuccessNavigate) {
      onSuccessNavigate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-zinc-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Confirm Reservation</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Converts enquiry into a confirmed stay and reserves room inventory
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
        <form onSubmit={handleConvert} className="p-6 space-y-4">
          {/* Guest Summary Card */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 text-xs flex items-center justify-between">
            <div>
              <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>{lead.name}</span>
              </div>
              <div className="text-zinc-500 mt-0.5">
                {lead.phone} • {lead.numGuests} Guests • Channel: {lead.source.toUpperCase()}
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Ready to Confirm
            </span>
          </div>

          {/* Double-booking conflict warning alert */}
          {conflict.hasConflict && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Room Unavailable:</span>
                <p className="mt-0.5 text-rose-700">{conflict.message}</p>
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  Please select another suite or adjust stay dates.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
              {errorMessage}
            </div>
          )}

          {/* Room Selector */}
          <div>
            <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
              <Home className="w-3.5 h-3.5 text-zinc-400" /> Assign Room / Suite
            </label>
            <select
              value={selectedRoomId}
              onChange={e => handleRoomChange(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.number} - {r.name} ({r.category}) • Base: {formatCurrency(r.baseRate)}/night
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Check-in Date
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Check-out Date
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Pricing Calculation */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-600">
              <span>Rate per Night:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">₹</span>
                <input
                  type="number"
                  value={ratePerNight}
                  onChange={e => setRatePerNight(Number(e.target.value))}
                  className="w-24 text-right px-2 py-1 rounded border border-zinc-200 font-medium text-xs bg-white text-zinc-900"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span>Stay Duration:</span>
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
              <span className="font-medium text-zinc-700">Advance Deposit (INR):</span>
              <input
                type="number"
                value={advanceAmount}
                onChange={e => setAdvanceAmount(Number(e.target.value))}
                className="w-28 text-right px-2 py-1 rounded border border-zinc-200 font-medium text-xs bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
            >
              Cancel
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
              <span>Confirm Reservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
