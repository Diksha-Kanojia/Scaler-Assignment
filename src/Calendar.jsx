// Calendar.jsx - Your main calendar component
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateButton from './createbtn'
import EventDetailsModal from './eventdetailsmodal'
import EventModal from './eventmodal'
import CalendarMainView from './maincalendar'
import CalendarSidebar from './sidebar'
import { supabase } from './supabaseClient'

function Calendar() {
  const [user, setUser] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState('week')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('event')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  
  const [events, setEvents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
      } else {
        navigate('/')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // Fetch events when user is loaded
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleCreateEvent = (type = 'event') => {
    setEditingEvent(null)
    setModalType(type)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
  }

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([{ ...eventData, user_id: user.id }])

        if (error) throw error
      }

      // Refresh events
      await fetchEvents()
      setIsModalOpen(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    }
  }

const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      // Refresh events
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setModalType(event.type)
    setIsModalOpen(true)
    setIsDetailsModalOpen(false)
  }

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } border-r flex flex-col bg-white overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="h-16 bg-white flex items-center px-4 gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
            
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <img 
                  src="https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_1_2x.png" 
                  alt="Calendar" 
                  style={{ width: '40px', height: '40px' }} 
                />
                <span className="text-xl text-gray-700 font-normal">Calendar</span>
              </div>
            )}
          </div>
          
          {sidebarOpen && (
            <>
              {/* Create Button */}
              <div className="px-4 pt-2 pb-4">
                <CreateButton 
                  onCreateEvent={() => handleCreateEvent('event')}
                  onCreateTask={() => handleCreateEvent('task')}
                  onCreateAppointment={() => handleCreateEvent('appointment')}
                />
              </div>
              
              {/* Sidebar Content */}
              <div className="px-4 overflow-y-auto flex-1">
                <CalendarSidebar 
                  supabase={supabase}
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date)
                    setCurrentDate(date)
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Collapsed Sidebar - Shows when sidebar is closed */}
        {!sidebarOpen && (
          <div className="flex flex-col items-center py-3 px-2 border-r bg-white">
            {/* Hamburger + Logo */}
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu size={22} className="text-gray-700" />
              </button>
              
              <img 
                src="https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_1_2x.png" 
                alt="Calendar" 
                className="cursor-pointer"
                onClick={() => setSidebarOpen(true)}
                style={{ width: '40px', height: '40px' }} 
              />
            </div>

            {/* Create Button */}
            <div className="mt-4">
              <CreateButton 
                variant="icon"
                onCreateEvent={() => handleCreateEvent('event')}
                onCreateTask={() => handleCreateEvent('task')}
                onCreateAppointment={() => handleCreateEvent('appointment')}
              />
            </div>
          </div>
        )}
        
        {/* Main Calendar View */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <CalendarMainView 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            viewType={viewType}
            onViewTypeChange={setViewType}
            events={events}
            user={user}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Event Creation/Edit Modal */}
      <EventModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        user={user}
        initialType={modalType}
        editingEvent={editingEvent}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        onEdit={handleEditEvent}
        user={user}
      />
    </div>
  )
}

export default Calendar