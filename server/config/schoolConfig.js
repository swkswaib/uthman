// Uthman Primary School - Class, Stream & Subject Configuration

const STREAM_TYPES = {
  MUSLIM: 'muslim',       // Secular + Islamic Theology
  NON_MUSLIM: 'non_muslim', // Secular only
  COMBINED: 'combined'     // Both (P.6 & P.7 — no theology report card)
};

const SCHOOL_SECTIONS = {
  NURSERY: 'nursery',
  PRIMARY: 'primary'
};

// Complete class-stream mapping
const CLASS_STREAM_MAP = {
  // ─── NURSERY ───
  'Baby': {
    section: SCHOOL_SECTIONS.NURSERY,
    streams: [
      { name: 'Bright', type: STREAM_TYPES.NON_MUSLIM },
      { name: 'Brilliant', type: STREAM_TYPES.MUSLIM },
      { name: 'Blazing', type: STREAM_TYPES.MUSLIM }
    ]
  },
  'Middle': {
    section: SCHOOL_SECTIONS.NURSERY,
    streams: [
      { name: 'Tiger', type: STREAM_TYPES.MUSLIM },
      { name: 'Lion', type: STREAM_TYPES.NON_MUSLIM }
    ]
  },
  'Top': {
    section: SCHOOL_SECTIONS.NURSERY,
    streams: [
      { name: 'King', type: STREAM_TYPES.MUSLIM },
      { name: 'Queen', type: STREAM_TYPES.MUSLIM },
      { name: 'Prince', type: STREAM_TYPES.NON_MUSLIM }
    ]
  },
  // ─── PRIMARY ───
  'P.1': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'Parrot', type: STREAM_TYPES.NON_MUSLIM },
      { name: 'Dove', type: STREAM_TYPES.MUSLIM },
      { name: 'Crane', type: STREAM_TYPES.MUSLIM }
    ]
  },
  'P.2': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'Kamurasi', type: STREAM_TYPES.NON_MUSLIM },
      { name: 'Kabalega', type: STREAM_TYPES.MUSLIM },
      { name: 'Mandela', type: STREAM_TYPES.MUSLIM }
    ]
  },
  'P.3': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'Rwenzori', type: STREAM_TYPES.NON_MUSLIM },
      { name: 'Elgon', type: STREAM_TYPES.MUSLIM },
      { name: 'Moroto', type: STREAM_TYPES.MUSLIM }
    ]
  },
  'P.4': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'Silver', type: STREAM_TYPES.NON_MUSLIM },
      { name: 'Gold', type: STREAM_TYPES.MUSLIM },
      { name: 'Diamond', type: STREAM_TYPES.MUSLIM }
    ]
  },
  'P.5': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'Orange', type: STREAM_TYPES.NON_MUSLIM },
      { name: 'Blue', type: STREAM_TYPES.MUSLIM },
      { name: 'Pink', type: STREAM_TYPES.MUSLIM }
    ]
  },
  'P.6': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'East', type: STREAM_TYPES.COMBINED },
      { name: 'West', type: STREAM_TYPES.COMBINED }
    ]
  },
  'P.7': {
    section: SCHOOL_SECTIONS.PRIMARY,
    streams: [
      { name: 'East', type: STREAM_TYPES.COMBINED },
      { name: 'West', type: STREAM_TYPES.COMBINED }
    ]
  }
};

// ─── SUBJECTS ───

const NURSERY_SECULAR_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Literacy',
  'Writing',
  'Reading',
  'Environment',
  'Creative Arts',
  'Physical Education'
];

const NURSERY_ISLAMIC_SUBJECTS = [
  'Quran Recitation',
  'Islamic Studies',
  'Arabic Language'
];

const PRIMARY_SECULAR_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Science',
  'Social Studies',
  'Creative Arts & Technology',
  'Physical Education',
  'Literacy'
];

const PRIMARY_UPPER_SECULAR_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Science',
  'Social Studies',
  'Creative Arts & Technology',
  'Physical Education'
];

const PRIMARY_ISLAMIC_SUBJECTS = [
  '\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064a\u0645',
  '\u0627\u0644\u0644\u063a\u0629',
  '\u0627\u0644\u0641\u0642\u0647',
  '\u0627\u0644\u062a\u0631\u0628\u064a\u0629',
  '\u0627\u0644\u0642\u0631\u0627\u0621\u0629'
];

// Get subjects based on section, class, and stream type
const getSubjectsForStream = (className, streamName) => {
  const classConfig = CLASS_STREAM_MAP[className];
  if (!classConfig) return [];

  const streamConfig = classConfig.streams.find(s => s.name === streamName);
  if (!streamConfig) return [];

  const section = classConfig.section;
  const streamType = streamConfig.type;

  let subjects = [];

  if (section === SCHOOL_SECTIONS.NURSERY) {
    subjects = [...NURSERY_SECULAR_SUBJECTS];
    if (streamType === STREAM_TYPES.MUSLIM) {
      subjects = [...subjects, ...NURSERY_ISLAMIC_SUBJECTS];
    }
  } else {
    // Primary section
    const isUpper = ['P.6', 'P.7'].includes(className);
    subjects = isUpper ? [...PRIMARY_UPPER_SECULAR_SUBJECTS] : [...PRIMARY_SECULAR_SUBJECTS];

    // Add Islamic subjects for Muslim streams (not P.6 or P.7)
    if (streamType === STREAM_TYPES.MUSLIM && !isUpper) {
      subjects = [...subjects, ...PRIMARY_ISLAMIC_SUBJECTS];
    }
    // P.6 and P.7 are combined — no theology
  }

  return subjects;
};

// Get stream type for a given class + stream
const getStreamType = (className, streamName) => {
  const classConfig = CLASS_STREAM_MAP[className];
  if (!classConfig) return null;
  const stream = classConfig.streams.find(s => s.name === streamName);
  return stream ? stream.type : null;
};

// Get section (nursery/primary) for a class
const getSection = (className) => {
  const classConfig = CLASS_STREAM_MAP[className];
  return classConfig ? classConfig.section : null;
};

// Get all classes
const getAllClasses = () => Object.keys(CLASS_STREAM_MAP);

// Get streams for a class
const getStreamsForClass = (className) => {
  const classConfig = CLASS_STREAM_MAP[className];
  return classConfig ? classConfig.streams : [];
};

// Determine if class needs theology report card
const needsTheologyReport = (className, streamName) => {
  if (['P.6', 'P.7'].includes(className)) return false;
  const streamType = getStreamType(className, streamName);
  return streamType === STREAM_TYPES.MUSLIM;
};

module.exports = {
  STREAM_TYPES,
  SCHOOL_SECTIONS,
  CLASS_STREAM_MAP,
  NURSERY_SECULAR_SUBJECTS,
  NURSERY_ISLAMIC_SUBJECTS,
  PRIMARY_SECULAR_SUBJECTS,
  PRIMARY_UPPER_SECULAR_SUBJECTS,
  PRIMARY_ISLAMIC_SUBJECTS,
  getSubjectsForStream,
  getStreamType,
  getSection,
  getAllClasses,
  getStreamsForClass,
  needsTheologyReport
};
