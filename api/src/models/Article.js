import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' },
  content: { type: String, required: true, index: 'text' },
  body: { type: String, default: "" },
  tags: [{ type: String, index: true }],
  status: { type: String, enum: ['draft','published'], default: 'draft' }
}, { timestamps: true });

ArticleSchema.index({ title: 'text', content: 'text', body: 'text', tags: 1 });

export default mongoose.model('Article', ArticleSchema);
