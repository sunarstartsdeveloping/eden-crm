import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { DEFAULT_TEMPLATES } from '../../data/defaultTemplates';
import { CommunicationTemplate, InteractionChannel } from '../../types/crm';
import {
  MessageSquare,
  Send,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  User,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

export const CommunicationHub: React.FC = () => {
  const { leads, guests, bookings, interactions, addInteraction, currentUser } = useCRM();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const [targetType, setTargetType] = useState<'lead' | 'guest'>('lead');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(leads[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const activeTemplate = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];

  // Resolve target details
  const targetEntity = targetType === 'lead'
    ? leads.find(l => l.id === selectedEntityId)
    : guests.find(g => g.id === selectedEntityId);

  const recipientName = targetEntity?.name || 'Guest';
  const recipientPhone = targetEntity?.phone || '';

  // Linked booking if available
  const linkedBooking = bookings.find(
    b => b.guestName === recipientName || b.guestId === targetEntity?.id
  );

  // Dynamic variable replacement
  const resolveTemplate = (content: string) => {
    return content
      .replace(/{guest_name}/g, recipientName)
      .replace(/{room_name}/g, linkedBooking?.roomName || (targetType === 'lead' ? (targetEntity as any)?.roomTypeInterested : 'Himalayan Suite') || 'Suite')
      .replace(/{dates}/g, linkedBooking ? `${linkedBooking.checkIn} to ${linkedBooking.checkOut}` : 'upcoming stay')
      .replace(/{amount}/g, linkedBooking ? formatCurrency(linkedBooking.totalAmount) : '₹45,000')
      .replace(/{advance_amount}/g, linkedBooking ? formatCurrency(linkedBooking.advanceAmount) : '₹20,000')
      .replace(/{sender_name}/g, currentUser.name)
      .replace(/{sender_title}/g, currentUser.title);
  };

  const resolvedContent = resolveTemplate(activeTemplate.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    if (!recipientPhone) {
      alert('Recipient phone number not found.');
      return;
    }

    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(resolvedContent);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    // Log the touchpoint
    addInteraction({
      entityType: targetType,
      entityId: selectedEntityId,
      channel: 'whatsapp',
      summary: `Dispatched WhatsApp: ${activeTemplate.title}`,
      notes: `Template used: ${activeTemplate.title}`,
      staffName: currentUser.name
    });

    window.open(waUrl, '_blank');
  };

  const filteredInteractions = channelFilter === 'all'
    ? interactions
    : interactions.filter(i => i.channel === channelFilter);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
              Communication Hub
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              WhatsApp Integration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Pre-configured templates, personalized message formatting, and cross-channel logs.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Dispatcher on Left, Cross-Channel Log on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Reply Dispatcher */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                Message Composer
              </h3>
              <p className="text-xs text-zinc-500">
                Auto-fills guest dates, room rates, and directions
              </p>
            </div>
            <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>

          {/* Recipient Selector */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-medium text-zinc-700 block mb-1">Recipient Type</label>
              <select
                value={targetType}
                onChange={e => {
                  const type = e.target.value as 'lead' | 'guest';
                  setTargetType(type);
                  setSelectedEntityId(type === 'lead' ? (leads[0]?.id || '') : (guests[0]?.id || ''));
                }}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="lead">Sales Enquiry / Lead</option>
                <option value="guest">Resident / Past Guest</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-zinc-700 block mb-1">Select Person</label>
              <select
                value={selectedEntityId}
                onChange={e => setSelectedEntityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {targetType === 'lead'
                  ? leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.phone})
                      </option>
                    ))
                  : guests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.phone})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {/* Template Selection Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 block">
              Quick Reply Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Preview (to {recipientName} • {recipientPhone})</span>
              <span className="text-[10px]">Variables Populated</span>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {resolvedContent}
            </div>
          </div>

          {/* Action Dispatch Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
            </button>

            <button
              onClick={handleLaunchWhatsApp}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Master Cross-Channel Communication Log */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                Communication Timeline
              </h3>
              <p className="text-xs text-zinc-500">
                Staff interactions logged across WhatsApp, calls, and email
              </p>
            </div>

            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All Channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="call">Phone Call</option>
              <option value="in_person">In-Person</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
            {filteredInteractions.map(int => (
              <div key={int.id} className="relative pl-6 space-y-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-zinc-400 absolute left-1 top-1.5 border border-white" />
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="font-semibold uppercase tracking-wider text-zinc-700">
                    {int.channel} • {int.staffName}
                  </span>
                  <span>{formatDateTime(int.timestamp)}</span>
                </div>
                <div className="font-medium text-zinc-900 text-xs">
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
        </div>
      </div>
    </div>
  );
};
