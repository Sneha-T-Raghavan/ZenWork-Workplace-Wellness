import mongoose from 'mongoose';

const pixelArtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  pixelData: {
    type: Array,
    required: true
  },
  template: {
    type: String,
    enum: ['heart', 'mushroom', 'free'],
    required: true
  },
  gridSize: {
    type: Number,
    required: function() { return this.template === 'free'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PixelArt = mongoose.model('PixelArt', pixelArtSchema);

export default PixelArt;