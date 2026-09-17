import { Booking } from '../types/crm';

export interface ConflictResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
}

/**
 * Validates whether a room is available for the given date range.
 * An overlap exists if:
 * requestedCheckIn < existingCheckOut AND requestedCheckOut > existingCheckIn
 */
export const checkRoomAvailability = (
  roomId: string,
  checkIn: string,
  checkOut: string,
  allBookings: Booking[],
  excludeBookingId?: string
): ConflictResult => {
  if (!roomId || !checkIn || !checkOut) {
    return { hasConflict: false };
  }

  const reqStart = new Date(checkIn).getTime();
  const reqEnd = new Date(checkOut).getTime();

  if (reqEnd <= reqStart) {
    return {
      hasConflict: true,
      message: 'Check-out date must be after check-in date.'
    };
  }

  const roomBookings = allBookings.filter(
    b => b.roomId === roomId &&
         b.status !== 'cancelled' &&
         b.id !== excludeBookingId
  );

  for (const booking of roomBookings) {
    const existStart = new Date(booking.checkIn).getTime();
    const existEnd = new Date(booking.checkOut).getTime();

    // Standard interval overlap formula
    if (reqStart < existEnd && reqEnd > existStart) {
      return {
        hasConflict: true,
        conflictingBooking: booking,
        message: `Double booking prevented! Room is already booked by ${booking.guestName} (${booking.checkIn} to ${booking.checkOut}, Status: ${booking.status.toUpperCase()}).`
      };
    }
  }

  return { hasConflict: false };
};
