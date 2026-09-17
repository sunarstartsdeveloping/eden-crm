import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsKanban } from './components/leads/LeadsKanban';
import { LeadModal } from './components/leads/LeadModal';
import { ConvertLeadModal } from './components/leads/ConvertLeadModal';
import { LeadDetailsDrawer } from './components/leads/LeadDetailsDrawer';
import { RoomCalendar } from './components/calendar/RoomCalendar';
import { BookingModal } from './components/calendar/BookingModal';
import { GuestList } from './components/guests/GuestList';
import { GuestProfileModal } from './components/guests/GuestProfileModal';
import { SpaView } from './components/wellness/SpaView';
import { FnBReservationsView } from './components/fnb/FnBReservationsView';
import { CommunicationHub } from './components/communication/CommunicationHub';
import { QuoteGenerator } from './components/quotes/QuoteGenerator';
import { MarketingReportsView } from './components/reports/MarketingReportsView';
import { TasksView } from './components/tasks/TasksView';
import { Lead, Booking, Guest } from './types/crm';

const CRMMainContent: React.FC = () => {
  const { currentUser } = useCRM();
  const [activeView, setActiveView] = useState<NavView>('dashboard');

  // Modal states
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<Lead | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [prefillRoomId, setPrefillRoomId] = useState<string | undefined>();
  const [prefillDate, setPrefillDate] = useState<string | undefined>();

  const [selectedGuestForModal, setSelectedGuestForModal] = useState<Guest | null>(null);

  // Handlers
  const handleOpenNewLead = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const handleOpenConvertLead = (lead: Lead) => {
    setLeadToConvert(lead);
    setIsConvertModalOpen(true);
  };

  const handleOpenNewBooking = (roomId?: string, date?: string) => {
    setBookingToEdit(null);
    setPrefillRoomId(roomId);
    setPrefillDate(date);
    setIsBookingModalOpen(true);
  };

  const handleSelectBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setIsBookingModalOpen(true);
  };

  const handleNavigateToQuoteFromLead = (lead: Lead) => {
    setSelectedLeadForDrawer(null);
    setActiveView('quotes');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      {/* Top Header */}
      <Header
        onOpenNewLeadModal={handleOpenNewLead}
        onOpenNewBookingModal={() => handleOpenNewBooking()}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        <main className="flex-1 overflow-y-auto bg-zinc-50">
          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveView}
              onOpenNewLead={handleOpenNewLead}
              onOpenBooking={() => handleOpenNewBooking()}
            />
          )}

          {activeView === 'leads' && (
            <LeadsKanban
              onOpenNewLead={handleOpenNewLead}
              onOpenConvertModal={handleOpenConvertLead}
              onSelectLead={lead => setSelectedLeadForDrawer(lead)}
            />
          )}

          {activeView === 'calendar' && (
            <RoomCalendar
              onOpenNewBookingModal={handleOpenNewBooking}
              onSelectBooking={handleSelectBooking}
            />
          )}

          {activeView === 'guests' && (
            <GuestList
              onSelectGuest={g => setSelectedGuestForModal(g)}
              onOpenNewGuestModal={() => {
                alert('You can add a guest profile directly or convert an active enquiry into a guest dossier.');
              }}
            />
          )}

          {activeView === 'wellness' && <SpaView />}

          {activeView === 'fnb' && <FnBReservationsView />}

          {activeView === 'communication' && <CommunicationHub />}

          {activeView === 'quotes' && <QuoteGenerator />}

          {activeView === 'reports' && <MarketingReportsView />}

          {activeView === 'tasks' && <TasksView />}
        </main>
      </div>

      {/* Global Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        leadToEdit={leadToEdit}
      />

      <ConvertLeadModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        lead={leadToConvert}
        onSuccessNavigate={() => {
          setActiveView('calendar');
        }}
      />

      <LeadDetailsDrawer
        lead={selectedLeadForDrawer}
        onClose={() => setSelectedLeadForDrawer(null)}
        onOpenConvertModal={handleOpenConvertLead}
        onOpenEditModal={handleOpenEditLead}
        onNavigateToQuote={handleNavigateToQuoteFromLead}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingToEdit={bookingToEdit}
        prefillRoomId={prefillRoomId}
        prefillDate={prefillDate}
        onNavigateToQuote={() => {
          setIsBookingModalOpen(false);
          setActiveView('quotes');
        }}
      />

      <GuestProfileModal
        isOpen={!!selectedGuestForModal}
        onClose={() => setSelectedGuestForModal(null)}
        guest={selectedGuestForModal}
      />
    </div>
  );
};

export function App() {
  return (
    <CRMProvider>
      <CRMMainContent />
    </CRMProvider>
  );
}

export default App;
