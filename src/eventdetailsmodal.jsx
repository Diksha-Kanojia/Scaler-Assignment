// EventDetailsModal.jsx
import { Calendar, Clock, Copy, Edit2, ExternalLink, MapPin, Menu, MoreVertical, Trash2, Users, X } from 'lucide-react'
import { useState } from 'react'

const EventDetailsModal = ({ isOpen, onClose, event, onDelete, onEdit, user }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  if (!isOpen || !event) return null

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const handleDelete = async () => {
    await onDelete(event.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleEdit = () => {
    onEdit(event)
  }

  const getTypeLabel = (type) => {
    if (type === 'task') return 'Task'
    if (type === 'appointment') return 'Appointment schedule'
    return 'Event'
  }

  const getRecurrenceText = (pattern) => {
    if (pattern === 'Does not repeat') return 'Does not repeat'
    return pattern
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-full max-w-xl z-50 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header with calendar color bar */}
        <div className="relative">
          <div 
            className="h-2 w-full" 
            style={{ backgroundColor: event.color || '#039be5' }}
          />
          
          {/* Top Action Buttons */}
          <div className="flex items-center justify-end gap-1 px-4 py-3 border-b">
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit event"
            >
              <Edit2 size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Delete event"
            >
              <Trash2 size={20} className="text-gray-700" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="More options"
              >
                <MoreVertical size={20} className="text-gray-700" />
              </button>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 w-48 z-20">
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: event.color || '#039be5' }} />
            <div className="flex-1">
              <h2 className="text-2xl font-normal text-gray-900 mb-1">{event.title}</h2>
              <div className="text-sm text-gray-600">{formatDate(event.start_date)}</div>
            </div>
          </div>

          {/* Event Type Specific Content */}
          {event.type === 'appointment' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-900 font-medium mb-2">
                {event.booking_duration} min bookable appointments
              </div>
              <div className="text-sm text-gray-700 mb-3">
                Weekly on {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 mb-3">
                <Menu size={16} />
                <div>
                  <div className="font-medium">Booking form</div>
                  <div className="text-xs text-gray-600">
                    {event.booking_form_fields ? JSON.parse(event.booking_form_fields).join(' · ') : 'First name · Last name · Email address'}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <Calendar size={16} className="text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.calendar_name}</div>
                    <div className="text-xs text-gray-600">Busy times on this calendar are unavailable for booking</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium">
                  <ExternalLink size={16} />
                  Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium">
                  <Copy size={16} />
                  Copy link
                </button>
              </div>
            </div>
          )}

          {/* Regular Event/Task Details */}
          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex items-start gap-4">
              <Clock size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900">
                  {formatDate(event.start_date)}
                </div>
                {!event.all_day && event.start_time && event.end_time && (
                  <div className="text-sm text-gray-600">
                    {formatTime(event.start_time)} – {formatTime(event.end_time)}
                  </div>
                )}
                {event.all_day && (
                  <div className="text-sm text-gray-600">All day</div>
                )}
                {event.repeat_pattern && event.repeat_pattern !== 'Does not repeat' && (
                  <div className="text-sm text-gray-600 mt-1">
                    {getRecurrenceText(event.repeat_pattern)}
                  </div>
                )}
              </div>
            </div>

            {/* Event-specific fields */}
            {event.type === 'event' && (
              <>
                {event.guests && (
                  <div className="flex items-start gap-4">
                    <Users size={20} className="text-gray-600 mt-0.5" />
                    <div className="text-sm text-gray-900">{event.guests}</div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="text-gray-600 mt-0.5" />
                    <div className="text-sm text-gray-900">{event.location}</div>
                  </div>
                )}
              </>
            )}

            {/* Task-specific fields */}
            {event.type === 'task' && (
              <>
                {event.deadline && (
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-700 font-medium">Deadline</div>
                      <div className="text-sm text-gray-900">
                        {new Date(event.deadline).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${event.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                    {event.completed && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16 6L8 14L4 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-sm text-gray-900">
                    {event.completed ? 'Completed' : 'Not completed'}
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-4">
                <Menu size={20} className="text-gray-600 mt-0.5" />
                <div className="text-sm text-gray-900 whitespace-pre-wrap flex-1">{event.description}</div>
              </div>
            )}

            {/* Calendar Info - Only for non-appointment events */}
            {event.type !== 'appointment' && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <Calendar size={20} className="text-gray-600" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{event.calendar_name}</span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: event.color || '#039be5' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="px-6 py-4 border-t bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Delete this {getTypeLabel(event.type).toLowerCase()}?</p>
                <p className="text-xs text-gray-600 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default EventDetailsModal