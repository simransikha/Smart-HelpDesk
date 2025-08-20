import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user','agent','system'], required: true },
  text: { type: String, required: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['billing','tech','shipping','other'], default: 'other' },
  status: { type: String, enum: ['open','waiting_human','resolved'], default: 'open', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [MessageSchema]
}, { timestamps: true });

export default mongoose.model('Ticket', TicketSchema);
