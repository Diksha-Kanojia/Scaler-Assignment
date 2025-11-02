import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  HelpCircle,
  Search,
  Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Assuming you have this file for Supabase setup
import { supabase } from './supabaseClient';

// ========================== CURRENT TIME INDICATOR COMPONENT =============================
const CurrentTimeIndicator = () => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      setPosition((totalMinutes / 60) * 48); // 64px per hour
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="flex items-center">
        <div className="w-3 h-3 bg-red-600 rounded-full -ml-1.5" />
        <div className="flex-1 h-0.5 bg-red-600" />
      </div>
    </div>
  );
};

// ========================== HELPER FUNCTION: EVENT LAYOUT CALCULATION =============================
// Helper function to detect overlapping events
const calculateEventLayout = (events) => {
  if (!events || events.length === 0) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.start_time || !b.start_time) return 0;
    return a.start_time.localeCompare(b.start_time);
  });

  const eventLayouts = [];
  const columns = [];

  sortedEvents.forEach(event => {
    if (!event.start_time) return;

    const [startHour, startMin] = event.start_time.split(':').map(Number);
    const [endHour, endMin] = event.end_time.split(':').map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    // Find the first column where this event doesn't overlap
    let columnIndex = 0;
    while (columnIndex < columns.length) {
      const column = columns[columnIndex];
      const hasOverlap = column.some(e => {
        const [eStartH, eStartM] = e.start_time.split(':').map(Number);
        const [eEndH, eEndM] = e.end_time.split(':').map(Number);
        const eStart = eStartH * 60 + eStartM;
        const eEnd = eEndH * 60 + eEndM;
        return start < eEnd && end > eStart;
      });

      if (!hasOverlap) break;
      columnIndex++;
    }

    // Add to column
    if (!columns[columnIndex]) columns[columnIndex] = [];
    columns[columnIndex].push(event);

    // Find max overlapping events at this time
    let maxOverlap = 1;
    columns.forEach(col => {
      const overlapping = col.filter(e => {
        const [eStartH, eStartM] = e.start_time.split(':').map(Number);
        const [eEndH, eEndM] = e.end_time.split(':').map(Number);
        const eStart = eStartH * 60 + eStartM;
        const eEnd = eEndH * 60 + eEndM;
        return start < eEnd && end > eStart;
      });
      maxOverlap = Math.max(maxOverlap, overlapping.length);
    });

    eventLayouts.push({
      event,
      column: columnIndex,
      totalColumns: maxOverlap
    });
  });

  // Update totalColumns for all events
  return eventLayouts.map(layout => {
    const start = layout.event.start_time.split(':').map(Number);
    const startMin = start[0] * 60 + start[1];
    const end = layout.event.end_time.split(':').map(Number);
    const endMin = end[0] * 60 + end[1];

    let maxCols = layout.totalColumns;
    eventLayouts.forEach(other => {
      if (other.event.id === layout.event.id) return;
      const oStart = other.event.start_time.split(':').map(Number);
      const oStartMin = oStart[0] * 60 + oStart[1];
      const oEnd = other.event.end_time.split(':').map(Number);
      const oEndMin = oEnd[0] * 60 + oEnd[1];

      if (startMin < oEndMin && endMin > oStartMin) {
        maxCols = Math.max(maxCols, other.column + 1);
      }
    });

    return { ...layout, totalColumns: maxCols };
  });
};

// ========================== INLINE SEARCH BOX COMPONENT =============================

