import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadSource, LeadStage } from '../../types/crm';
import { X, User, Phone, Mail, Calendar, Home, DollarSign, Tag, FileText } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, leadToEdit }) => {
  const { addLead, updateLead, rooms, staffList, currentUser } = useCRM();

  const [name, setName] = useState(leadToEdit?.name || '');
  const [phone, setPhone] = useState(leadToEdit?.phone || '+91 ');
  const [email, setEmail] = useState(leadToEdit?.email || '');
  const [source, setSource] = useState<LeadSource>(leadToEdit?.source || 'instagram');
  const [stage, setStage] = useState<LeadStage>(leadToEdit?.stage || 'new');
  const [assignedTo, setAssignedTo] = useState(leadToEdit?.assignedTo || currentUser.name);
  const [preferredCheckIn, setPreferredCheckIn] = useState(leadToEdit?.preferredCheckIn || '2026-09-25');
  const [preferredCheckOut, setPreferredCheckOut] = useState(leadToEdit?.preferredCheckOut || '2026-09-28');
  const [numGuests, setNumGuests] = useState(leadToEdit?.numGuests || 2);
  const [roomTypeInterested, setRoomTypeInterested] = useState(leadToEdit?.roomTypeInterested || 'Cedar Forest Villa');
  const [budget, setBudget] = useState(leadToEdit?.budget ? leadToEdit.budget.toString() : '65000');
  const [notes, setNotes] = useState(leadToEdit?.notes || '');
  const [tagsInput, setTagsInput] = useState(leadToEdit?.tags ? leadToEdit.tags.join(', ') : 'High Intent, Himalayan View');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter guest name and contact phone number.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (leadToEdit) {
      updateLead(leadToEdit.id, {
        name,
        phone,
        email,
        source,
        stage,
        assignedTo,
        preferredCheckIn,
        preferredCheckOut,
        numGuests: Number(numGuests),
        roomTypeInterested,
        budget: Number(budget) || 0,
        notes,
        tags
      });
    } else {
      addLead({
        name,
        phone,
        email,
        source,
        stage,
        assignedTo,
        preferredCheckIn,
        preferredCheckOut,
        numGuests: Number(numGuests),
        roomTypeInterested,
        budget: Number(budget) || 0,
        notes,
        tags
      });
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
              {leadToEdit ? 'Edit Guest Enquiry' : 'Log New Guest Enquiry'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Record guest details, dates, and stay requirements
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
          {/* Guest Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" /> Guest / Party Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram & Ritu Malhotra"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" /> Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98110 00000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Email & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" /> Email Address
              </label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Acquisition Channel
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as LeadSource)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              >
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp Direct</option>
                <option value="google">Google Search / Ads</option>
                <option value="agoda">Agoda OTA</option>
                <option value="hotels_com">Hotels.com</option>
                <option value="walkin">Walk-in</option>
                <option value="referral">Referral</option>
                <option value="website">Eden Website</option>
              </select>
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Preferred Check-in
              </label>
              <input
                type="date"
                value={preferredCheckIn}
                onChange={e => setPreferredCheckIn(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Preferred Check-out
              </label>
              <input
                type="date"
                value={preferredCheckOut}
                onChange={e => setPreferredCheckOut(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numGuests}
                onChange={e => setNumGuests(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Room Interested & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <Home className="w-3.5 h-3.5 text-zinc-400" /> Suite / Residence
              </label>
              <select
                value={roomTypeInterested}
                onChange={e => setRoomTypeInterested(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> Estimated Budget (INR)
              </label>
              <input
                type="number"
                placeholder="65000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Assigned Staff & Initial Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Assigned Team Member
              </label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.title})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as LeadStage)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
              >
                <option value="new">New Enquiry</option>
                <option value="contacted">Contacted</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="negotiating">Negotiating</option>
                <option value="confirmed">Confirmed / Won</option>
                <option value="lost">Lost / Closed</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" /> Tags (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. High Intent, Himalayan View, Anniversary"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors"
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" /> Notes & Requirements
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Vegetarian meal preferences, quiet valley suite requested..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 transition-colors resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition-colors"
            >
              {leadToEdit ? 'Save Changes' : 'Create Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
