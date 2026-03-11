const mongoose = require('mongoose');

const pupilSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE'],
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  stream: {
    type: String,
    required: true,
    trim: true
  },
  streamType: {
    type: String,
    enum: ['muslim', 'non_muslim', 'combined'],
    required: true
  },
  section: {
    type: String,
    enum: ['nursery', 'primary'],
    required: true
  },
  parentName: {
    type: String,
    trim: true
  },
  parentContact: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
pupilSchema.index({ class: 1, stream: 1, isActive: 1 });

module.exports = mongoose.model('Pupil', pupilSchema);
