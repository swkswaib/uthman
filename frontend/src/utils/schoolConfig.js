// School configuration (client-side mirror of server config)

export const STREAM_TYPES = {
  MUSLIM: 'muslim',
  NON_MUSLIM: 'non_muslim',
  COMBINED: 'combined'
};

export const CLASS_STREAM_MAP = {
  'Baby': {
    section: 'nursery',
    streams: [
      { name: 'Bright', type: 'non_muslim' },
      { name: 'Brilliant', type: 'muslim' },
      { name: 'Blazing', type: 'muslim' }
    ]
  },
  'Middle': {
    section: 'nursery',
    streams: [
      { name: 'Tiger', type: 'muslim' },
      { name: 'Lion', type: 'non_muslim' }
    ]
  },
  'Top': {
    section: 'nursery',
    streams: [
      { name: 'King', type: 'muslim' },
      { name: 'Queen', type: 'muslim' },
      { name: 'Prince', type: 'non_muslim' }
    ]
  },
  'P.1': {
    section: 'primary',
    streams: [
      { name: 'Parrot', type: 'non_muslim' },
      { name: 'Dove', type: 'muslim' },
      { name: 'Crane', type: 'muslim' }
    ]
  },
  'P.2': {
    section: 'primary',
    streams: [
      { name: 'Kamurasi', type: 'non_muslim' },
      { name: 'Kabalega', type: 'muslim' },
      { name: 'Mandela', type: 'muslim' }
    ]
  },
  'P.3': {
    section: 'primary',
    streams: [
      { name: 'Rwenzori', type: 'non_muslim' },
      { name: 'Elgon', type: 'muslim' },
      { name: 'Moroto', type: 'muslim' }
    ]
  },
  'P.4': {
    section: 'primary',
    streams: [
      { name: 'Silver', type: 'non_muslim' },
      { name: 'Gold', type: 'muslim' },
      { name: 'Diamond', type: 'muslim' }
    ]
  },
  'P.5': {
    section: 'primary',
    streams: [
      { name: 'Orange', type: 'non_muslim' },
      { name: 'Blue', type: 'muslim' },
      { name: 'Pink', type: 'muslim' }
    ]
  },
  'P.6': {
    section: 'primary',
    streams: [
      { name: 'East', type: 'combined' },
      { name: 'West', type: 'combined' }
    ]
  },
  'P.7': {
    section: 'primary',
    streams: [
      { name: 'East', type: 'combined' },
      { name: 'West', type: 'combined' }
    ]
  }
};

export const getAllClasses = () => Object.keys(CLASS_STREAM_MAP);

export const getStreamsForClass = (className) => {
  const config = CLASS_STREAM_MAP[className];
  return config ? config.streams : [];
};

export const getStreamType = (className, streamName) => {
  const config = CLASS_STREAM_MAP[className];
  if (!config) return null;
  const stream = config.streams.find(s => s.name === streamName);
  return stream ? stream.type : null;
};

export const needsTheologyReport = (className, streamName) => {
  if (['P.6', 'P.7'].includes(className)) return false;
  return getStreamType(className, streamName) === 'muslim';
};

// \u2500\u2500\u2500 SUBJECTS \u2500\u2500\u2500
export const NURSERY_SECULAR_SUBJECTS = [
  'Mathematics', 'English Language', 'Literacy', 'Writing',
  'Reading', 'Environment', 'Creative Arts', 'Physical Education'
];
export const NURSERY_ISLAMIC_SUBJECTS = [
  'Quran Recitation', 'Islamic Studies', 'Arabic Language'
];
export const PRIMARY_SECULAR_SUBJECTS = [
  'Mathematics', 'English Language', 'Science', 'Social Studies',
  'Creative Arts & Technology', 'Physical Education', 'Literacy'
];
export const PRIMARY_UPPER_SECULAR_SUBJECTS = [
  'Mathematics', 'English Language', 'Science', 'Social Studies',
  'Creative Arts & Technology', 'Physical Education'
];
export const PRIMARY_ISLAMIC_SUBJECTS = [
  '\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064a\u0645', '\u0627\u0644\u0644\u063a\u0629', '\u0627\u0644\u0641\u0642\u0647', '\u0627\u0644\u062a\u0631\u0628\u064a\u0629', '\u0627\u0644\u0642\u0631\u0627\u0621\u0629'
];

export const getSubjectsForStream = (className, streamName) => {
  const config = CLASS_STREAM_MAP[className];
  if (!config) return [];
  const stream = config.streams.find(s => s.name === streamName);
  if (!stream) return [];

  const section = config.section;
  const streamType = stream.type;

  if (section === 'nursery') {
    const subjects = [...NURSERY_SECULAR_SUBJECTS];
    if (streamType === 'muslim') subjects.push(...NURSERY_ISLAMIC_SUBJECTS);
    return subjects;
  }

  const isUpper = ['P.6', 'P.7'].includes(className);
  const subjects = isUpper ? [...PRIMARY_UPPER_SECULAR_SUBJECTS] : [...PRIMARY_SECULAR_SUBJECTS];
  if (streamType === 'muslim' && !isUpper) subjects.push(...PRIMARY_ISLAMIC_SUBJECTS);
  return subjects;
};

export const isIslamicSubject = (subject) => {
  return [...PRIMARY_ISLAMIC_SUBJECTS, ...NURSERY_ISLAMIC_SUBJECTS].includes(subject);
};

export const GRADE_SCALE = [
  { grade: 'D1', min: 90, max: 100, remarks: 'Distinction' },
  { grade: 'D2', min: 80, max: 89, remarks: 'Very Good' },
  { grade: 'C3', min: 70, max: 79, remarks: 'Good' },
  { grade: 'C4', min: 60, max: 69, remarks: 'Credit' },
  { grade: 'C5', min: 55, max: 59, remarks: 'Fair Credit' },
  { grade: 'C6', min: 50, max: 54, remarks: 'Credit Pass' },
  { grade: 'P7', min: 45, max: 49, remarks: 'Pass' },
  { grade: 'P8', min: 40, max: 44, remarks: 'Weak Pass' },
  { grade: 'F9', min: 0, max: 39, remarks: 'Failure' }
];
