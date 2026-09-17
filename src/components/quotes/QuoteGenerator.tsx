import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Printer,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate, calculateNights } from '../../utils/formatters';

export const QuoteGenerator: React.FC = () => {
  const { rooms, leads, bookings, services, currentUser } = useCRM();

  // Selected lead or booking source
  const [selectedSourceType, setSelectedSourceType] = useState<'lead' | 'booking' | 'custom'>('booking');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');

  // Form states
  const activeBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0];
  const activeLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const [guestName, setGuestName] = useState(activeBooking?.guestName || activeLead?.name || 'Vikramaditya Oberoi');
  const [guestPhone, setGuestPhone] = useState(activeBooking?.guestPhone || activeLead?.phone || '+91 98110 00000');
  const [guestEmail, setGuestEmail] = useState(activeLead?.email || 'guest@example.com');
  const [roomName, setRoomName] = useState(activeBooking?.roomName || activeLead?.roomTypeInterested || rooms[0]?.name);
  const [checkIn, setCheckIn] = useState(activeBooking?.checkIn || activeLead?.preferredCheckIn || '2026-09-24');
  const [checkOut, setCheckOut] = useState(activeBooking?.checkOut || activeLead?.preferredCheckOut || '2026-09-27');
  const [ratePerNight, setRatePerNight] = useState(activeBooking?.ratePerNight || 24000);
  const [numGuests, setNumGuests] = useState(activeBooking?.numGuests || activeLead?.numGuests || 2);

  // Line items (Services / Add-ons)
  const [addOns, setAddOns] = useState<{ id: string; name: string; price: number }[]>([
    { id: 'add-1', name: 'Private Balcony Candlelight Dinner (Himalayan Tasting)', price: 8500 },
    { id: 'add-2', name: 'Ayurvedic Abhyanga Herbal Therapy for Two (90m)', price: 9000 }
  ]);

  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState<number | ''>('');

  const nights = calculateNights(checkIn, checkOut);
  const roomTotal = nights * ratePerNight;
  const addOnsTotal = addOns.reduce((sum, item) => sum + item.price, 0);
  const subtotal = roomTotal + addOnsTotal;
  const gst = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + gst;
  const advanceRequired = Math.round(grandTotal * 0.5);

  const handleAddAddon = () => {
    if (!newAddonName.trim() || !newAddonPrice) return;
    setAddOns([
      ...addOns,
      { id: `custom-${Date.now()}`, name: newAddonName, price: Number(newAddonPrice) }
    ]);
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const handleRemoveAddon = (id: string) => {
    setAddOns(addOns.filter(a => a.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Control bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-500" />
            <span>Stay Quotation & Folio</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create branded proposals for enquiries with room rates, GST breakdown, and wellness package add-ons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSourceType}
            onChange={e => setSelectedSourceType(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="booking">Import from Booking</option>
            <option value="lead">Import from Lead Pipeline</option>
            <option value="custom">Custom Entry</option>
          </select>

          {selectedSourceType === 'booking' && (
            <select
              value={selectedBookingId}
              onChange={e => {
                setSelectedBookingId(e.target.value);
                const b = bookings.find(item => item.id === e.target.value);
                if (b) {
                  setGuestName(b.guestName);
                  setGuestPhone(b.guestPhone);
                  setRoomName(b.roomName);
                  setCheckIn(b.checkIn);
                  setCheckOut(b.checkOut);
                  setRatePerNight(b.ratePerNight);
                  setNumGuests(b.numGuests);
                }
              }}
              className="text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.guestName} - {b.roomName} ({b.checkIn})
                </option>
              ))}
            </select>
          )}

          {selectedSourceType === 'lead' && (
            <select
              value={selectedLeadId}
              onChange={e => {
                setSelectedLeadId(e.target.value);
                const l = leads.find(item => item.id === e.target.value);
                if (l) {
                  setGuestName(l.name);
                  setGuestPhone(l.phone);
                  setGuestEmail(l.email || '');
                  setRoomName(l.roomTypeInterested);
                  setCheckIn(l.preferredCheckIn);
                  setCheckOut(l.preferredCheckOut);
                  setNumGuests(l.numGuests);
                }
              }}
              className="text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.roomTypeInterested})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Editor Form (hidden on print) & Printable Document */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Editor Settings (No-print) */}
        <div className="no-print bg-white rounded-xl border border-zinc-200 p-5 space-y-4 text-xs shadow-xs">
          <h3 className="font-semibold text-sm text-zinc-900">
            Quotation Adjustments
          </h3>

          <div className="space-y-2.5">
            <div>
              <label className="font-medium text-zinc-700 block mb-1">Guest Name</label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-zinc-700 block mb-1">Suite / Villa</label>
              <select
                value={roomName}
                onChange={e => {
                  setRoomName(e.target.value);
                  const r = rooms.find(room => room.name === e.target.value);
                  if (r) setRatePerNight(r.baseRate);
                }}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({formatCurrency(r.baseRate)}/night)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Rate / Night (INR)</label>
                <input
                  type="number"
                  value={ratePerNight}
                  onChange={e => setRatePerNight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Guest Count</label>
                <input
                  type="number"
                  value={numGuests}
                  onChange={e => setNumGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Add-on experiences manager */}
            <div className="pt-2 border-t border-zinc-200 space-y-2">
              <label className="font-medium text-zinc-700 block">Add Experience or Line Item</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Airport Transfer"
                  value={newAddonName}
                  onChange={e => setNewAddonName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newAddonPrice}
                  onChange={e => setNewAddonPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={handleAddAddon}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
                  title="Add Line Item"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Official Quote Document */}
        <div
          id="printable-quote"
          className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-8 shadow-sm space-y-6 text-zinc-900"
        >
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b border-zinc-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-zinc-900">
                  EDEN
                </span>
                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-zinc-900 text-white font-semibold">
                  Wellness & Hospitality
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Salan Gaon, Mussoorie Foothills, Dehradun, Uttarakhand 248009
              </p>
              <p className="text-xs text-zinc-500">
                Direct Reservations: +91 98970 00000 • reservations@edenwellness.in
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 block">
                Stay Proposal
              </span>
              <div className="font-mono text-sm font-semibold text-zinc-900 mt-0.5">
                QUOTE-2026-{Math.floor(1000 + Math.random() * 9000)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Date: 17 September 2026
              </div>
            </div>
          </div>

          {/* Guest & Reservation Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                Prepared Exclusively For:
              </span>
              <div className="font-semibold text-sm text-zinc-900">{guestName}</div>
              <div className="text-zinc-600">{guestPhone} • {guestEmail}</div>
              <div className="text-zinc-500">{numGuests} Guests</div>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                Stay Itinerary:
              </span>
              <div className="font-semibold text-sm text-zinc-900">{roomName}</div>
              <div className="text-zinc-600">
                {formatDate(checkIn)} to {formatDate(checkOut)} ({nights} Nights)
              </div>
              <div className="text-zinc-500">Check-in: 2:00 PM • Check-out: 11:00 AM</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-white font-medium">
                <tr>
                  <th className="p-3 font-medium">Experience & Accommodation</th>
                  <th className="p-3 font-medium text-center">Duration / Qty</th>
                  <th className="p-3 font-medium text-right">Nightly Rate</th>
                  <th className="p-3 font-medium text-right">Amount (INR)</th>
                  <th className="no-print p-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {/* Room row */}
                <tr>
                  <td className="p-3">
                    <div className="font-semibold text-zinc-900">{roomName}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Includes breakfast at Nouveau Table, yoga deck access, infinity jacuzzi & high tea
                    </div>
                  </td>
                  <td className="p-3 text-center">{nights} Nights</td>
                  <td className="p-3 text-right">{formatCurrency(ratePerNight)}</td>
                  <td className="p-3 text-right font-semibold text-zinc-900">
                    {formatCurrency(roomTotal)}
                  </td>
                  <td className="no-print p-2"></td>
                </tr>

                {/* Add-ons rows */}
                {addOns.map(item => (
                  <tr key={item.id} className="bg-zinc-50/50">
                    <td className="p-3 font-medium text-zinc-900">{item.name}</td>
                    <td className="p-3 text-center">1 Session</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-right font-semibold text-zinc-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="no-print p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(item.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Advance Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-medium text-zinc-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Hospitality GST (12%):</span>
                <span className="font-medium text-zinc-900">{formatCurrency(gst)}</span>
              </div>
              <div className="border-t border-zinc-900 pt-2 flex justify-between font-semibold text-sm text-zinc-900">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex justify-between font-medium mt-2">
                <span>50% Advance to Confirm:</span>
                <span>{formatCurrency(advanceRequired)}</span>
              </div>
            </div>
          </div>

          {/* Inclusions & Bank Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 text-[11px] text-zinc-600 leading-relaxed">
            <div>
              <span className="font-semibold text-zinc-900 block mb-1 uppercase tracking-wider text-[10px]">
                Complimentary Inclusions
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Farm-to-table breakfast at Nouveau Table</li>
                <li>Daily morning Pranayama & Yoga on Sunrise Deck</li>
                <li>Slot at the heated Mountain Infinity Jacuzzi</li>
                <li>High-speed fiber internet throughout estate</li>
              </ul>
            </div>

            <div>
              <span className="font-semibold text-zinc-900 block mb-1 uppercase tracking-wider text-[10px]">
                Terms & Bank Details
              </span>
              <p>
                Bank: HDFC Bank, Rajpur Road, Dehradun<br />
                Account: Eden Wellness & Hospitality LLP<br />
                A/C No: 50200088910244 | IFSC: HDFC0001248<br />
                UPI ID: edenretreats@hdfcbank
              </p>
            </div>
          </div>

          {/* Signature / Footer */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
            <div>Authorized Signature: ____________________</div>
            <div>Issued by: {currentUser.name} ({currentUser.title})</div>
          </div>
        </div>
      </div>
    </div>
  );
};
