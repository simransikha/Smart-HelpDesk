import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  siteName: { type: String, default: "Smart HelpDesk" },
  supportEmail: { type: String, default: "support@example.com" },
  autoClose: { type: Boolean, default: true },
  confidenceThreshold: { type: Number, default: 0.7 },
}, { timestamps: true });

export default mongoose.model('Config', ConfigSchema);
