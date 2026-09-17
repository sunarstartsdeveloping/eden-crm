import { Lead, Booking, Guest } from '../types/crm';

export const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportLeadsCsv = (leads: Lead[]) => {
  const formatted = leads.map(l => ({
    'Lead ID': l.id,
    'Guest Name': l.name,
    'Phone': l.phone,
    'Email': l.email,
    'Source Channel': l.source.toUpperCase(),
    'Pipeline Stage': l.stage.toUpperCase(),
    'Assigned Staff': l.assignedTo,
    'Check-in Interest': l.preferredCheckIn,
    'Check-out Interest': l.preferredCheckOut,
    'Guests': l.numGuests,
    'Suite Interested': l.roomTypeInterested,
    'Estimated Budget (INR)': l.budget || 0,
    'Tags': l.tags.join('; '),
    'Notes': l.notes,
    'Created Date': l.createdAt.slice(0, 10)
  }));
  exportToCsv('Eden_Leads_Pipeline', formatted);
};

export const exportBookingsCsv = (bookings: Booking[]) => {
  const formatted = bookings.map(b => ({
    'Booking ID': b.id,
    'Guest Name': b.guestName,
    'Guest Phone': b.guestPhone,
    'Room Number': b.roomNumber,
    'Room Name': b.roomName,
    'Check-in Date': b.checkIn,
    'Check-out Date': b.checkOut,
    'Guests': b.numGuests,
    'Status': b.status.toUpperCase(),
    'Nightly Rate': b.ratePerNight,
    'Total Amount (INR)': b.totalAmount,
    'Advance Paid (INR)': b.advanceAmount,
    'Acquisition Source': b.source.toUpperCase(),
    'Payment Status': b.paymentStatus.toUpperCase(),
    'Add-ons Count': b.addOns.length,
    'Created At': b.createdAt
  }));
  exportToCsv('Eden_Bookings_Report', formatted);
};

export const exportGuestsCsv = (guests: Guest[]) => {
  const formatted = guests.map(g => ({
    'Guest ID': g.id,
    'Name': g.name,
    'Phone': g.phone,
    'Email': g.email,
    'City': g.city || '',
    'State': g.state || '',
    'Country': g.country || '',
    'Total Stays': g.totalStays,
    'Lifetime Spend (INR)': g.totalSpend,
    'VIP / Tags': g.tags.join('; '),
    'Dietary Preferences': g.preferences?.dietary || '',
    'Room Preferences': g.preferences?.roomPreference || '',
    'Allergies': g.preferences?.allergies || '',
    'Special Notes': g.preferences?.specialNotes || '',
    'Joined Date': g.createdAt
  }));
  exportToCsv('Eden_Guest_Dossier', formatted);
};
