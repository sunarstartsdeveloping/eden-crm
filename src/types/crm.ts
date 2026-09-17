export type UserRole = 'owner' | 'frontdesk' | 'spa' | 'fnb' | 'marketing';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  avatar: string;
}

export type LeadStage = 
  | 'new'
  | 'contacted'
  | 'quote_sent'
  | 'negotiating'
  | 'confirmed'
  | 'lost';

export type LeadSource = 
  | 'instagram'
  | 'whatsapp'
  | 'website'
  | 'google'
  | 'agoda'
  | 'hotels_com'
  | 'walkin'
  | 'referral';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  stage: LeadStage;
  assignedTo: string;
  preferredCheckIn: string;
  preferredCheckOut: string;
  numGuests: number;
  roomTypeInterested: string;
  budget?: number;
  notes: string;
  tags: string[];
  lastContactedAt: string;
  createdAt: string;
  lostReason?: string;
}

export interface GuestPreferences {
  dietary?: string; // e.g. "Strict Vegan / Jain meals at Nouveau Table"
  roomPreference?: string; // e.g. "Top floor, valley facing, extra pillows"
  allergies?: string; // e.g. "Allergic to eucalyptus oils & peanuts"
  specialNotes?: string; // e.g. "Celebrated 10th anniversary in Dec"
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idProofType?: string; // Aadhaar / Passport / OCI
  idProofNumber?: string;
  tags: string[]; // VIP, Long-stay, Honeymoon, Corporate, Wellness-Seeker, Repeat Guest
  totalStays: number;
  totalSpend: number;
  preferences: GuestPreferences;
  city?: string;
  state?: string;
  country?: string;
  createdAt: string;
  avatar?: string;
}

export type RoomCategory = 'Valley Suite' | 'Serviced Apartment' | 'Wellness Cottage' | 'Penthouse Villa';
export type RoomStatus = 'clean' | 'occupied' | 'dirty' | 'maintenance';

export interface Room {
  id: string;
  number: string;
  name: string;
  category: RoomCategory;
  floor: number;
  capacity: number;
  baseRate: number; // in INR ₹
  status: RoomStatus;
  features: string[];
  description: string;
  sqft: number;
}

export type BookingStatus = 'tentative' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'advance_paid' | 'paid' | 'refunded';

export interface BookingAddOn {
  id: string;
  name: string;
  category: 'spa' | 'wellness' | 'fnb' | 'salon' | 'transport';
  price: number;
  date?: string;
}

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numGuests: number;
  status: BookingStatus;
  ratePerNight: number;
  totalAmount: number;
  advanceAmount: number;
  source: LeadSource;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  addOns: BookingAddOn[];
}

export type ServiceCategory = 'spa' | 'wellness' | 'fnb' | 'salon';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  description: string;
  location: string; // e.g. "The Spa & Salon Suite", "Sunrise Yoga Deck", "Nouveau Table", "The Nook"
}

export interface ServiceBooking {
  id: string;
  guestId: string;
  guestName: string;
  roomId?: string;
  roomNumber?: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:00 AM - 12:15 PM"
  staffAssigned: string; // Therapist / Host name
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
}

export type InteractionChannel = 'whatsapp' | 'call' | 'instagram' | 'email' | 'in_person';

export interface Interaction {
  id: string;
  entityType: 'lead' | 'guest';
  entityId: string;
  channel: InteractionChannel;
  summary: string;
  notes: string;
  staffName: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  relatedType: 'lead' | 'booking' | 'guest' | 'operations';
  relatedId?: string;
  relatedName?: string;
  dueDate: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface CommunicationTemplate {
  id: string;
  title: string;
  category: 'quote' | 'confirmation' | 'wellness_intake' | 'post_stay_review' | 'anniversary_offer';
  channel: 'whatsapp' | 'email';
  subject?: string;
  content: string;
}
