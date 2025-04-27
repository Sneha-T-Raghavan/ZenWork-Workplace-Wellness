import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entry: {
        type: String,
        required: [true, 'Journal entry is required'],
        minlength: [10, 'Journal entry must be at least 10 characters']
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
        enum: ['workload', 'relationships', 'achievement', 'stress', 'growth', 'challenge', 'success'],
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

// Add indexes
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ entry: 'text' });

const JournalModel = mongoose.models.Journal || mongoose.model('Journal', journalSchema);
export default JournalModel;