const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'default'
  },
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  motto: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  logoUrl: {
    type: String,
    trim: true,
    default: ''
  },
  reportTitle: {
    type: String,
    trim: true,
    default: 'END OF TERM REPORT CARD'
  },
  islamicHeaderArabic: {
    type: String,
    trim: true,
    default: ''
  },
  islamicSchoolName: {
    type: String,
    trim: true,
    default: ''
  },
  islamicReportTitle: {
    type: String,
    trim: true,
    default: ''
  },
  islamicAddress: {
    type: String,
    trim: true,
    default: ''
  },
  islamicSectionTitle: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);