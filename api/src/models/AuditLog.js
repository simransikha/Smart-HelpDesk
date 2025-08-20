import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  action: { type: String, required: true },
  actor: { type: String, enum: ['system','user','agent','admin'], default: 'system' },
  data: { type: Object, default: {} },
  traceId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
