const SystemConfig = require('../models/systemConfigModel');
const { DEFAULT_SYSTEM_CONFIG } = require('../config/defaultSystemConfig');

const ALLOWED_FIELDS = [
  'schoolName',
  'motto',
  'address',
  'logoUrl',
  'reportTitle',
  'islamicHeaderArabic',
  'islamicSchoolName',
  'islamicReportTitle',
  'islamicAddress',
  'islamicSectionTitle'
];

const getOrCreateConfig = async () => {
  let config = await SystemConfig.findById('default');
  if (!config) {
    config = await SystemConfig.create({
      _id: 'default',
      ...DEFAULT_SYSTEM_CONFIG
    });
  }
  return config;
};

const getSystemConfiguration = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    console.error('Failed to load system configuration:', error);
    res.status(500).json({ message: 'Failed to load system configuration' });
  }
};

const updateSystemConfiguration = async (req, res) => {
  try {
    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string'
          ? req.body[field].trim()
          : req.body[field];
      }
    }

    if (updates.schoolName !== undefined && !updates.schoolName) {
      return res.status(400).json({ message: 'School name is required' });
    }

    const config = await SystemConfig.findOneAndUpdate(
      { _id: 'default' },
      { $set: updates, $setOnInsert: { ...DEFAULT_SYSTEM_CONFIG } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Failed to update system configuration:', error);
    res.status(500).json({ message: 'Failed to update system configuration' });
  }
};

module.exports = {
  getSystemConfiguration,
  updateSystemConfiguration,
  getOrCreateConfig
};