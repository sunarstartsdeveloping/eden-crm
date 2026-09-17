import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  StaffUser,
  Lead,
  LeadStage,
  Guest,
  Room,
  RoomStatus,
  Booking,
  BookingStatus,
  Service,
  ServiceBooking,
  Interaction,
  Task,
  BookingAddOn
} from '../types/crm';
import {
  INITIAL_STAFF,
  INITIAL_ROOMS,
  INITIAL_SERVICES,
  INITIAL_GUESTS,
  INITIAL_LEADS,
  INITIAL_BOOKINGS,
  INITIAL_SERVICE_BOOKINGS,
  INITIAL_INTERACTIONS,
  INITIAL_TASKS
} from '../data/mockData';
import { checkRoomAvailability } from '../utils/availability';

interface CRMContextType {
  currentUser: StaffUser;
  setCurrentUser: (user: StaffUser) => void;
  switchRole: (role: UserRole) => void;
  staffList: StaffUser[];
  
  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastContactedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  deleteLead: (id: string) => void;
  convertLeadToBooking: (
    leadId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    ratePerNight: number,
    advanceAmount: number
  ) => { success: boolean; message?: string; booking?: Booking };

  // Rooms
  rooms: Room[];
  updateRoomStatus: (id: string, status: RoomStatus) => void;
  updateRoomRate: (id: string, rate: number) => void;

  // Bookings
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => { success: boolean; message?: string; booking?: Booking };
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;
  addBookingAddOn: (bookingId: string, addOn: BookingAddOn) => void;

  // Guests
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt' | 'totalStays' | 'totalSpend'>) => Guest;
  updateGuest: (id: string, updates: Partial<Guest>) => void;

  // Services & Spa/F&B Bookings
  services: Service[];
  serviceBookings: ServiceBooking[];
  createServiceBooking: (data: Omit<ServiceBooking, 'id'>) => ServiceBooking;
  updateServiceBookingStatus: (id: string, status: 'scheduled' | 'completed' | 'cancelled') => void;

  // Interactions & Tasks
  interactions: Interaction[];
  addInteraction: (data: Omit<Interaction, 'id' | 'timestamp'>) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;

