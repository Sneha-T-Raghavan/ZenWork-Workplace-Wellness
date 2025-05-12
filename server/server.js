import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import journalRouter from "./routes/journalRoutes.js";  
import pixelRoutes from './routes/pixelRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

// Update allowedOrigins to include Vercel frontend URL
const allowedOrigins = [
  'http://localhost:5173', // Keep for local development
  'https://zenwork-r3h9p0auv-sneha-t-raghavans-projects.vercel.app' // Vercel frontend
];

// Apply CORS middleware with dynamic origin checking
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Explicitly allow methods
  credentials: true // Support cookies and auth headers
}));

// Other middleware
app.use(express.json());
app.use(cookieParser());

// API Endpoints
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/journal', journalRouter);
app.use('/api/pixel', pixelRoutes);

app.listen(port, () => console.log(`Server started at PORT:${port}`));