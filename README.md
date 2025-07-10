# BookMyShow Backend

A simplified version of BookMyShow backend built with Express and MongoDB where users can book movie/event tickets at various theaters or venues.

## Core Features

1. User Registration and Login (JWT based)
2. Search for Movies/Events by City
3. Book Tickets with Seat Selection
4. Seat Locking Mechanism
5. View Booking History
6. Admin Panel to Add Movies, Shows, and Venues

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Validator

## Project Structure

```
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Mongoose models
├── routes/           # API routes
└── server.js         # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update user profile

### Movies
- `GET /api/movies` - Get all movies (filter by city, genre, language)
- `GET /api/movies/:id` - Get single movie
- `GET /api/movies/:id/shows` - Get movie shows by city

### Events
- `GET /api/events` - Get all events (filter by city, type, category)
- `GET /api/events/:id` - Get single event
- `GET /api/events/:id/shows` - Get event shows by city

### Venues
- `GET /api/venues` - Get all venues (filter by city, type)
- `GET /api/venues/cities` - Get cities with active venues
- `GET /api/venues/:id` - Get single venue
- `GET /api/venues/:id/shows` - Get venue shows

### Bookings
- `GET /api/bookings/shows/:id` - Get show details for booking
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `POST /api/admin/movies` - Add new movie
- `PUT /api/admin/movies/:id` - Update movie
- `POST /api/admin/events` - Add new event
- `PUT /api/admin/events/:id` - Update event
- `POST /api/admin/venues` - Add new venue
- `PUT /api/admin/venues/:id` - Update venue
- `POST /api/admin/shows` - Add new show
- `PUT /api/admin/shows/:id` - Update show
- `GET /api/admin/bookings` - Get all bookings

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/bookmyshow
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```
4. Run the server: `npm run dev`

## Usage

- Use Postman or any API client to test the endpoints
- For protected routes, include the JWT token in the Authorization header: `Bearer <token>`
- Admin routes require admin privileges

## Features

### Seat Locking
The system implements a temporary seat locking mechanism during the booking process to prevent double bookings. Seats are locked for 10 minutes while a user completes their booking.

### City-based Search
Users can search for movies and events available in their city.

### Admin Dashboard
Admins can manage movies, events, venues, shows, and view booking statistics.