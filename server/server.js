import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";
import journalRouter from "./routes/journalRoutes.js";  
import pixelRoutes from './routes/pixelRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

// Updated CORS configuration
const allowedOrigins = [
  'https://zenwork-workplace-wellness.vercel.app',
  // Add any other origins you need to support, like development or preview URLs
  'https://zenwork-r3h9p0auv-sneha-t-raghavans-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/journal', journalRouter);
app.use('/api/pixel', pixelRoutes);

app.listen(port, () => console.log(`Server started at PORT:${port}`));