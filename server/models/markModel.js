const mongoose = require('mongoose');
const { calculateGrade } = require('../utils/gradeCalculator');

const markSchema = new mongoose.Schema({
  pupilId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pupil',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  subjectCategory: {
    type: String,
    enum: ['secular', 'islamic'],
    default: 'secular'
  },
  // Assessment marks
  botMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: null  // Beginning of Term
  },
  motMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: null  // Mid of Term
  },
  eotMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: null  // End of Term
  },
  // Auto-calculated
  totalMarks: {
    type: Number,
    default: null
  },
  averageMarks: {
    type: Number,
    default: null
  },
  grade: {
    type: String
  },
  gradePoints: {
    type: Number
  },
  remarks: {
    type: String
  },
  // Term & Year
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook: auto-calculate total, average, grade
markSchema.pre('save', function() {
  const validMarks = [this.botMarks, this.motMarks, this.eotMarks].filter(m => m !== null && m !== undefined);
  
  if (validMarks.length > 0) {
    this.totalMarks = validMarks.reduce((sum, m) => sum + m, 0);
    this.averageMarks = Math.round((this.totalMarks / validMarks.length) * 10) / 10;
    
    const gradeInfo = calculateGrade(this.averageMarks);
    this.grade = gradeInfo.grade;
    this.gradePoints = gradeInfo.points;
    this.remarks = gradeInfo.remarks;
  }
});

// Compound index
markSchema.index({ pupilId: 1, term: 1, academicYear: 1 });
markSchema.index({ pupilId: 1, subject: 1, term: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
