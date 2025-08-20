import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  autoCloseEnabled: { type: Boolean, default: true },
  confidenceThreshold: { type: Number, default: 0.8 },
  thresholds: {
    billing: { type: Number, default: 0.8 },
    tech: { type: Number, default: 0.8 },
    shipping: { type: Number, default: 0.8 },
    other: { type: Number, default: 0.9 }
  }
}, { timestamps: true });

export default mongoose.model('Config', ConfigSchema);
