// createbtn.jsx
import { ChevronDown, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const CreateButton = ({ variant = 'full', onCreateEvent, onCreateTask, onCreateAppointment }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const handleOptionClick = (option) => {
    setShowMenu(false)
    // Call the appropriate callback
    if (option === 'Event' && onCreateEvent) {
      onCreateEvent()
    } else if (option === 'Task' && onCreateTask) {
      onCreateTask()
    } else if (option === 'Appointment schedule' && onCreateAppointment) {
      onCreateAppointment()
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  return (
    <div className="relative">
      {/* Full Button (for expanded sidebar) */}
      {variant === 'full' && (
        <button
          ref={buttonRef}
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200"
        >
          <Plus size={20} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Create</span>
          <ChevronDown size={16} className="text-gray-600 ml-auto" />
        </button>
      )}

      {/* Icon Only Button (for collapsed sidebar) */}
      {variant === 'icon' && (
        <button
          ref={buttonRef}
          onClick={() => setShowMenu(!showMenu)}
          className="w-14 h-14 bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center transition-shadow"
          aria-label="Create"
          title="Create event"
        >
          <Plus size={24} className="text-gray-700" />
        </button>
      )}

      {/* Dropdown Menu */}
      {showMenu && (
        <div 
          ref={menuRef}
          className={`${
            variant === 'full' 
              ? 'absolute left-0 top-full mt-2' 
              : 'absolute left-16 top-0'
          } w-56 bg-white rounded-lg shadow-xl border py-2 z-50`}
        >
          <button 
            onClick={() => handleOptionClick('Event')}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">Event</div>
          </button>
          
          <button 
            onClick={() => handleOptionClick('Task')}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">Task</div>
          </button>
          
          <button 
            onClick={() => handleOptionClick('Appointment schedule')}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">Appointment schedule</div>
          </button>
        </div>
      )}
    </div>
  )
}

export default CreateButton