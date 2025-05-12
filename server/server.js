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

app.use(cors({
  origin: "https://zenwork-workplace-wellness.vercel.app/", // Update after Vercel deployment
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/journal', journalRouter);
app.use('/api/pixel', pixelRoutes);

app.listen(port, () => console.log(`Server started at PORT:${port}`));