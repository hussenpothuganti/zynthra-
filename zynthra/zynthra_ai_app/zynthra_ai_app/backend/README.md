# Infinity AI - Backend (Node.js + MongoDB)

This is the backend codebase for the Infinity AI mobile application built with Node.js, Express, and MongoDB.

## Features

- User authentication via email/password (JWT based)
- AI assistant route using GPT-3.5 or Mistral
- Real-time GPS tracking endpoints with MongoDB
- Daily AI challenge generator logic based on user skill tags
- Resume suggestion and career milestone storage
- Browser automation endpoints (Puppeteer) for ticket/product tasks
- WebSocket (Socket.IO) server for P2P voice/video signaling
- Multilingual support API using LibreTranslate
- Chat history and reminder logs with timestamps

## Tech Stack

- Node.js with Express framework
- MongoDB for database
- Socket.IO for WebSocket server
- JWT for authentication
- Puppeteer for browser automation
- Various AI and NLP libraries

## Project Structure

```
src/
├── config/            # Configuration files
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic services
├── utils/             # Utility functions
└── app.js             # Main application entry point
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Start the server: `npm start`

## API Documentation

The API is organized around REST principles with predictable resource-oriented URLs and standard HTTP response codes to indicate API errors.

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user information

### AI Assistant Endpoints

- `POST /api/assistant/chat` - Send message to AI assistant
- `POST /api/assistant/voice` - Process voice input

### GPS Tracking Endpoints

- `POST /api/sos/location` - Update user location
- `POST /api/sos/emergency` - Trigger emergency SOS

### Challenge Endpoints

- `GET /api/challenges/daily` - Get daily challenges
- `POST /api/challenges/complete` - Mark challenge as completed

### Career Endpoints

- `GET /api/career/suggestions` - Get career suggestions
- `POST /api/career/milestones` - Add career milestone

### WebSocket Events

- `connection` - Client connected
- `disconnect` - Client disconnected
- `join-room` - Join a P2P room
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - WebRTC ICE candidate

## Security

- All routes are secured with JWT authentication
- Password hashing using bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
