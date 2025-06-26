const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const assistantRoutes = require('./routes/assistant');
const sosRoutes = require('./routes/sos');
const challengeRoutes = require('./routes/challenges');
const careerRoutes = require('./routes/career');
const translationRoutes = require('./routes/translation');

// Import middleware
const { authenticateJWT } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assistant', authenticateJWT, assistantRoutes);
app.use('/api/sos', authenticateJWT, sosRoutes);
app.use('/api/challenges', authenticateJWT, challengeRoutes);
app.use('/api/career', authenticateJWT, careerRoutes);
app.use('/api/translation', authenticateJWT, translationRoutes);

// WebSocket handling for P2P communication
require('./services/socketService')(io);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