  // Reset demo data
  resetDemoData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'eden_crm_clean_v3_';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to mock data
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [staffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [currentUser, setCurrentUser] = useState<StaffUser>(INITIAL_STAFF[0]);
  const [leads, setLeads] = useState<Lead[]>(() => loadStored('leads', INITIAL_LEADS));
  const [rooms, setRooms] = useState<Room[]>(() => loadStored('rooms', INITIAL_ROOMS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadStored('bookings', INITIAL_BOOKINGS));
  const [guests, setGuests] = useState<Guest[]>(() => loadStored('guests', INITIAL_GUESTS));
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(() => loadStored('serviceBookings', INITIAL_SERVICE_BOOKINGS));
  const [interactions, setInteractions] = useState<Interaction[]>(() => loadStored('interactions', INITIAL_INTERACTIONS));
  const [tasks, setTasks] = useState<Task[]>(() => loadStored('tasks', INITIAL_TASKS));

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'leads', JSON.stringify(leads));
  }, [leads]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'rooms', JSON.stringify(rooms));
  }, [rooms]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'bookings', JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'guests', JSON.stringify(guests));
  }, [guests]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'serviceBookings', JSON.stringify(serviceBookings));
  }, [serviceBookings]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'interactions', JSON.stringify(interactions));
  }, [interactions]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'tasks', JSON.stringify(tasks));
  }, [tasks]);

  const switchRole = (role: UserRole) => {
    const found = staffList.find(s => s.role === role);
    if (found) setCurrentUser(found);
  };

  // Lead actions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContactedAt'>): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString()
    };
    setLeads(prev => [newLead, ...prev]);

    // Log initial touchpoint
    addInteraction({
      entityType: 'lead',
      entityId: newLead.id,
      channel: leadData.source === 'instagram' ? 'instagram' : leadData.source === 'whatsapp' ? 'whatsapp' : 'call',
      summary: `New inquiry logged via ${leadData.source.toUpperCase()}`,
      notes: leadData.notes || 'Inquiry created.',
      staffName: currentUser.name
    });

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev =>
      prev.map(lead => (lead.id === id ? { ...lead, ...updates, lastContactedAt: new Date().toISOString() } : lead))
    );
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    setLeads(prev =>
      prev.map(lead =>
        lead.id === id ? { ...lead, stage, lastContactedAt: new Date().toISOString() } : lead
      )
    );

    // Also add interaction log
    addInteraction({
      entityType: 'lead',
      entityId: id,
      channel: 'in_person',
      summary: `Pipeline stage moved to ${stage.toUpperCase()}`,
      notes: `Updated by ${currentUser.name} (${currentUser.title})`,
      staffName: currentUser.name
    });
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  // Guest actions
  const addGuest = (guestData: Omit<Guest, 'id' | 'createdAt' | 'totalStays' | 'totalSpend'>): Guest => {
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}`,
      totalStays: 1,
      totalSpend: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setGuests(prev => [newGuest, ...prev]);
    return newGuest;
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  // Room actions
  const updateRoomStatus = (id: string, status: RoomStatus) => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

  const updateRoomRate = (id: string, baseRate: number) => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, baseRate } : r)));
  };

  // Booking actions with Double-Booking Prevention
  const createBooking = (
    bookingData: Omit<Booking, 'id' | 'createdAt'>
  ): { success: boolean; message?: string; booking?: Booking } => {
    // 1. Conflict Check
    const conflict = checkRoomAvailability(
      bookingData.roomId,
      bookingData.checkIn,
      bookingData.checkOut,
      bookings
    );

    if (conflict.hasConflict) {
      return { success: false, message: conflict.message };
    }

    // 2. Create Booking
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setBookings(prev => [newBooking, ...prev]);

    // 3. Mark room status if checkIn is today
    const todayStr = '2026-09-17';
    if (newBooking.checkIn <= todayStr && newBooking.checkOut > todayStr) {
      updateRoomStatus(newBooking.roomId, 'occupied');
    }

    // 4. Update guest lifetime spend and stays
    setGuests(prev =>
      prev.map(g => {
        if (g.id === newBooking.guestId) {
          const newTotalSpend = g.totalSpend + newBooking.totalAmount;
          const newStays = g.totalStays + 1;
          const isRepeat = newStays >= 2;
          const isVip = newTotalSpend > 150000;
          const updatedTags = Array.from(
            new Set([
              ...g.tags,
              ...(isRepeat ? ['Repeat Guest'] : []),
              ...(isVip ? ['VIP'] : [])
            ])
          );
          return {
            ...g,
            totalSpend: newTotalSpend,
            totalStays: newStays,
            tags: updatedTags
          };
        }
        return g;
      })
    );

    return { success: true, booking: newBooking };
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, status } : b));
      const target = prev.find(b => b.id === id);
      if (target) {
        if (status === 'checked_in') updateRoomStatus(target.roomId, 'occupied');
        if (status === 'checked_out') updateRoomStatus(target.roomId, 'dirty');
        if (status === 'cancelled') updateRoomStatus(target.roomId, 'clean');
      }
      return updated;
    });
  };

  const cancelBooking = (id: string) => {
    updateBookingStatus(id, 'cancelled');
  };

  const addBookingAddOn = (bookingId: string, addOn: BookingAddOn) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const updatedAddOns = [...b.addOns, addOn];
          const newTotal = b.totalAmount + addOn.price;
          return { ...b, addOns: updatedAddOns, totalAmount: newTotal };
        }
        return b;
      })
    );
  };

  // Convert Lead to Booking workflow
  const convertLeadToBooking = (
    leadId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    ratePerNight: number,
    advanceAmount: number
  ) => {
    const lead = leads.find(l => l.id === leadId);
    const room = rooms.find(r => r.id === roomId);

    if (!lead || !room) {
      return { success: false, message: 'Invalid lead or room selected.' };
    }

    // 1. Check double booking
    const conflict = checkRoomAvailability(roomId, checkIn, checkOut, bookings);
    if (conflict.hasConflict) {
      return { success: false, message: conflict.message };
    }

    // 2. Find or create guest
    let guest = guests.find(g => g.phone === lead.phone || g.email === lead.email);
    if (!guest) {
      guest = addGuest({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        tags: lead.tags.includes('VIP') ? ['VIP'] : ['First Time Guest'],
        preferences: {
          specialNotes: lead.notes,
          roomPreference: lead.roomTypeInterested
        }
      });
    }

    // 3. Calculate nights & total
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const roomSubtotal = nights * ratePerNight;
    const gst = Math.round(roomSubtotal * 0.12); // 12% GST hospitality rate
    const totalAmount = roomSubtotal + gst;

    // 4. Create booking
    const bookingResult = createBooking({
      guestId: guest.id,
      guestName: guest.name,
      guestPhone: guest.phone,
      roomId: room.id,
      roomNumber: room.number,
      roomName: room.name,
      checkIn,
      checkOut,
      numGuests: lead.numGuests,
      status: 'confirmed',
      ratePerNight,
      totalAmount,
      advanceAmount,
      source: lead.source,
      paymentStatus: advanceAmount >= totalAmount ? 'paid' : advanceAmount > 0 ? 'advance_paid' : 'pending',
      notes: `Converted from lead. ${lead.notes}`,
      addOns: []
    });

    if (!bookingResult.success) {
      return bookingResult;
    }

    // 5. Update lead stage to confirmed
    updateLeadStage(leadId, 'confirmed');

    // 6. Log interaction
    addInteraction({
      entityType: 'guest',
      entityId: guest.id,
      channel: 'whatsapp',
      summary: `Booking confirmed for ${room.name} (${checkIn} to ${checkOut})`,
      notes: `Converted by ${currentUser.name}. Advance paid: ₹${advanceAmount.toLocaleString('en-IN')}`,
      staffName: currentUser.name
    });

    return bookingResult;
  };

  // Service Bookings
  const createServiceBooking = (data: Omit<ServiceBooking, 'id'>): ServiceBooking => {
    const newSb: ServiceBooking = {
      ...data,
      id: `sb-${Date.now()}`
    };
    setServiceBookings(prev => [newSb, ...prev]);

    // If linked to room booking, optionally add to folio
    if (data.roomId) {
      const activeBooking = bookings.find(b => b.roomId === data.roomId && b.status !== 'cancelled');
      if (activeBooking) {
        addBookingAddOn(activeBooking.id, {
          id: newSb.id,
          name: data.serviceName,
          category: data.category,
          price: data.price,
          date: data.date
        });
      }
    }

    return newSb;
  };

  const updateServiceBookingStatus = (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    setServiceBookings(prev => prev.map(sb => (sb.id === id ? { ...sb, status } : sb)));
  };

  // Interactions & Tasks
  const addInteraction = (data: Omit<Interaction, 'id' | 'timestamp'>) => {
    const newInt: Interaction = {
      ...data,
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setInteractions(prev => [newInt, ...prev]);
  };

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const resetDemoData = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('eden_crm')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
    setLeads(INITIAL_LEADS);
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setGuests(INITIAL_GUESTS);
    setServiceBookings(INITIAL_SERVICE_BOOKINGS);
    setInteractions(INITIAL_INTERACTIONS);
    setTasks(INITIAL_TASKS);
    setCurrentUser(INITIAL_STAFF[0]);
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        staffList,
        leads,
        addLead,
        updateLead,
        updateLeadStage,
        deleteLead,
        convertLeadToBooking,
        rooms,
        updateRoomStatus,
        updateRoomRate,
        bookings,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        addBookingAddOn,
        guests,
        addGuest,
        updateGuest,
        services,
        serviceBookings,
        createServiceBooking,
        updateServiceBookingStatus,
        interactions,
        addInteraction,
        tasks,
        addTask,
        toggleTask,
        resetDemoData
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
