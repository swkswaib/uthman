const Pupil = require('../models/pupilModel');
const { getStreamType, getSection, getAllClasses, getStreamsForClass } = require('../config/schoolConfig');

// Get all pupils (with optional filters)
const getPupils = async (req, res) => {
  try {
    const { class: className, stream, section, isActive } = req.query;
    const query = {};
    if (className) query.class = className;
    if (stream) query.stream = stream;
    if (section) query.section = section;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    else query.isActive = true;

    const pupils = await Pupil.find(query).sort({ class: 1, stream: 1, name: 1 });
    res.json(pupils);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pupils', error: error.message });
  }
};

// Create a new pupil
const createPupil = async (req, res) => {
  try {
    const { name, admissionNumber, gender, dateOfBirth, class: className, stream, parentName, parentContact } = req.body;

    if (!name || !admissionNumber || !gender || !className || !stream) {
      return res.status(400).json({ message: 'Name, admission number, gender, class, and stream are required' });
    }

    const streamType = getStreamType(className, stream);
    if (!streamType) {
      return res.status(400).json({ message: `Invalid class "${className}" or stream "${stream}"` });
    }

    const section = getSection(className);

    const pupil = new Pupil({
      name,
      admissionNumber,
      gender,
      dateOfBirth,
      class: className,
      stream,
      streamType,
      section,
      parentName,
      parentContact
    });

    const saved = await pupil.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Admission number already exists' });
    }
    res.status(500).json({ message: 'Error creating pupil', error: error.message });
  }
};

// Get school structure (classes and streams)
const getSchoolStructure = async (req, res) => {
  try {
    const classes = getAllClasses();
    const structure = classes.map(className => ({
      class: className,
      section: getSection(className),
      streams: getStreamsForClass(className)
    }));
    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching school structure', error: error.message });
  }
};

module.exports = { getPupils, createPupil, getSchoolStructure };
