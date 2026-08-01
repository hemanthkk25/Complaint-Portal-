import mongoose from 'mongoose';

const issuePresetSchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  presets: [{ type: String }],
}, { timestamps: true });

export const IssuePreset = mongoose.model('IssuePreset', issuePresetSchema);
