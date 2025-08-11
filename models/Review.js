import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
  author: { type: String, required: true },
  avatar: { type: String, required: true },
  destination: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);