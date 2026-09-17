import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadStage, InteractionChannel } from '../../types/crm';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  IndianRupee,
  Clock,
  Plus,
  Send,
  Trash2,
  Edit,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onOpenConvertModal: (lead: Lead) => void;
  onOpenEditModal: (lead: Lead) => void;
  onNavigateToQuote: (lead: Lead) => void;
}

export const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  lead,
  onClose,
  onOpenConvertModal,
  onOpenEditModal,
  onNavigateToQuote
}) => {
  const { interactions, addInteraction, deleteLead, updateLeadStage, currentUser } = useCRM();

  const [touchChannel, setTouchChannel] = useState<InteractionChannel>('whatsapp');
  const [touchSummary, setTouchSummary] = useState('');
  const [touchNotes, setTouchNotes] = useState('');

  if (!lead) return null;

  // Interactions associated with this lead
  const leadInteractions = interactions.filter(
    i => i.entityType === 'lead' && i.entityId === lead.id
  );

  const handleAddTouchpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touchSummary.trim()) return;

    addInteraction({
      entityType: 'lead',
      entityId: lead.id,
      channel: touchChannel,
      summary: touchSummary,
      notes: touchNotes,
      staffName: currentUser.name
    });

    setTouchSummary('');
    setTouchNotes('');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete enquiry from ${lead.name}?`)) {
      deleteLead(lead.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                {lead.source.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500">
                Logged {formatDate(lead.createdAt)}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900">{lead.name}</h3>
            <p className="text-xs text-zinc-500">
              {lead.numGuests} Guests • Interested in {lead.roomTypeInterested}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenEditModal(lead)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Edit Enquiry"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Enquiry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-zinc-50 p-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
          {/* Quick contact buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${lead.phone}`}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToQuote(lead)}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <span>Create Quote</span>
            </button>
            <button
              onClick={() => onOpenConvertModal(lead)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Convert to Booking</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stage selector */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
            <span className="text-xs font-medium text-zinc-700">Pipeline Stage:</span>
            <select
              value={lead.stage}
              onChange={e => updateLeadStage(lead.id, e.target.value as LeadStage)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
            >
              <option value="new">New Enquiry</option>
              <option value="contacted">Contacted</option>
              <option value="quote_sent">Quote Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="confirmed">Confirmed / Won</option>
              <option value="lost">Lost / Closed</option>
            </select>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-white border border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium">
                Preferred Dates
              </span>
              <div className="font-medium text-zinc-900 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatDate(lead.preferredCheckIn)} – {formatDate(lead.preferredCheckOut)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium">
                Estimated Budget
              </span>
              <div className="font-medium text-zinc-900 mt-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatCurrency(lead.budget)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium">
                Phone Number
              </span>
              <span className="font-medium text-zinc-900 mt-1 block">
                {lead.phone}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium">
                Assigned Team Member
              </span>
              <span className="font-medium text-zinc-900 mt-1 block">
                {lead.assignedTo}
              </span>
            </div>
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" /> Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirement Notes */}
          {lead.notes && (
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Enquiry Notes
              </span>
              <p className="text-xs text-zinc-700 leading-relaxed">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Log Touchpoint Form */}
          <div className="border-t border-zinc-200 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-zinc-400" /> Log Touchpoint
            </h4>
            <form onSubmit={handleAddTouchpoint} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <select
                  value={touchChannel}
                  onChange={e => setTouchChannel(e.target.value as InteractionChannel)}
                  className="text-xs px-2.5 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="call">Call</option>
                  <option value="instagram">Instagram DM</option>
                  <option value="email">Email</option>
                  <option value="in_person">In-Person</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="Summary (e.g. Sent room photos & price quote)"
                  value={touchSummary}
                  onChange={e => setTouchSummary(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Additional notes or guest reply..."
                value={touchNotes}
                onChange={e => setTouchNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Log Touchpoint</span>
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline */}
          <div className="border-t border-zinc-200 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" /> Activity Timeline
            </h4>

            {leadInteractions.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                No touchpoints logged yet.
              </p>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
                {leadInteractions.map(int => (
                  <div key={int.id} className="relative pl-6 space-y-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 absolute left-1 top-1.5 border border-white" />
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-semibold uppercase tracking-wider text-zinc-700">
                        {int.channel} • {int.staffName}
                      </span>
                      <span>{formatDateTime(int.timestamp)}</span>
                    </div>
                    <div className="text-xs font-medium text-zinc-900">
                      {int.summary}
                    </div>
                    {int.notes && (
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-md">
                        {int.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
