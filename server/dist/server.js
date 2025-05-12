import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { CohereClient } from "cohere-ai";
const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));
  await mongoose.connect(`${process.env.MONGODB_URI}/zenwork`);
};
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cpassword: {
    type: String,
    required: true
  },
  verifyOtp: {
    type: String,
    default: ""
  },
  verifyOtpExpireAt: {
    type: Number,
    default: 0
  },
  isAccountVerified: {
    type: Boolean,
    default: false
  },
  resetOtp: {
    type: String,
    default: ""
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0
  },
  journalEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Journal"
  }]
});
const userModel = mongoose.models.user || mongoose.model("user", userSchema);
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
const register = async (req, res) => {
  const { name, email, password, cpassword } = req.body;
  if (!name || !email || !password || !cpassword) {
    return res.json({ success: false, message: "Missing details" });
  }
  if (password != cpassword) {
    return res.json({ success: false, message: "Confirm Password not matching" });
  }
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedcPassword = await bcrypt.hash(cpassword, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      cpassword: hashedcPassword
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Welcome to ZenWork Workplace Wellness`,
      text: `Welcome to ZenWork. Your account has been created successfully with email id: ${email}`
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required"
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified" });
    }
    const otp = String(Math.floor(1e5 + Math.random() * 9e5));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1e3;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Account OTP verification`,
      text: `Your OTP is ${otp}. Verify your account using this OTP.`
    };
    await transporter.sendMail(mailOption);
    res.json({ success: true, message: "Verifcation OTP Sent to Registered Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missong Details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not found" });
    }
    if (user.verifyOtp === "" | user.verifyOtp != otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    res.json({ success: true, message: "Email verified Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
const isAuthenticated = async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(1e5 + Math.random() * 9e5));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1e3;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Reset Password OTP`,
      text: `Your OTP is ${otp}. Reset your password using this OTP.`
    };
    await transporter.sendMail(mailOption);
    res.json({ success: true, message: "Reset OTP Sent to your Email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
const resetPassword = async (req, res) => {
  const { email, otp, newPassword, newcPassword } = req.body;
  if (!email || !otp || !newPassword || !newcPassword) {
    return res.json({ success: false, message: "Email, OTP, new password, new confirm password are required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (newPassword !== newcPassword) {
      return res.json({ success: false, message: "Confirm Password not matching" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const hashedcPassword = await bcrypt.hash(newcPassword, 10);
    user.password = hashedPassword;
    user.cpassword = hashedcPassword;
    user.resetOtp = "", user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);
const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const userRouter = express.Router();
userRouter.get("/data", userAuth, getUserData);
let cohere;
try {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not defined in environment variables");
  }
  cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
  });
  console.log("Cohere client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Cohere client:", error);
  process.exit(1);
}
const cohere$1 = cohere;
const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  entry: {
    type: String,
    required: [true, "Journal entry is required"],
    minlength: [10, "Journal entry must be at least 10 characters"]
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  sentimentScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  tags: {
    type: [String],
    enum: ["workload", "relationships", "achievement", "stress", "growth", "challenge", "success"],
    default: []
  },
  nlpPatterns: {
    absoluteLanguage: { type: Number, default: 0 },
    negativeFraming: { type: Number, default: 0 },
    discountingPositives: { type: Number, default: 0 },
    mindReading: { type: Number, default: 0 },
    achievements: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ entry: "text" });
const JournalModel = mongoose.models.Journal || mongoose.model("Journal", journalSchema);
const parseNLPPatterns = (analysisText) => {
  const patterns = {
    absoluteLanguage: 0,
    negativeFraming: 0,
    discountingPositives: 0,
    mindReading: 0,
    achievements: 0
  };
  if (analysisText.includes("absolute language") || analysisText.includes("universal quantifiers")) {
    patterns.absoluteLanguage = 1;
  }
  if (analysisText.includes("negative framing") || analysisText.includes("negative language")) {
    patterns.negativeFraming = 1;
  }
  if (analysisText.includes("discounting") || analysisText.includes("dismissing")) {
    patterns.discountingPositives = 1;
  }
  if (analysisText.includes("assume") || analysisText.includes("mind reading")) {
    patterns.mindReading = 1;
  }
  if (analysisText.includes("achievement") || analysisText.includes("success")) {
    patterns.achievements = 1;
  }
  return patterns;
};
const analyzeJournalEntry = async (req, res) => {
  var _a, _b;
  try {
    const { userId, entry } = req.body;
    if (!entry || entry.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Journal entry cannot be empty"
      });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const analysisResponse = await cohere$1.generate({
      model: "command",
      prompt: `Analyze this workplace journal entry for ${user.name} using NLP principles. Provide a JSON response with these fields:
            {
                "languagePatterns": {
                    "absoluteTerms": [array of examples],
                    "modalOperators": [array of examples],
                    "suggestedReframes": [array of suggested alternatives]
                },
                "cognitivePatterns": {
                    "distortions": [array of identified cognitive distortions],
                    "examples": [array of specific examples from text]
                },
                "relationships": {
                    "positiveInteractions": [array],
                    "challengingInteractions": [array],
                    "suggestions": [array of improvement suggestions]
                },
                "achievements": [array of positive accomplishments noted],
                "actionableSteps": [array of 3-5 concrete NLP techniques to try]
            }
            Journal entry: ${entry.substring(0, 2e3)}`,
      maxTokens: 500,
      temperature: 0.7
    });
    if (!analysisResponse.generations || analysisResponse.generations.length === 0) {
      throw new Error("No analysis generated by Cohere");
    }
    let structuredAnalysis;
    try {
      const jsonString = ((_a = analysisResponse.generations[0].text.match(/\{[\s\S]*\}/)) == null ? void 0 : _a[0]) || "{}";
      structuredAnalysis = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e);
      structuredAnalysis = { error: "Could not parse analysis" };
    }
    const sentimentResponse = await cohere$1.generate({
      model: "command",
      prompt: `Rate the sentiment of this journal entry from 1-10 (1=negative, 10=positive). Return ONLY the number.
                    Entry: ${entry.substring(0, 1e3)}`,
      maxTokens: 2,
      temperature: 0.3
    });
    let sentimentScore = 5;
    if ((_b = sentimentResponse.generations) == null ? void 0 : _b[0]) {
      const scoreText = sentimentResponse.generations[0].text.trim();
      const parsedScore = parseInt(scoreText);
      if (!isNaN(parsedScore)) {
        sentimentScore = Math.min(10, Math.max(1, parsedScore));
      }
    }
    const tags = [];
    if (entry.toLowerCase().includes("workload") || entry.toLowerCase().includes("busy")) tags.push("workload");
    if (entry.toLowerCase().includes("team") || entry.toLowerCase().includes("colleague")) tags.push("relationships");
    if (entry.toLowerCase().includes("achieve") || entry.toLowerCase().includes("success")) tags.push("achievement");
    if (entry.toLowerCase().includes("stress") || entry.toLowerCase().includes("overwhelm")) tags.push("stress");
    const journalEntry = await JournalModel.create({
      userId,
      entry,
      analysis: structuredAnalysis,
      sentimentScore,
      tags,
      nlpPatterns: parseNLPPatterns(analysisResponse.generations[0].text)
    });
    await userModel.findByIdAndUpdate(userId, {
      $push: { journalEntries: journalEntry._id }
    });
    res.status(201).json({
      success: true,
      message: "Journal entry analyzed successfully",
      journalEntry: {
        _id: journalEntry._id,
        entry: journalEntry.entry,
        analysis: journalEntry.analysis,
        sentimentScore: journalEntry.sentimentScore,
        tags: journalEntry.tags,
        nlpPatterns: journalEntry.nlpPatterns,
        createdAt: journalEntry.createdAt
      }
    });
  } catch (error) {
    console.error("Journal analysis error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze journal entry",
      error: process.env.NODE_ENV === "development" ? error.stack : void 0
    });
  }
};
const getJournalEntries = async (req, res) => {
  try {
    const { userId } = req.body;
    const entries = await JournalModel.find({ userId }).sort({ createdAt: -1 }).select("entry analysis sentimentScore tags nlpPatterns createdAt");
    const insights = {
      sentiment: {
        average: entries.reduce((acc, curr) => acc + curr.sentimentScore, 0) / (entries.length || 1),
        positiveDays: entries.filter((e) => e.sentimentScore >= 7).length,
        challengingDays: entries.filter((e) => e.sentimentScore <= 4).length,
        trend: calculateSentimentTrend(entries)
      },
      patterns: {
        absoluteLanguage: entries.reduce((acc, curr) => {
          var _a;
          return acc + (((_a = curr.nlpPatterns) == null ? void 0 : _a.absoluteLanguage) || 0);
        }, 0),
        negativeFraming: entries.reduce((acc, curr) => {
          var _a;
          return acc + (((_a = curr.nlpPatterns) == null ? void 0 : _a.negativeFraming) || 0);
        }, 0),
        achievements: entries.reduce((acc, curr) => {
          var _a;
          return acc + (((_a = curr.nlpPatterns) == null ? void 0 : _a.achievements) || 0);
        }, 0)
      },
      tags: countTags(entries),
      commonThemes: entries.length > 0 ? await analyzeCommonThemes(entries) : []
    };
    res.status(200).json({
      success: true,
      entries,
      insights
    });
  } catch (error) {
    console.error("Get entries error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get journal entries"
    });
  }
};
function calculateSentimentTrend(entries) {
  if (entries.length < 2) return "neutral";
  const recent = entries.slice(0, 2);
  const diff = recent[0].sentimentScore - recent[1].sentimentScore;
  return diff > 1 ? "improving" : diff < -1 ? "declining" : "stable";
}
function countTags(entries) {
  const tagCounts = {};
  entries.forEach((entry) => {
    var _a;
    (_a = entry.tags) == null ? void 0 : _a.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return tagCounts;
}
const analyzeCommonThemes = async (entries) => {
  var _a, _b, _c;
  try {
    const entryTexts = entries.map((e) => e.entry).join("\n\n");
    const response = await cohere$1.generate({
      model: "command",
      prompt: `Identify the top 3 recurring themes in these journal entries. For each, provide:
                    - The theme name
                    - Frequency (high/medium/low)
                    - One suggestion for improvement
                    Return as a JSON array:
                    [{
                        "theme": "theme name",
                        "frequency": "high/medium/low",
                        "suggestion": "improvement suggestion"
                    }]
                    Entries: ${entryTexts.substring(0, 5e3)}`,
      maxTokens: 300,
      temperature: 0.5
    });
    if (!((_b = (_a = response.generations) == null ? void 0 : _a[0]) == null ? void 0 : _b.text)) return [];
    try {
      const jsonString = ((_c = response.generations[0].text.match(/\[[\s\S]*\]/)) == null ? void 0 : _c[0]) || "[]";
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse themes JSON:", e);
      return [];
    }
  } catch (error) {
    console.error("Theme analysis error:", error);
    return [];
  }
};
const journalRouter = express.Router();
journalRouter.post("/analyze", userAuth, analyzeJournalEntry);
journalRouter.get("/entries", userAuth, getJournalEntries);
const pixelArtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  pixelData: {
    type: [String],
    required: true
  },
  template: {
    type: String,
    enum: ["heart", "mushroom", "free", "custom"],
    // Add 'custom'
    required: true
  },
  gridSize: {
    type: Number,
    required: false
  },
  templateData: {
    type: [[Number]],
    // 2D array for custom template grid
    required: false
    // Only for 'custom' templates
  },
  colorMap: {
    type: Map,
    of: String,
    // e.g., { "1": "rgb(255,0,0)" }
    required: false
    // Only for 'custom' templates
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const PixelArt = mongoose.model("PixelArt", pixelArtSchema);
const saveDrawing = async (req, res) => {
  try {
    const { title, pixelData, template, gridSize, templateData, colorMap, userId } = req.body;
    if (!title || !pixelData || !template || !userId) {
      return res.status(400).json({
        success: false,
        message: "Title, pixel data, template, and userId are required"
      });
    }
    if (template === "custom") {
      if (!templateData || !colorMap) {
        return res.status(400).json({
          success: false,
          message: "templateData and colorMap are required for custom templates"
        });
      }
      if (!Array.isArray(templateData) || !templateData.every((row) => Array.isArray(row))) {
        return res.status(400).json({
          success: false,
          message: "templateData must be a 2D array"
        });
      }
      if (typeof colorMap !== "object" || Object.values(colorMap).some((val) => typeof val !== "string")) {
        return res.status(400).json({
          success: false,
          message: "colorMap must be an object with string values"
        });
      }
    }
    const newDrawing = new PixelArt({
      user: userId,
      title,
      pixelData,
      template,
      gridSize: template === "free" ? gridSize : void 0,
      templateData: template === "custom" ? templateData : void 0,
      colorMap: template === "custom" ? colorMap : void 0
    });
    await newDrawing.save();
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { pixelArts: newDrawing._id } },
      { new: true }
    );
    res.status(201).json({
      success: true,
      message: "Drawing saved successfully",
      drawing: newDrawing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getUserDrawings = async (req, res) => {
  try {
    const { userId } = req.body;
    const drawings = await PixelArt.find({ user: userId }).sort({ createdAt: -1 }).select("-pixelData -templateData -colorMap");
    res.status(200).json({
      success: true,
      drawings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getDrawingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const drawing = await PixelArt.findOne({ _id: id, user: userId }).lean();
    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: "Drawing not found"
      });
    }
    res.status(200).json({
      success: true,
      drawing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const deleteDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const deletedDrawing = await PixelArt.findOneAndDelete({ _id: id, user: userId });
    if (!deletedDrawing) {
      return res.status(404).json({
        success: false,
        message: "Drawing not found"
      });
    }
    await userModel.findByIdAndUpdate(userId, { $pull: { pixelArts: id } });
    res.status(200).json({
      success: true,
      message: "Drawing deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const router = express.Router();
router.post("/save", userAuth, saveDrawing);
router.get("/list", userAuth, getUserDrawings);
router.get("/:id", userAuth, getDrawingById);
router.delete("/:id", userAuth, deleteDrawing);
const app = express();
const port = process.env.PORT || 4e3;
connectDB();
const allowedOrigins = ["http://localhost:5173"];
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/journal", journalRouter);
app.use("/api/pixel", router);
app.listen(port, () => console.log(`Server started at PORT:${port}`));
