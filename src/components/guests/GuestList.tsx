import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Guest } from '../../types/crm';
import {
  Users,
  Search,
  Download,
  Phone,
  MessageSquare,
  Plus
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportGuestsCsv } from '../../utils/exportCsv';

interface GuestListProps {
  onSelectGuest: (guest: Guest) => void;
  onOpenNewGuestModal: () => void;
}

export const GuestList: React.FC<GuestListProps> = ({
  onSelectGuest,
  onOpenNewGuestModal
}) => {
  const { guests } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  // Collect unique tags
  const allTags = Array.from(new Set(guests.flatMap(g => g.tags)));

  const filteredGuests = guests.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      (g.city && g.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = tagFilter === 'all' || g.tags.includes(tagFilter);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
              Guest Directory
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              {filteredGuests.length} Guests
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Profiles, stay history, medical/dietary preferences, and contact records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-lg bg-white border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 w-56 sm:w-64 transition-colors"
            />
          </div>

          {/* Tag filter */}
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg bg-white border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium text-zinc-900"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <button
            onClick={() => exportGuestsCsv(filteredGuests)}
            className="p-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewGuestModal}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuests.map(guest => {
          const isRepeat = guest.totalStays >= 2;
          const isVip = guest.tags.includes('VIP') || guest.totalSpend > 150000;

          return (
            <div
              key={guest.id}
              className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 p-5 shadow-xs transition-colors space-y-4 flex flex-col justify-between"
            >
              {/* Card Header: Avatar, Name, Badges */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        guest.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          guest.name
                        )}&background=18181b&color=ffffff`
                      }
                      alt={guest.name}
                      className="w-11 h-11 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <h3
                        onClick={() => onSelectGuest(guest)}
                        className="font-semibold text-sm text-zinc-900 hover:text-zinc-600 cursor-pointer transition-colors"
                      >
                        {guest.name}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {guest.city || 'India'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isVip && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        VIP
                      </span>
                    )}
                    {isRepeat && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        {guest.totalStays} Stays
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {guest.tags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-600 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Dietary / Preference Highlight */}
                {guest.preferences?.dietary && (
                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700">
                    <span className="font-medium text-zinc-900 block text-[10px] uppercase">
                      Dietary Preference
                    </span>
                    <span className="line-clamp-1">{guest.preferences.dietary}</span>
                  </div>
                )}
              </div>

              {/* Metrics & Action Bar */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Total Spend</span>
                  <span className="font-semibold text-zinc-900">
                    {formatCurrency(guest.totalSpend)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                    title="WhatsApp Guest"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${guest.phone}`}
                    className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-50 border border-zinc-200 transition-colors"
                    title="Call Guest"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onSelectGuest(guest)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
