import mongoose from 'mongoose';

const AgentSuggestionSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
  draftReply: { type: String, required: true },
  citations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  predictedCategory: { type: String, enum: ['billing','tech','shipping','other'], required: true },
  confidence: { type: Number, required: true },
  traceId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('AgentSuggestion', AgentSuggestionSchema);
