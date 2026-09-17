import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Download
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { exportLeadsCsv, exportBookingsCsv, exportGuestsCsv } from '../../utils/exportCsv';

export const MarketingReportsView: React.FC = () => {
  const { leads, bookings, guests } = useCRM();

  // Aggregate channel data
  const channels = [
    { key: 'instagram', label: 'Instagram Ads & DMs', adSpend: 35000 },
    { key: 'google', label: 'Google Search & PMax', adSpend: 42000 },
    { key: 'whatsapp', label: 'WhatsApp Outreach', adSpend: 5000 },
    { key: 'agoda', label: 'Agoda OTA', adSpend: 0 },
    { key: 'hotels_com', label: 'Hotels.com OTA', adSpend: 0 },
    { key: 'walkin', label: 'Walk-in (F&B Diners)', adSpend: 0 },
    { key: 'referral', label: 'Referral (Word of Mouth)', adSpend: 0 },
    { key: 'website', label: 'Direct Organic Website', adSpend: 8000 }
  ];

  const channelStats = channels.map(ch => {
    const channelLeads = leads.filter(l => l.source === ch.key);
    const wonLeads = channelLeads.filter(l => l.stage === 'confirmed');
    const channelBookings = bookings.filter(b => b.source === ch.key);

    const totalRevenue = channelBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const roas = ch.adSpend > 0 ? (totalRevenue / ch.adSpend).toFixed(1) + 'x' : 'Organic';
    const conversionRate = channelLeads.length > 0
      ? Math.round((wonLeads.length / channelLeads.length) * 100)
      : 0;

    return {
      ...ch,
      leadsCount: channelLeads.length,
      wonCount: wonLeads.length,
      conversionRate,
      totalRevenue,
      roas
    };
  });

  const totalLeads = leads.length;
  const totalWon = leads.filter(l => l.stage === 'confirmed').length;
  const repeatGuests = guests.filter(g => g.totalStays >= 2);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
              Marketing Performance
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              Attribution Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Channel ROI, ad spend attribution, conversion rates, and repeat-guest metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportLeadsCsv(leads)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Leads</span>
          </button>
          <button
            onClick={() => exportBookingsCsv(bookings)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bookings</span>
          </button>
          <button
            onClick={() => exportGuestsCsv(guests)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Guests</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs uppercase font-medium text-zinc-500">Pipeline Conversion</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-zinc-900">
              {totalLeads > 0 ? Math.round((totalWon / totalLeads) * 100) : 0}%
            </span>
            <span className="text-xs text-zinc-500">({totalWon} of {totalLeads} won)</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Enquiries converted into confirmed bookings.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs uppercase font-medium text-zinc-500">Top Acquisition Channel</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-zinc-900">
              Instagram
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              8.6x ROAS
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            High conversion from pool and jacuzzi video content.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs uppercase font-medium text-zinc-500">Repeat Guest Share</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-zinc-900">
              {guests.length > 0 ? Math.round((repeatGuests.length / guests.length) * 100) : 0}%
            </span>
            <span className="text-xs text-zinc-500">({repeatGuests.length} multi-stay guests)</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Direct organic revenue without ad acquisition cost.
          </p>
        </div>
      </div>

      {/* Full Attribution Table */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Channel Attribution & Ad Spend Matrix
            </h3>
            <p className="text-xs text-zinc-500">
              Breakdown of acquisition spend, conversion rates, and revenue
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-700 font-medium border-b border-zinc-200">
              <tr>
                <th className="p-3">Acquisition Channel</th>
                <th className="p-3 text-center">Inquiries</th>
                <th className="p-3 text-center">Confirmed</th>
                <th className="p-3 text-center">Conversion %</th>
                <th className="p-3 text-right">Ad Spend (INR)</th>
                <th className="p-3 text-right">Revenue Generated</th>
                <th className="p-3 text-center">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {channelStats.map(stat => (
                <tr key={stat.key} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="p-3 font-medium text-zinc-900">
                    {stat.label}
                  </td>
                  <td className="p-3 text-center text-zinc-600">{stat.leadsCount}</td>
                  <td className="p-3 text-center font-medium text-zinc-900">
                    {stat.wonCount}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 font-medium text-zinc-800">
                      {stat.conversionRate}%
                    </span>
                  </td>
                  <td className="p-3 text-right text-zinc-500">
                    {stat.adSpend > 0 ? formatCurrency(stat.adSpend) : '₹0'}
                  </td>
                  <td className="p-3 text-right font-medium text-zinc-900">
                    {formatCurrency(stat.totalRevenue)}
                  </td>
                  <td className="p-3 text-center font-medium text-zinc-800">
                    {stat.roas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repeat Guest Loyalty Spotlight */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Loyal & Repeat Guests
            </h3>
            <p className="text-xs text-zinc-500">
              Guests with 2+ completed stays
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {repeatGuests.map(g => (
            <div
              key={g.id}
              className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-900">{g.name}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                  {g.totalStays} Stays
                </span>
              </div>
              <div className="text-zinc-600">
                {g.city} • Spend: <span className="font-medium text-zinc-900">{formatCurrency(g.totalSpend)}</span>
              </div>
              {g.preferences?.specialNotes && (
                <p className="text-[11px] text-zinc-500 italic bg-white p-2 rounded border border-zinc-200">
                  "{g.preferences.specialNotes}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
