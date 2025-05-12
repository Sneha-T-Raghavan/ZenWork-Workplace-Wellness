import mongoose from 'mongoose';

const pixelArtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  pixelData: {
    type: [String],
    required: true,
  },
  template: {
    type: String,
    enum: ['heart', 'mushroom', 'free', 'custom'], // Add 'custom'
    required: true,
  },
  gridSize: {
    type: Number,
    required: false,
  },
  templateData: {
    type: [[Number]], // 2D array for custom template grid
    required: false, // Only for 'custom' templates
  },
  colorMap: {
    type: Map,
    of: String, // e.g., { "1": "rgb(255,0,0)" }
    required: false, // Only for 'custom' templates
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('PixelArt', pixelArtSchema);