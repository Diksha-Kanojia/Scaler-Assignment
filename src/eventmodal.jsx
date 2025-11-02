// EventModal.jsx
import { Calendar, Clock, MapPin, Menu, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const EventModal = ({ isOpen, onClose, onSave, user, initialType = 'event', editingEvent = null }) => {
  const [activeTab, setActiveTab] = useState(initialType)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [repeat, setRepeat] = useState('Does not repeat')
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false)
  const [guests, setGuests] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [showTimeDropdown, setShowTimeDropdown] = useState(null)
  
  // Task specific
  const [taskList, setTaskList] = useState('My Tasks')
  const [deadline, setDeadline] = useState('')
  
  // Appointment specific
  const [bookingDuration, setBookingDuration] = useState(60)

  // Helper function to get current time rounded to next 15 min interval
  const getCurrentTime = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const roundedMinutes = Math.ceil(minutes / 15) * 15
    now.setMinutes(roundedMinutes)
    now.setSeconds(0)
    const hours = now.getHours()
    const mins = now.getMinutes()
    const period = hours >= 12 ? 'pm' : 'am'
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${mins.toString().padStart(2, '0')}${period}`
  }

  // Helper function to add 1 hour to a time
  const addOneHour = (time12h) => {
    const [time, period] = time12h.match(/(\d+:\d+)(am|pm)/).slice(1)
    let [hours, minutes] = time.split(':').map(Number)
    
    // Convert to 24h
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
    
    // Add 1 hour
    hours += 1
    if (hours >= 24) hours = 0
    
    // Convert back to 12h
    const newPeriod = hours >= 12 ? 'pm' : 'am'
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')}${newPeriod}`
  }

  // Helper function to convert 24h time to 12h format
  const convertTo12Hour = (time24) => {
    if (!time24) return getCurrentTime()
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'pm' : 'am'
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`
  }

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType)
      
      if (editingEvent) {
        // Populate form with existing event data
        setTitle(editingEvent.title || '')
        setDate(editingEvent.start_date || new Date().toISOString().split('T')[0])
        setAllDay(editingEvent.all_day || false)
        setRepeat(editingEvent.repeat_pattern || 'Does not repeat')
        setDescription(editingEvent.description || '')
        
        if (editingEvent.start_time) {
          const st = convertTo12Hour(editingEvent.start_time)
          setStartTime(st)
          if (editingEvent.end_time) {
            setEndTime(convertTo12Hour(editingEvent.end_time))
          } else {
            setEndTime(addOneHour(st))
          }
        } else {
          const currentTime = getCurrentTime()
          setStartTime(currentTime)
          setEndTime(addOneHour(currentTime))
        }
        
        if (editingEvent.type === 'event') {
          setGuests(editingEvent.guests || '')
          setLocation(editingEvent.location || '')
        } else if (editingEvent.type === 'task') {
          setTaskList(editingEvent.task_list || 'My Tasks')
          setDeadline(editingEvent.deadline || '')
        } else if (editingEvent.type === 'appointment') {
          setBookingDuration(editingEvent.booking_duration || 60)
        }
      } else {
        // Reset form when creating new - leave date empty for user to select
        setTitle('')
        setDate('')
        const currentTime = getCurrentTime()
        setStartTime(currentTime)
        setEndTime(addOneHour(currentTime))
        setAllDay(false)
        setRepeat('Does not repeat')
        setGuests('')
        setLocation('')
        setDescription('')
        setDeadline('')
        setBookingDuration(60)
      }
    }
  }, [isOpen, initialType, editingEvent])

  if (!isOpen) return null

  const repeatOptions = [
    'Does not repeat',
    'Daily',
    'Weekly on Sunday',
    'Monthly on the first Sunday',
    'Annually on November 2',
    'Every weekday (Monday to Friday)',
    'Custom...'
  ]

  // Generate time options
  const timeOptions = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
      const period = h < 12 ? 'am' : 'pm'
      const minute = m.toString().padStart(2, '0')
      timeOptions.push(`${hour}:${minute}${period}`)
    }
  }

  // Get filtered end time options (only times after start time)
  const getEndTimeOptions = () => {
    if (!startTime) return timeOptions
    
    const startIndex = timeOptions.indexOf(startTime)
    if (startIndex === -1) return timeOptions
    
    // Return all times after the start time
    return timeOptions.slice(startIndex + 1)
  }

  const convertTo24Hour = (time12h) => {
    const [time, period] = time12h.match(/(\d+:\d+)(am|pm)/).slice(1)
    let [hours, minutes] = time.split(':').map(Number)
    
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
  }

  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime)
    
    // Auto-adjust end time if it's now before or equal to start time
    const startIndex = timeOptions.indexOf(newStartTime)
    const endIndex = timeOptions.indexOf(endTime)
    
    if (endIndex <= startIndex) {
      // Set end time to 1 hour after start time
      setEndTime(addOneHour(newStartTime))
    }
    
    setShowTimeDropdown(null)
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    if (!date) {
      alert('Please select a date')
      return
    }

    const eventData = {
      title: title.trim(),
      type: activeTab,
      start_date: date,
      all_day: allDay,
      repeat_pattern: repeat,
      calendar_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'My Calendar',
      color: '#9ad3efff'
    }

    if (activeTab === 'event') {
      eventData.end_date = date
      if (!allDay) {
        eventData.start_time = convertTo24Hour(startTime)
        eventData.end_time = convertTo24Hour(endTime)
      }
      eventData.guests = guests
      eventData.location = location
      eventData.description = description
    } else if (activeTab === 'task') {
      if (!allDay) {
        eventData.start_time = convertTo24Hour(startTime)
      }
      eventData.description = description
      eventData.task_list = taskList
      eventData.completed = false
      if (deadline) {
        eventData.deadline = deadline
      }
    } else if (activeTab === 'appointment') {
      eventData.end_date = date
      if (!allDay) {
        eventData.start_time = convertTo24Hour(startTime)
        eventData.end_time = convertTo24Hour(endTime)
      }
      eventData.booking_duration = bookingDuration
      eventData.booking_form_fields = JSON.stringify(['First name', 'Last name', 'Email address'])
    }

    onSave(eventData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Menu size={20} className="text-gray-600" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Add title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-normal text-gray-900 border-b-2 border-blue-500 focus:outline-none pb-2 mb-6"
          />

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('event')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'event'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Event
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'task'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Task
            </button>
            <button
              onClick={() => setActiveTab('appointment')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'appointment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Appointment schedule
            </button>
          </div>

          {/* Event Form */}
          {activeTab === 'event' && (
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <Clock size={20} className="text-gray-600" />
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-2 bg-gray-100 rounded text-sm"
                  />
                  {!allDay && (
                    <>
                      <div className="relative">
                        <button
                          onClick={() => setShowTimeDropdown('start')}
                          className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
                        >
                          {startTime}
                        </button>
                        {showTimeDropdown === 'start' && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowTimeDropdown(null)} />
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 w-32">
                              {timeOptions.map((time) => (
                                <button
                                  key={time}
                                  onClick={() => handleStartTimeChange(time)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <span className="text-gray-600">–</span>
                      <div className="relative">
                        <button
                          onClick={() => setShowTimeDropdown('end')}
                          className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
                        >
                          {endTime}
                        </button>
                        {showTimeDropdown === 'end' && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowTimeDropdown(null)} />
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 w-32">
                              {getEndTimeOptions().map((time) => (
                                <button
                                  key={time}
                                  onClick={() => {
                                    setEndTime(time)
                                    setShowTimeDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* All day & Time zone */}
              <div className="flex items-center gap-8 ml-9">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">All day</span>
                </label>
              </div>

              {/* Repeat */}
              <div className="flex items-center gap-4 relative">
                <div className="w-5" />
                <div className="flex-1 relative">
                  <button
                    onClick={() => setShowRepeatDropdown(!showRepeatDropdown)}
                    className="w-full px-3 py-2 bg-gray-100 rounded text-sm text-left hover:bg-gray-200 flex items-center justify-between"
                  >
                    {repeat}
                    <span className="text-gray-600">▼</span>
                  </button>
                  {showRepeatDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowRepeatDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg w-full z-20">
                        {repeatOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setRepeat(option)
                              setShowRepeatDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Add guests */}
              <div className="flex items-center gap-4">
                <Users size={20} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="Add guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none border-b"
                />
              </div>

              {/* Add location */}
              <div className="flex items-center gap-4">
                <MapPin size={20} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none border-b"
                />
              </div>

              {/* Add description */}
              <div className="flex items-start gap-4">
                <Menu size={20} className="text-gray-600 mt-2" />
                <textarea
                  placeholder="Add description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none resize-none border rounded"
                  rows="3"
                />
              </div>

              {/* Calendar */}
              <div className="flex items-center gap-4 pt-4">
                <Calendar size={20} className="text-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Form */}
          {activeTab === 'task' && (
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <Clock size={20} className="text-gray-600" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-2 bg-gray-100 rounded text-sm"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={convertTo24Hour(startTime).slice(0, 5)}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(':')
                        const hour = parseInt(h)
                        const period = hour >= 12 ? 'pm' : 'am'
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                        setStartTime(`${displayHour}:${m}${period}`)
                      }}
                      className="px-3 py-2 bg-gray-100 rounded text-sm"
                    />
                  )}
                </div>
              </div>

              {/* All day */}
              <div className="flex items-center gap-8 ml-9">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">All day</span>
                </label>
              </div>

              {/* Repeat */}
              <div className="ml-9 text-sm text-gray-600">{repeat}</div>

              {/* Add deadline */}
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Add deadline"
                  className="text-sm text-gray-700 px-3 py-2 bg-gray-100 rounded"
                />
              </div>

              {/* Add description */}
              <div className="flex items-start gap-4">
                <Menu size={20} className="text-gray-600 mt-2" />
                <textarea
                  placeholder="Add description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm text-gray-700 focus:outline-none resize-none"
                  rows="4"
                />
              </div>

              {/* Task list */}
              <div className="flex items-center gap-4">
                <div className="w-5" />
                <select 
                  value={taskList}
                  onChange={(e) => setTaskList(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm text-gray-700"
                >
                  <option>My Tasks</option>
                </select>
              </div>
            </div>
          )}

          {/* Appointment Schedule Form */}
          {activeTab === 'appointment' && (
            <div className="space-y-6">
              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <Clock size={20} className="text-gray-600" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-2 bg-gray-100 rounded text-sm"
                  />
                  <div className="relative">
                    <button
                      onClick={() => setShowTimeDropdown('start')}
                      className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    >
                      {startTime}
                    </button>
                    {showTimeDropdown === 'start' && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTimeDropdown(null)} />
                        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 w-32">
                          {timeOptions.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleStartTimeChange(time)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <span className="text-gray-600">–</span>
                  <div className="relative">
                    <button
                      onClick={() => setShowTimeDropdown('end')}
                      className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    >
                      {endTime}
                    </button>
                    {showTimeDropdown === 'end' && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTimeDropdown(null)} />
                        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 w-32">
                          {getEndTimeOptions().map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                setEndTime(time)
                                setShowTimeDropdown(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-sm">ⓘ</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-3">
                      Create a booking page you can share with others so they can book time with you themselves
                    </p>
                    <div className="text-xs text-gray-600">
                      <div>Booking form: First name · Last name · Email address</div>
                      <div className="mt-1">Duration: {bookingDuration} minutes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="flex items-center gap-4">
                <Calendar size={20} className="text-gray-600" />
                <span className="text-sm text-gray-900">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
          >
            {activeTab === 'appointment' ? 'Set up the schedule' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventModal