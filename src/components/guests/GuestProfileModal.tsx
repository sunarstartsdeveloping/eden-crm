import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Guest } from '../../types/crm';
import {
  X,
  BedDouble,
  MessageSquare,
  Edit2,
  Save
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onNavigateToBooking?: () => void;
}

export const GuestProfileModal: React.FC<GuestProfileModalProps> = ({
  isOpen,
  onClose,
  guest
}) => {
  const { bookings, serviceBookings, updateGuest } = useCRM();

  const [activeTab, setActiveTab] = useState<'overview' | 'stays' | 'wellness' | 'preferences'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Form states for editing preferences
  const [dietary, setDietary] = useState(guest?.preferences?.dietary || '');
  const [roomPref, setRoomPref] = useState(guest?.preferences?.roomPreference || '');
  const [allergies, setAllergies] = useState(guest?.preferences?.allergies || '');
  const [specialNotes, setSpecialNotes] = useState(guest?.preferences?.specialNotes || '');
  const [idType] = useState(guest?.idProofType || 'Aadhaar Card');
  const [idNum] = useState(guest?.idProofNumber || '');

  if (!isOpen || !guest) return null;

  // Stays linked to this guest
  const guestBookings = bookings.filter(b => b.guestId === guest.id);
  const guestServices = serviceBookings.filter(s => s.guestId === guest.id);

  const handleSavePreferences = () => {
    updateGuest(guest.id, {
      idProofType: idType,
      idProofNumber: idNum,
      preferences: {
        dietary,
        roomPreference: roomPref,
        allergies,
        specialNotes
      }
    });
    setIsEditing(false);
  };

  const isVip = guest.tags.includes('VIP') || guest.totalSpend > 150000;
  const isRepeat = guest.totalStays >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-zinc-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={
                guest.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  guest.name
                )}&background=18181b&color=ffffff`
              }
              alt={guest.name}
              className="w-14 h-14 rounded-full object-cover border border-zinc-200"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-zinc-900">{guest.name}</h3>
                {isVip && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                    VIP Guest
                  </span>
                )}
                {isRepeat && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {guest.totalStays} Stays
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2">
                <span>{guest.city || 'India'}</span>
                <span>•</span>
                <span>Member since {formatDate(guest.createdAt)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Overview & Stays ({guestBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Preferences & Dossier
            </button>
            <button
              onClick={() => setActiveTab('wellness')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'wellness'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Spa & Dining History ({guestServices.length})
            </button>
          </div>

          <a
            href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                    Lifetime Spend
                  </span>
                  <span className="text-lg font-semibold text-zinc-900 mt-1 block">
                    {formatCurrency(guest.totalSpend)}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                    Total Visits
                  </span>
                  <span className="text-lg font-semibold text-zinc-900 mt-1 block">
                    {guest.totalStays} Retreats
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                    Compliance Status
                  </span>
                  <span className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded inline-block mt-1">
                    ID Verified ({guest.idProofType || 'Aadhaar'})
                  </span>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="p-4 rounded-lg bg-white border border-zinc-200 space-y-2 text-xs">
                <h4 className="font-semibold text-zinc-900">
                  Residency & Verification
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-zinc-500 block">Phone Number:</span>
                    <span className="font-medium text-zinc-900">{guest.phone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Email Address:</span>
                    <span className="font-medium text-zinc-900">{guest.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">City / Region:</span>
                    <span className="font-medium text-zinc-900">
                      {guest.city ? `${guest.city}, ${guest.state || ''}` : 'India'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">ID Proof Number:</span>
                    <span className="font-mono font-medium text-zinc-900">
                      {guest.idProofNumber || 'XXXX-XXXX-4921'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stay History List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-zinc-900 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-zinc-500" />
                  <span>Stay History</span>
                </h4>

                {guestBookings.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded-lg">
                    No reservations linked yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {guestBookings.map(b => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs hover:border-zinc-300 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-zinc-900">
                            {b.roomName} (Room {b.roomNumber})
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {formatDate(b.checkIn)} to {formatDate(b.checkOut)} • {b.numGuests} Guests
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-zinc-900 text-sm">
                            {formatCurrency(b.totalAmount)}
                          </span>
                          <div>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                b.status === 'checked_in'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : b.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              {b.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900">
                    Preferences & Special Care Notes
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Accessible to culinary and wellness teams
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSavePreferences}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                      Dietary Preferences
                    </span>
                    <p className="font-medium text-zinc-900">
                      {guest.preferences?.dietary || 'Standard luxury breakfast menu'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                      Room & Bedding Preferences
                    </span>
                    <p className="font-medium text-zinc-900">
                      {guest.preferences?.roomPreference || 'High floor valley view'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                      Allergy & Medical Alerts
                    </span>
                    <p className="font-medium text-zinc-900">
                      {guest.preferences?.allergies || 'No known allergies reported.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-[10px] uppercase font-medium text-zinc-500 block">
                      Special Notes
                    </span>
                    <p className="font-medium text-zinc-900">
                      {guest.preferences?.specialNotes || 'Prefers early morning herbal tea.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">
                      Dietary Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={dietary}
                      onChange={e => setDietary(e.target.value)}
                      placeholder="e.g. Vegetarian, Gluten-free"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">
                      Room Preferences
                    </label>
                    <textarea
                      rows={2}
                      value={roomPref}
                      onChange={e => setRoomPref(e.target.value)}
                      placeholder="e.g. Top floor, extra pillows"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">
                      Allergies & Sensitivities
                    </label>
                    <textarea
                      rows={2}
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      placeholder="e.g. Sensitive to lavender oil"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">
                      Personal Notes
                    </label>
                    <textarea
                      rows={2}
                      value={specialNotes}
                      onChange={e => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Anniversary celebration"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wellness' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-zinc-900">
                Spa & Dining Appointments
              </h4>

              {guestServices.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded-lg">
                  No appointments recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {guestServices.map(s => (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-zinc-900">
                          {s.serviceName}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {formatDate(s.date)} • {s.timeSlot} • Staff: {s.staffAssigned}
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-900">
                        {formatCurrency(s.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
