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
const allowedOrigins = [
  'https://zenwork-workplace-wellness.vercel.app',
  'https://zenwork-r3h9p0auv-sneha-t-raghavans-projects.vercel.app'
];

aapp.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'https://zenwork-workplace-wellness.vercel.app' || 
      origin === 'https://zenwork-r3h9p0auv-sneha-t-raghavans-projects.vercel.app') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/journal', journalRouter);
app.use('/api/pixel', pixelRoutes);

app.listen(port, () => console.log(`Server started at PORT:${port}`));