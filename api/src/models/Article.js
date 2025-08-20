import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' },
  body: { type: String, required: true, index: 'text' },
  tags: [{ type: String, index: true }],
  status: { type: String, enum: ['draft','published'], default: 'published' }
}, { timestamps: true });

ArticleSchema.index({ title: 'text', body: 'text', tags: 1 });

export default mongoose.model('Article', ArticleSchema);
