import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import router from './router.js';
import { addAdmin, addSuperAdmin } from './controllers/authController.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MONGODB_URI, PORT, FRONTEND_URL, SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// HTTP server and socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      FRONTEND_URL,
      'https://brgymaahas.com',
      'https://www.brgymaahas.com',
      'https://bhub-maahas.netlify.app',
      'http://localhost:3000'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enable trust proxy
app.enable('trust proxy');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB database');
  // Once connected, add admin users
  addSuperAdmin();
  addAdmin();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// CORS configuration
const allowedOrigins = [
  FRONTEND_URL,
  'https://brgymaahas.com',
  'https://www.brgymaahas.com',
  'https://bhub-maahas.netlify.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, 
  exposedHeaders: ['set-cookie'] // Expose cookie headers
}));

// Additional headers for better CORS support
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Access-Control-Allow-Methods,Origin,Accept,Content-Type,X-Requested-With,Cookie,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Set secure cookie settings for all environments
app.use((req, res, next) => {
  res.originalCookie = res.cookie;
  res.cookie = function(name, value, options) {
    const enhancedOptions = {
      ...options,
      sameSite: 'None',
      secure: true,
      httpOnly: options?.httpOnly !== false,
      path: options?.path || '/'
    };
    return res.originalCookie(name, value, enhancedOptions);
  };
  next();
});

// SOCKET.IO CONNECTION HANDLING
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining (authentication)
  socket.on('join', (userData) => {
    const { userId, userType, name } = userData;
    
    connectedUsers.set(socket.id, {
      userId,
      userType,
      name,
      socketId: socket.id
    });

    // Join appropriate rooms
    if (userType === 'admin' || userType === 'superadmin') {
      socket.join('admins');
      console.log(`Admin ${name} joined admins room`);
    } else if (userType === 'resident') {
      socket.join('residents');
      socket.join(`user_${userId}`); // Individual room for notifications
      console.log(`Resident ${name} joined`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.userType} ${user.name} disconnected`);
    }
    connectedUsers.delete(socket.id);
  });

  // Chat functionality
  socket.on('send_message', (messageData) => {
    const sender = connectedUsers.get(socket.id);
    if (!sender) return;

    const message = {
      ...messageData,
      senderId: sender.userId,
      senderName: sender.name,
      senderType: sender.userType,
      timestamp: new Date()
    };

    // Broadcast to all connected users
    io.emit('receive_message', message);
  });
});

// MAKE IO ACCESSIBLE IN ROUTES
app.set('io', io);

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('Supabase URL:', SUPABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Key:', SUPABASE_KEY ? 'Set (length: ' + SUPABASE_KEY.length + ')' : 'Not set');
console.log('Frontend URL:', FRONTEND_URL);

// Routes
app.use(router);

// Start server WITH SOCKET.IO
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO server is ready for connections');
});