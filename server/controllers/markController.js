const Mark = require('../models/markModel');
const Pupil = require('../models/pupilModel');
const { getSubjectsForStream, PRIMARY_ISLAMIC_SUBJECTS, NURSERY_ISLAMIC_SUBJECTS } = require('../config/schoolConfig');

const ALL_ISLAMIC_SUBJECTS = [...PRIMARY_ISLAMIC_SUBJECTS, ...NURSERY_ISLAMIC_SUBJECTS];

// Get marks for a pupil
const getMarks = async (req, res) => {
  try {
    const { pupilId, term, academicYear } = req.query;
    const query = {};
    if (pupilId) query.pupilId = pupilId;
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;

    const marks = await Mark.find(query).populate('pupilId', 'name admissionNumber class stream');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marks', error: error.message });
  }
};

// Enter or update marks for a pupil/subject
const enterMarks = async (req, res) => {
  try {
    const { pupilId, subject, subjectCategory, botMarks, motMarks, eotMarks, term, academicYear } = req.body;

    if (!pupilId || !subject || !term || !academicYear) {
      return res.status(400).json({ message: 'pupilId, subject, term, and academicYear are required' });
    }

    const pupil = await Pupil.findById(pupilId);
    if (!pupil) {
      return res.status(404).json({ message: 'Pupil not found' });
    }

    // Validate subject is valid for this stream
    const validSubjects = getSubjectsForStream(pupil.class, pupil.stream);
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({
        message: `Subject "${subject}" is not valid for ${pupil.class} - ${pupil.stream}`,
        validSubjects
      });
    }

    // Determine subject category
    const category = subjectCategory || (ALL_ISLAMIC_SUBJECTS.includes(subject) ? 'islamic' : 'secular');

    // Find existing or create new
    let mark = await Mark.findOne({ pupilId, subject, term, academicYear });
    if (!mark) {
      mark = new Mark({ pupilId, subject, subjectCategory: category, term, academicYear });
    }
    if (botMarks !== undefined) mark.botMarks = botMarks;
    if (motMarks !== undefined) mark.motMarks = motMarks;
    if (eotMarks !== undefined) mark.eotMarks = eotMarks;
    mark.subjectCategory = category;
    await mark.save();

    res.json(mark);
  } catch (error) {
    res.status(500).json({ message: 'Error saving marks', error: error.message });
  }
};

// Bulk enter marks for a class
const bulkEnterMarks = async (req, res) => {
  try {
    const { marks } = req.body; // Array of { pupilId, subject, botMarks, motMarks, eotMarks, term, academicYear }

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ message: 'marks array is required' });
    }

    const results = [];
    const errors = [];

    for (const entry of marks) {
      try {
        const { pupilId, subject, subjectCategory: clientCategory, botMarks, motMarks, eotMarks, term, academicYear } = entry;

        const subjectCategory = clientCategory || (ALL_ISLAMIC_SUBJECTS.includes(subject) ? 'islamic' : 'secular');

        let mark = await Mark.findOne({ pupilId, subject, term, academicYear });
        if (!mark) {
          mark = new Mark({ pupilId, subject, subjectCategory, term, academicYear });
        }
        mark.botMarks = botMarks;
        mark.motMarks = motMarks;
        mark.eotMarks = eotMarks;
        mark.subjectCategory = subjectCategory;
        await mark.save();
        results.push(mark);
      } catch (err) {
        errors.push({ entry, error: err.message });
      }
    }

    res.json({ saved: results.length, errors: errors.length, results, errors });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk saving marks', error: error.message });
  }
};

module.exports = { getMarks, enterMarks, bulkEnterMarks };
