import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const CalendarSidebar = ({ supabase }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [showCalendars, setShowCalendars] = useState(true);
  const [userName, setUserName] = useState('Loading...');

  const [calendars, setCalendars] = useState([
    { id: 1, name: 'My Calendar', color: '#039be5', checked: true },
    { id: 2, name: 'Birthdays', color: '#0b8043', checked: true },
    { id: 3, name: 'Reminders', color: '#f09300', checked: true },
    { id: 4, name: 'Tasks', color: '#e67c73', checked: true },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'My Calendar';

          setUserName(displayName);

          // Update first calendar name dynamically
          setCalendars(prev =>
            prev.map((cal, i) =>
              i === 0 ? { ...cal, name: displayName } : cal
            )
          );
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserName('My Calendar');
      }
    };

    fetchUserData();
  }, [supabase]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const today = new Date();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === i;

      days.push({
        day: i,
        isCurrentMonth: true,
        isToday
      });
    }

    // Fill next month days to complete 6 weeks
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.day);
    }
  };

  const toggleCalendar = (id) => {
    setCalendars(calendars.map(cal =>
      cal.id === id ? { ...cal, checked: !cal.checked } : cal
    ));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="w-full bg-white p-4">
      {/* ✅ Mini Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, i) => (
            <div key={i} className="text-center text-xs text-gray-600 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square flex items-center justify-center text-xs rounded-full
                transition-colors
                ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                ${day.day === selectedDate && day.isCurrentMonth 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'hover:bg-gray-100'}
                ${day.isToday && day.day !== selectedDate 
                  ? 'border border-blue-600' 
                  : ''}
              `}
            >
              {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Search for people */}
      <div className="mb-6">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
          <Users size={18} className="text-gray-600" />
          <span className="text-sm text-gray-700">Search for people</span>
        </button>
      </div>

      {/* Booking pages */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Booking pages</h3>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Plus size={18} className="text-gray-600" />
          </button>
        </div>
        {/* Static sample */}
        <p className="text-xs text-gray-500 ml-1">No booking pages yet</p>
      </div>

      {/* My Calendars */}
      <div>
        <button
          onClick={() => setShowCalendars(!showCalendars)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="text-sm font-medium text-gray-900">My calendars</h3>
          {showCalendars ? (
            <ChevronUp size={18} className="text-gray-600" />
          ) : (
            <ChevronDown size={18} className="text-gray-600" />
          )}
        </button>

        {showCalendars && (
          <div className="space-y-2">
            {calendars.map((calendar) => (
              <label
                key={calendar.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={calendar.checked}
                    onChange={() => toggleCalendar(calendar.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      calendar.checked
                        ? 'border-transparent'
                        : 'border-gray-300 bg-white'
                    }`}
                    style={{
                      backgroundColor: calendar.checked ? calendar.color : 'white'
                    }}
                  >
                    {calendar.checked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-900">{calendar.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSidebar;
