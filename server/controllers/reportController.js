const Pupil = require('../models/pupilModel');
const Mark = require('../models/markModel');
const { getSubjectsForStream, getStreamType, getSection, needsTheologyReport } = require('../config/schoolConfig');
const { calculateGrade, calculateDivision, generateClassTeacherComment, generateHeadTeacherComment, getArabicRemarks, generateIslamicClassComment, generateIslamicSupervisorComment, generateIslamicHeadComment } = require('../utils/gradeCalculator');
const { getOrCreateConfig } = require('./systemConfigController');
const { DEFAULT_SYSTEM_CONFIG } = require('../config/defaultSystemConfig');

const loadSystemConfig = async () => {
  try {
    const configDoc = await getOrCreateConfig();
    return {
      ...DEFAULT_SYSTEM_CONFIG,
      ...configDoc.toObject()
    };
  } catch {
    return { ...DEFAULT_SYSTEM_CONFIG };
  }
};

// Generate report for a single pupil
const generatePupilReport = async (req, res) => {
  try {
    const { pupilId } = req.params;
    const { term = 'Term 1', academicYear = '2025/2026' } = req.query;
    const schoolConfig = await loadSystemConfig();

    const pupil = await Pupil.findById(pupilId);
    if (!pupil) {
      return res.status(404).json({ message: 'Pupil not found' });
    }

    // Get marks for this pupil in the specified term/year
    const marks = await Mark.find({
      pupilId,
      term,
      academicYear
    }).sort({ subject: 1 });

    // Separate secular and islamic marks
    const secularMarks = marks.filter(m => m.subjectCategory === 'secular');
    const islamicMarks = marks.filter(m => m.subjectCategory === 'islamic');

    // Calculate secular performance
    const secularWithMarks = secularMarks.filter(m => m.averageMarks !== null);
    const secularTotal = secularWithMarks.reduce((sum, m) => sum + m.averageMarks, 0);
    const secularAverage = secularWithMarks.length > 0 ? Math.round((secularTotal / secularWithMarks.length) * 10) / 10 : 0;
    const secularAggregatePoints = secularWithMarks.reduce((sum, m) => sum + (m.gradePoints || 0), 0);

    // Calculate islamic performance (if applicable)
    const islamicWithMarks = islamicMarks.filter(m => m.averageMarks !== null);
    const islamicTotal = islamicWithMarks.length > 0 ? islamicWithMarks.reduce((sum, m) => sum + m.averageMarks, 0) : 0;
    const islamicAverage = islamicWithMarks.length > 0 ? Math.round((islamicTotal / islamicWithMarks.length) * 10) / 10 : 0;

    // Calculate class position (based on secular average among same class+stream)
    const classmates = await Pupil.find({
      class: pupil.class,
      stream: pupil.stream,
      isActive: true
    });

    const classmateIds = classmates.map(c => c._id);
    const allClassMarks = await Mark.find({
      pupilId: { $in: classmateIds },
      term,
      academicYear,
      subjectCategory: 'secular'
    });

    // Calculate averages for all classmates
    const classmateAverages = classmateIds.map(id => {
      const studentMarks = allClassMarks.filter(m => m.pupilId.toString() === id.toString());
      const withMarks = studentMarks.filter(m => m.averageMarks !== null);
      const avg = withMarks.length > 0
        ? withMarks.reduce((sum, m) => sum + m.averageMarks, 0) / withMarks.length
        : 0;
      return { pupilId: id.toString(), average: avg };
    });

    // Sort descending and find position
    classmateAverages.sort((a, b) => b.average - a.average);
    const position = classmateAverages.findIndex(c => c.pupilId === pupilId.toString()) + 1;

    const streamType = getStreamType(pupil.class, pupil.stream);
    const hasTheology = needsTheologyReport(pupil.class, pupil.stream);

    const overallGrade = calculateGrade(secularAverage);

    const report = {
      schoolConfig,
      pupil: {
        _id: pupil._id,
        name: pupil.name,
        admissionNumber: pupil.admissionNumber,
        gender: pupil.gender,
        class: pupil.class,
        stream: pupil.stream,
        section: pupil.section,
        streamType: pupil.streamType
      },
      academicInfo: {
        term,
        academicYear,
        section: getSection(pupil.class)
      },
      secularSubjects: secularMarks.map(m => ({
        subject: m.subject,
        botMarks: m.botMarks,
        motMarks: m.motMarks,
        eotMarks: m.eotMarks,
        totalMarks: m.totalMarks,
        averageMarks: m.averageMarks,
        grade: m.grade,
        gradePoints: m.gradePoints,
        remarks: m.remarks
      })),
      islamicSubjects: hasTheology ? islamicMarks.map(m => ({
        subject: m.subject,
        botMarks: m.botMarks,
        motMarks: m.motMarks,
        eotMarks: m.eotMarks,
        totalMarks: m.totalMarks,
        averageMarks: m.averageMarks,
        grade: m.grade,
        gradePoints: m.gradePoints,
        remarks: m.remarks,
        arabicRemarks: getArabicRemarks(m.averageMarks)
      })) : [],
      summary: {
        secularTotal,
        secularAverage,
        secularAggregatePoints,
        islamicTotal: hasTheology ? islamicTotal : null,
        islamicAverage: hasTheology ? islamicAverage : null,
        overallGrade: overallGrade.grade,
        overallRemarks: overallGrade.remarks,
        position,
        totalPupils: classmates.length,
        division: calculateDivision(secularAggregatePoints, secularWithMarks.length)
      },
      hasTheologyReport: hasTheology,
      comments: {
        classTeacher: generateClassTeacherComment(secularAverage),
        headTeacher: generateHeadTeacherComment(secularAverage),
        islamicClassSupervisor: hasTheology ? generateIslamicClassComment(islamicAverage) : null,
        islamicEducationSupervisor: hasTheology ? generateIslamicSupervisorComment(islamicAverage) : null,
        islamicHeadmaster: hasTheology ? generateIslamicHeadComment(islamicAverage) : null
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

// Generate reports for an entire class/stream
const generateClassReports = async (req, res) => {
  try {
    const { class: className, stream, term = 'Term 1', academicYear = '2025/2026' } = req.query;
    const schoolConfig = await loadSystemConfig();

    if (!className) {
      return res.status(400).json({ message: 'Class is required' });
    }

    const query = { class: className, isActive: true };
    if (stream) query.stream = stream;

    const pupils = await Pupil.find(query).sort({ name: 1 });

    if (pupils.length === 0) {
      return res.status(404).json({ message: 'No pupils found for this class/stream' });
    }

    const pupilIds = pupils.map(p => p._id);

    // Get all marks for these pupils
    const allMarks = await Mark.find({
      pupilId: { $in: pupilIds },
      term,
      academicYear
    });

    // Calculate averages for ranking
    const pupilAverages = pupils.map(pupil => {
      const pupilMarks = allMarks.filter(m =>
        m.pupilId.toString() === pupil._id.toString() && m.subjectCategory === 'secular'
      );
      const withMarks = pupilMarks.filter(m => m.averageMarks !== null);
      const avg = withMarks.length > 0
        ? withMarks.reduce((sum, m) => sum + m.averageMarks, 0) / withMarks.length
        : 0;
      return { pupilId: pupil._id.toString(), average: avg };
    });

    pupilAverages.sort((a, b) => b.average - a.average);

    // Build individual reports
    const reports = pupils.map(pupil => {
      const pupilMarks = allMarks.filter(m => m.pupilId.toString() === pupil._id.toString());
      const secularMarks = pupilMarks.filter(m => m.subjectCategory === 'secular');
      const islamicMarks = pupilMarks.filter(m => m.subjectCategory === 'islamic');

      const secularWithMarks = secularMarks.filter(m => m.averageMarks !== null);
      const secularTotal = secularWithMarks.reduce((sum, m) => sum + m.averageMarks, 0);
      const secularAverage = secularWithMarks.length > 0
        ? Math.round((secularTotal / secularWithMarks.length) * 10) / 10
        : 0;
      const secularAggregatePoints = secularWithMarks.reduce((sum, m) => sum + (m.gradePoints || 0), 0);

      const islamicWithMarks = islamicMarks.filter(m => m.averageMarks !== null);
      const islamicTotal = islamicWithMarks.reduce((sum, m) => sum + m.averageMarks, 0);
      const islamicAverage = islamicWithMarks.length > 0
        ? Math.round((islamicTotal / islamicWithMarks.length) * 10) / 10
        : 0;

      const position = pupilAverages.findIndex(a => a.pupilId === pupil._id.toString()) + 1;
      const hasTheology = needsTheologyReport(pupil.class, pupil.stream);
      const overallGrade = calculateGrade(secularAverage);

      return {
        schoolConfig,
        pupil: {
          _id: pupil._id,
          name: pupil.name,
          admissionNumber: pupil.admissionNumber,
          gender: pupil.gender,
          class: pupil.class,
          stream: pupil.stream,
          section: pupil.section,
          streamType: pupil.streamType
        },
        academicInfo: { term, academicYear },
        secularSubjects: secularMarks.map(m => ({
          subject: m.subject,
          botMarks: m.botMarks,
          motMarks: m.motMarks,
          eotMarks: m.eotMarks,
          totalMarks: m.totalMarks,
          averageMarks: m.averageMarks,
          grade: m.grade,
          gradePoints: m.gradePoints,
          remarks: m.remarks
        })),
        islamicSubjects: hasTheology ? islamicMarks.map(m => ({
          subject: m.subject,
          botMarks: m.botMarks,
          motMarks: m.motMarks,
          eotMarks: m.eotMarks,
          totalMarks: m.totalMarks,
          averageMarks: m.averageMarks,
          grade: m.grade,
          gradePoints: m.gradePoints,
          remarks: m.remarks,
          arabicRemarks: getArabicRemarks(m.averageMarks)
        })) : [],
        summary: {
          secularTotal,
          secularAverage,
          secularAggregatePoints,
          islamicTotal: hasTheology ? islamicTotal : null,
          islamicAverage: hasTheology ? islamicAverage : null,
          overallGrade: overallGrade.grade,
          overallRemarks: overallGrade.remarks,
          position,
          totalPupils: pupils.length,
          division: calculateDivision(secularAggregatePoints, secularWithMarks.length)
        },
        hasTheologyReport: hasTheology,
        comments: {
          classTeacher: generateClassTeacherComment(secularAverage),
          headTeacher: generateHeadTeacherComment(secularAverage),
          islamicClassSupervisor: hasTheology ? generateIslamicClassComment(islamicAverage) : null,
          islamicEducationSupervisor: hasTheology ? generateIslamicSupervisorComment(islamicAverage) : null,
          islamicHeadmaster: hasTheology ? generateIslamicHeadComment(islamicAverage) : null
        }
      };
    });

    res.json({
      class: className,
      stream: stream || 'All',
      term,
      academicYear,
      totalPupils: reports.length,
      reports
    });
  } catch (error) {
    console.error('Class report error:', error);
    res.status(500).json({ message: 'Error generating class reports', error: error.message });
  }
};

// Get report statistics
const getReportStatistics = async (req, res) => {
  try {
    const { term = 'Term 1', academicYear = '2025/2026' } = req.query;

    const totalPupils = await Pupil.countDocuments({ isActive: true });
    const totalMarksEntries = await Mark.countDocuments({ term, academicYear });

    // Per-class stats
    const classStats = await Mark.aggregate([
      { $match: { term, academicYear, subjectCategory: 'secular' } },
      { $lookup: { from: 'pupils', localField: 'pupilId', foreignField: '_id', as: 'pupil' } },
      { $unwind: '$pupil' },
      {
        $group: {
          _id: '$pupil.class',
          avgMarks: { $avg: '$averageMarks' },
          totalEntries: { $sum: 1 },
          pupilCount: { $addToSet: '$pupilId' }
        }
      },
      {
        $project: {
          class: '$_id',
          avgMarks: { $round: ['$avgMarks', 1] },
          totalEntries: 1,
          pupilCount: { $size: '$pupilCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalPupils,
      totalMarksEntries,
      term,
      academicYear,
      classStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

module.exports = {
  generatePupilReport,
  generateClassReports,
  getReportStatistics
};