const SearchBox = ({ onClose }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchIn, setSearchIn] = useState('Active calendars');

  const handleSearch = () => {
    // Implement your actual search logic here
    console.log('Performing search...');
    setShowFilters(false);
  };

  const handleReset = () => {
    // Reset all form fields (in a real implementation)
    setSearchIn('Active calendars');
    console.log('Resetting search criteria...');
  };

  const dropdownOptions = [
    'Active calendars', 
    'All calendars', 
    'My calendars', 
  ];

  return (
    <div className="flex items-center w-full relative">
        <div className="flex items-center flex-1 h-10 border border-gray-300 rounded-full bg-white relative">
            <input
                type="text"
                placeholder="Search"
                className="flex-1 h-full pl-4 pr-10 text-sm focus:outline-none bg-transparent"
            />
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 mr-1 rounded-full hover:bg-gray-100 text-gray-600"
                title="Show search filters"
            >
                <ChevronDown size={18} />
            </button>
        </div>
        <button 
            onClick={onClose} 
            className="p-2 ml-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="Close search"
        >
            <Search size={20} />
        </button>

        {/* Filter Dropdown Content */}
        {showFilters && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border z-30 p-4" style={{ width: '400px' }}>
                <div className="space-y-4">
                    
                    {/* Search In Dropdown */}
                    <div className="flex items-center">
                        <label className="w-1/4 text-xs text-gray-700 font-medium whitespace-nowrap">Search in</label>
                        <div className="w-3/4 relative">
                            <select
                                value={searchIn}
                                onChange={(e) => setSearchIn(e.target.value)}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white pr-8 cursor-pointer"
                            >
                                {dropdownOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                        </div>
                    </div>

                    {/* Text Input Fields */}
                    {[
                        { label: 'What', placeholder: 'Keywords contained in event' },
                        { label: 'Who', placeholder: 'Enter a participant, organizer, or creator' },
                        { label: 'Where', placeholder: 'Enter a location or room' },
                        { label: "Doesn't have", placeholder: 'Keywords not contained in event' },
                    ].map((field) => (
                        <div key={field.label} className="flex items-center">
                            <label className="w-1/4 text-xs text-gray-700 font-medium">{field.label}</label>
                            <input
                                type="text"
                                placeholder={field.placeholder}
                                className="w-3/4 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                            />
                        </div>
                    ))}

                    {/* Date Range */}
                    <div className="flex items-center">
                        <label className="w-1/4 text-xs text-gray-700 font-medium">Date</label>
                        <div className="w-3/4 flex space-x-2">
                            <input
                                type="date"
                                placeholder="From date"
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 cursor-pointer"
                            />
                            <input
                                type="date"
                                placeholder="To date"
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-2 space-x-4">
                        <button 
                            onClick={handleReset}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={handleSearch}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};


// ========================== EVENT BLOCK COMPONENT =========================
const EventBlock = ({ event, style, onClick, column = 0, totalColumns = 1 }) => {
  const getEventIcon = (type) => {
    if (type === 'task') return '☑'
    if (type === 'appointment') return '🕒'
    return ''
  }

  const columnWidth = 100 / totalColumns;
  const leftPosition = column * columnWidth;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick(event)
      }}
      className="absolute rounded px-1 py-0.5 text-xs text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        backgroundColor: event.color || '#039be5',
        left: `${leftPosition}%`,
        width: `${columnWidth}%`,
        ...style
      }}
      title={event.title}
    >
      <div className="font-medium truncate">
        {getEventIcon(event.type)} {event.title}
      </div>
      {event.location && <div className="text-xs opacity-90 truncate">{event.location}</div>}
    </div>
  )
}

