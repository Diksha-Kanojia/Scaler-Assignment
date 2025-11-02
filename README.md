##Diksha Kanojia - e22cseu0493@bennett.edu.in
# Google Calendar Clone

A high-fidelity clone of Google Calendar built as part of a fullstack development assignment. This project implements core Google Calendar functionalities with a focus on delivering a highly interactive and visually accurate user experience.

## Tech Stack

### Frontend
- **React + Vite**: For building a fast and efficient user interface
- **Tailwind CSS**: For styling and maintaining Google Calendar's exact visual design
- **Lucide React**: For icons and visual elements

### Backend
- **Supabase**: Serving as both authentication provider and database
  - Authentication for Google Sign-in
  - PostgreSQL database for storing events and user data

## Features

### Current Implementation
-  Google Authentication
-  Calendar Views
  - Weekly view implementation
  - Month and Day views (planned)
-  Event Management
  - Create new events with detailed modal
  - Support for event title, date, time, guests, location, and description
  - Event types: Regular events, Tasks, and Appointment schedules
  - Event editing and deletion
  - Handling recurring events
-  UI Components
  - Create button with dropdown
  - Left sidebar for navigation
  - Main calendar grid
  - Interactive event modal


### Planned Features

- Calendar sharing and collaboration
- Mobile responsive design
- Drag and drop event management
- Multiple calendar support
- Calendar import/export

## Installation and Setup

1. Clone the repository
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
```

## Architecture Decisions

### Frontend Architecture
- **Component Structure**: Follows a modular approach with separate components for different calendar functionalities
- **State Management**: Currently using React's useState for local state management
- **Styling**: Utilizing Tailwind CSS for precise styling and maintaining Google Calendar's exact look and feel
- **Routing**: React Router for handling navigation and authentication flows

### Backend Architecture (Supabase)
- **Authentication**: Using Supabase Auth for Google Sign-in
- **Database Schema**: PostgreSQL tables for:
  - Users
  - Events
  - Calendar settings
  - Sharing permissions

## Business Logic and Edge Cases

### Event Handling
- Time slot conflict detection
- Timezone handling
- Recurring event patterns
- Event visibility and sharing permissions

### UI/UX Considerations
- Smooth transitions between calendar views
- Responsive design for different screen sizes
- Keyboard navigation support
- Accessibility compliance

## Animation Implementation

The project implements smooth animations for:
- Modal transitions
- View switching
- Event creation/deletion
- Dropdown menus
- Hover effects

Using a combination of:
- Tailwind CSS transitions
- React state-based animations
- CSS transforms for performance

## Future Enhancements

1. **Feature Additions**
   - Drag and drop event management
   - Multiple calendar support
   - Advanced recurring event patterns
   - Calendar sharing and permissions

2. **Technical Improvements**
   - Implementation of Redux for state management
   - Enhanced error handling
   - Offline support
   - Performance optimizations

3. **UI/UX Enhancements**
   - More fluid animations
   - Dark mode support
   - Custom theme options
   - Mobile-first responsive design

## Contributing

This project is part of an assignment and is not open for contributions at this time.

## License

This project is created for educational purposes as part of a coding assignment.
