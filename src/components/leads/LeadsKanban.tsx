import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadStage, LeadSource } from '../../types/crm';
import {
  Search,
  Filter,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  Plus,
  CheckCircle2,
  ArrowRight,
  MoreVertical,
  Calendar,
  IndianRupee,
  User,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysInactive } from '../../utils/formatters';
import { exportLeadsCsv } from '../../utils/exportCsv';

interface LeadsKanbanProps {
  onOpenNewLead: () => void;
  onOpenConvertModal: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
}

const STAGES: { id: LeadStage; title: string; color: string; badgeBg: string }[] = [
  { id: 'new', title: 'New Enquiry', color: 'border-t-blue-500', badgeBg: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', title: 'Contacted', color: 'border-t-amber-500', badgeBg: 'bg-amber-100 text-amber-800' },
  { id: 'quote_sent', title: 'Quote Sent', color: 'border-t-purple-500', badgeBg: 'bg-purple-100 text-purple-800' },
  { id: 'negotiating', title: 'Negotiating', color: 'border-t-indigo-500', badgeBg: 'bg-indigo-100 text-indigo-800' },
  { id: 'confirmed', title: 'Confirmed / Won', color: 'border-t-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-800' },
  { id: 'lost', title: 'Lost / Closed', color: 'border-t-gray-400', badgeBg: 'bg-gray-100 text-gray-700' },
];

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({
  onOpenNewLead,
  onOpenConvertModal,
  onSelectLead
}) => {
  const { leads, updateLeadStage, addInteraction, currentUser } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.roomTypeInterested.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: LeadStage) => {
    if (draggedLeadId) {
      updateLeadStage(draggedLeadId, stage);
      setDraggedLeadId(null);
    }
  };

  const getSourceBadge = (source: LeadSource) => {
    switch (source) {
      case 'instagram':
        return { label: 'Instagram', bg: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'whatsapp':
        return { label: 'WhatsApp', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'google':
        return { label: 'Google', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'agoda':
        return { label: 'Agoda', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'hotels_com':
        return { label: 'Hotels.com', bg: 'bg-red-100 text-red-800 border-red-200' };
      case 'walkin':
        return { label: 'Walk-in', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'referral':
        return { label: 'Referral', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: 'Website', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Lead & Enquiry Pipeline
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
              {filteredLeads.length} Enquiries
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Capture every Instagram DM, WhatsApp chat, and OTA inquiry into a unified 6-stage sales board.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search guest, phone, suite..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white border border-zinc-200 focus:outline-none focus:border-zinc-900 w-52 sm:w-60 transition-all"
            />
          </div>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-zinc-200 focus:outline-none focus:border-zinc-900 font-medium text-zinc-800"
          >
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="google">Google Ads</option>
            <option value="agoda">Agoda</option>
            <option value="hotels_com">Hotels.com</option>
            <option value="walkin">Walk-in</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
          </select>

          <button
            onClick={() => exportLeadsCsv(filteredLeads)}
            className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors"
            title="Export Leads to CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewLead}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
          const totalBudgetInStage = stageLeads.reduce((sum, l) => sum + (l.budget || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 min-h-[500px] flex flex-col justify-between"
            >
              {/* Column Header */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-900">
                    {stage.title}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-200/70 text-zinc-700">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                  <span>Pipe: {formatCurrency(totalBudgetInStage)}</span>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border border-dashed border-zinc-300 rounded-lg text-[11px] text-zinc-400 text-center p-2">
                    Drag leads here
                  </div>
                ) : (
                  stageLeads.map(lead => {
                    const daysIdle = getDaysInactive(lead.lastContactedAt);
                    const isInactive = daysIdle >= 2 && lead.stage !== 'confirmed' && lead.stage !== 'lost';
                    const badge = getSourceBadge(lead.source);

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead.id)}
                        className="bg-white rounded-lg p-3 border border-zinc-200 hover:border-zinc-400 shadow-xs transition-all cursor-grab active:cursor-grabbing space-y-2 relative group"
                      >
                        {/* Top Tag & Channel */}
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                          >
                            {badge.label}
                          </span>

                          {/* Inactivity Warning */}
                          {isInactive && (
                            <span
                              title={`No contact in ${daysIdle} days! Follow up now.`}
                              className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>{daysIdle}d Idle</span>
                            </span>
                          )}
                        </div>

                        {/* Guest Name & Guests */}
                        <div>
                          <h4
                            onClick={() => onSelectLead(lead)}
                            className="font-semibold text-xs text-zinc-900 hover:text-zinc-600 cursor-pointer transition-colors"
                          >
                            {lead.name}
                          </h4>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-zinc-400" />
                            <span>{lead.numGuests} Guests • {lead.roomTypeInterested}</span>
                          </div>
                        </div>

                        {/* Preferred Dates & Budget */}
                        <div className="text-[11px] text-zinc-600 space-y-1 bg-zinc-50 p-2 rounded border border-zinc-200/60">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <Calendar className="w-3 h-3" /> Dates:
                            </span>
                            <span className="font-medium text-[10px]">
                              {formatDate(lead.preferredCheckIn)} - {formatDate(lead.preferredCheckOut)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <IndianRupee className="w-3 h-3" /> Budget:
                            </span>
                            <span className="font-semibold text-zinc-900 text-xs">
                              {formatCurrency(lead.budget)}
                            </span>
                          </div>
                        </div>

                        {/* Notes Preview */}
                        {lead.notes && (
                          <p className="text-[11px] text-zinc-500 line-clamp-2 italic bg-zinc-50/50 p-1.5 rounded">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Card Actions Footer */}
                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-1 text-xs">
                          {/* Quick WhatsApp / Call */}
                          <div className="flex items-center gap-1">
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1 rounded text-emerald-700 hover:bg-emerald-50"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${lead.phone}`}
                              title="Call Guest"
                              className="p-1 rounded text-zinc-600 hover:bg-zinc-100"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {/* Convert to Booking Button */}
                          {lead.stage !== 'confirmed' ? (
                            <button
                              onClick={() => onOpenConvertModal(lead)}
                              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-medium flex items-center gap-1 transition-all shadow-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 text-zinc-300" />
                              <span>Convert</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              Won
                            </span>
                          )}

                          {/* Move Stage Selector */}
                          <select
                            value={lead.stage}
                            onChange={e => updateLeadStage(lead.id, e.target.value as LeadStage)}
                            className="text-[10px] bg-transparent border-none focus:ring-0 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="quote_sent">Quote</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="confirmed">Won</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