// ========================== DAY VIEW COMPONENT =========================
const DayView = ({ currentDate, hours, formatHour, isToday, events, onEventClick }) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start_date)
    return eventDate.getDate() === currentDate.getDate() &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear()
  })

  const getEventPosition = (event) => {
    if (event.all_day) return null
    
    const [startHour, startMin] = event.start_time.split(':').map(Number)
    const [endHour, endMin] = event.end_time.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes
    
    return {
      top: `${(startMinutes / 60) * 48}px`,
      height: `${(duration / 60) * 48}px`
    }
  }

  const showCurrentTime = isToday(currentDate);

  // Calculate layouts for overlapping events
  const eventLayouts = calculateEventLayout(dayEvents.filter(e => !e.all_day));

  return (
    <div className="flex">
      <div className="w-20 border-r">
        <div className="h-12 border-b flex items-center justify-center text-xs text-gray-500">GMT+05:30</div>
        {hours.map((hour) => (
          <div key={hour} className="h-12 border-b flex items-start justify-end pr-2 pt-1 text-xs text-gray-600">
            {formatHour(hour)}
          </div>
        ))}
      </div>
      <div className="flex-1 relative">
        <div className="h-12 border-b flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-blue-600 font-medium">{dayNames[currentDate.getDay()].slice(0, 3).toUpperCase()}</div>
            <div className={`text-2xl font-normal mt-1 ${isToday(currentDate) ? 'bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto' : ''}`}>{currentDate.getDate()}</div>
          </div>
        </div>
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b border-gray-200 hover:bg-gray-50 cursor-pointer" />
          ))}
          
          {/* Current time indicator */}
          {showCurrentTime && <CurrentTimeIndicator />}
          
          {/* Render events with overlap handling */}
          {eventLayouts.map((layout) => {
            const position = getEventPosition(layout.event)
            if (!position) return null
            return (
              <EventBlock 
                key={layout.event.id} 
                event={layout.event} 
                style={position} 
                onClick={onEventClick}
                column={layout.column}
                totalColumns={layout.totalColumns}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ========================== WEEK VIEW COMPONENT =========================
const WeekView = ({ getWeekDates, hours, formatHour, isToday, dayNamesShort, events, onEventClick }) => {
  const weekDates = getWeekDates()
  
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const getEventPosition = (event) => {
    if (event.all_day) return null
    
    const [startHour, startMin] = event.start_time.split(':').map(Number)
    const [endHour, endMin] = event.end_time.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes
    
    return {
      top: `${(startMinutes / 60) * 64}px`,
      height: `${(duration / 60) * 64}px`
    }
  }

  return (
    <div className="flex">
      <div className="w-20 border-r">
        <div className="h-20 border-b flex items-center justify-center text-xs text-gray-500">GMT+05:30</div>
        {hours.map((hour) => (
          <div key={hour} className="h-12 border-b flex items-start justify-end pr-2 pt-1 text-xs text-gray-600">
            {formatHour(hour)}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7">
        {weekDates.map((date, i) => {
          const dateEvents = getEventsForDate(date)
          const showCurrentTime = isToday(date);
          const eventLayouts = calculateEventLayout(dateEvents.filter(e => !e.all_day));
          
          return (
            <div key={i} className="border-r last:border-r-0 relative">
              <div className="h-20 border-b flex flex-col items-center justify-center">
                <div className="text-xs text-gray-600 mb-1">{dayNamesShort[i]}</div>
                <div className={`text-2xl font-normal ${isToday(date) ? 'bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center' : ''}`}>{date.getDate()}</div>
              </div>
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-12 border-b border-gray-200 hover:bg-gray-50 cursor-pointer" />
                ))}
                
                {/* Current time indicator */}
                {showCurrentTime && <CurrentTimeIndicator />}
                
                {/* Render events with overlap handling */}
                {eventLayouts.map((layout) => {
                  const position = getEventPosition(layout.event)
                  if (!position) return null
                  return (
                    <EventBlock 
                      key={layout.event.id} 
                      event={layout.event} 
                      style={position} 
                      onClick={onEventClick}
                      column={layout.column}
                      totalColumns={layout.totalColumns}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ========================== MONTH VIEW COMPONENT =========================
const MonthView = ({ getMonthDates, isToday, dayNamesShort, events, onEventClick }) => {
  const monthDates = getMonthDates()
  const weeks = []
  for (let i = 0; i < monthDates.length; i += 7) weeks.push(monthDates.slice(i, i + 7))
  
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  return (
    <div>
      <div className="grid grid-cols-7 border-b">
        {dayNamesShort.map((day, i) => (
          <div key={i} className="py-3 text-center text-xs font-medium text-gray-600 border-r last:border-r-0">{day}</div>
        ))}
      </div>
      <div className="grid grid-rows-6 flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day, dIdx) => {
              const dayEvents = getEventsForDate(day.fullDate)
              return (
                <div key={dIdx} className={`border-r last:border-r-0 p-2 hover:bg-gray-50 cursor-pointer ${!day.isCurrentMonth ? 'bg-gray-50' : ''}`}>
                  <div className={`text-sm mb-1 ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'} ${isToday(day.fullDate) ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-medium' : ''}`}>
                    {day.date}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        className="text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: event.color || '#039be5' }}
                        title={event.title}
                      >
                        {event.type === 'task' && '☑ '}
                        {event.type === 'appointment' && '🕒 '}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-600">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================== MAIN CALENDAR PAGE =============================
function CalendarPage({ currentDate, onDateChange, viewType, onViewTypeChange, events, user: userProp, onEventClick }) {
  const [user, setUser] = useState(userProp)
  const [showUserMenu, setShowUserMenu] = useState(false)
  // **State to control the visibility of the INLINE Search Bar/Dropdown**
  const [showSearch, setShowSearch] = useState(false) 
  const [showViewDropdown, setShowViewDropdown] = useState(false)
  const navigate = useNavigate()

  // check user session if not provided
  useEffect(() => {
    if (!userProp) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user)
        } else {
          navigate('/')
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
          if (!session) {
            navigate('/')
          }
        }
      )

      return () => subscription.unsubscribe()
    } else {
      setUser(userProp)
    }
  }, [navigate, userProp])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )

  // ============== Helper Data and Functions ==============
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const handleToday = () => onDateChange(new Date())
  const handlePrev = () => {
    if (viewType === 'day')
      onDateChange(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1)
      )
    else if (viewType === 'week')
      onDateChange(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7)
      )
    else onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNext = () => {
    if (viewType === 'day')
      onDateChange(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      )
    else if (viewType === 'week')
      onDateChange(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7)
      )
    else onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getDateDisplay = () => {
    if (viewType === 'day') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
    } else if (viewType === 'week') {
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${monthNames[weekStart.getMonth()]} ${currentDate.getFullYear()}`
      } else {
        return `${monthNames[weekStart.getMonth()]} – ${monthNames[weekEnd.getMonth()]} ${currentDate.getFullYear()}`
      }
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  const getWeekDates = () => {
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    })
  }

  const getMonthDates = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const dates = []
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({ date: prevMonthDays - i, isCurrentMonth: false, fullDate: new Date(year, month - 1, prevMonthDays - i) })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({ date: i, isCurrentMonth: true, fullDate: new Date(year, month, i) })
    }
    const remainingDays = 42 - dates.length
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({ date: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) })
    }
    return dates
  }

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // ==================== JSX ======================
  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b relative">
        
        {/* Conditional Rendering: Show SearchBox OR Standard Controls */}
        {showSearch ? (
          // Search Box Mode
          <div className="flex-1 mr-4">
            <SearchBox onClose={() => setShowSearch(false)} />
          </div>
        ) : (
          // Standard Controls Mode
          <div className="flex items-center gap-4">
            <button onClick={handleToday} className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 text-sm font-medium">
              Today
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight size={20} />
              </button>
            </div>
            <h1 className="text-xl font-normal text-gray-900">{getDateDisplay()}</h1>
          </div>
        )}

        {/* Top right controls (Always visible, adjusted for layout change) */}
        <div className="flex items-center gap-2">
          
          {/* Search Button (Hidden when search is active, or serves to activate it) */}
          {!showSearch && (
            <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-gray-100 rounded-full">
              <Search size={20} className="text-gray-600" />
            </button>
          )}

          <button className="p-2 hover:bg-gray-100 rounded-full"><HelpCircle size={20} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full"><Settings size={20} /></button>

          {/* View Type Dropdown */}
          <div className="relative">
            <button onClick={() => setShowViewDropdown(!showViewDropdown)} className="px-4 py-2 border border-gray-300 rounded-full flex items-center gap-2 capitalize text-sm">
              {viewType}
              <ChevronDown size={12} />
            </button>
            {showViewDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowViewDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border z-20 py-1">
                  {['day', 'week', 'month'].map((v) => (
                    <button key={v} onClick={() => { onViewTypeChange(v); setShowViewDropdown(false) }} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm capitalize">
                      {v}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="p-2 bg-blue-50 hover:bg-gray-100 rounded-lg">
            <Calendar size={20} className="text-blue-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full"><CheckCircle size={20} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full"><Grid3x3 size={20} /></button>

          {/* User Menu */}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium"
              title={user.email}
            >
              {user.email?.[0]?.toUpperCase()}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border z-20 py-2">
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </div>
                        <div className="text-xs text-gray-600 truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleSignOut} className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100">
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto">
        {viewType === 'day' && <DayView currentDate={currentDate} hours={hours} formatHour={formatHour} isToday={isToday} events={events} onEventClick={onEventClick} />}
        {viewType === 'week' && <WeekView getWeekDates={getWeekDates} hours={hours} formatHour={formatHour} isToday={isToday} dayNamesShort={dayNamesShort} events={events} onEventClick={onEventClick} />}
        {viewType === 'month' && <MonthView getMonthDates={getMonthDates} isToday={isToday} dayNamesShort={dayNamesShort} events={events} onEventClick={onEventClick} />}
      </div>
    </div>
  )
}

export default CalendarPage