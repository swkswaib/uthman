require('dotenv').config();
const mongoose = require('mongoose');
const Pupil = require('./models/pupilModel');
const Mark = require('./models/markModel');
const { CLASS_STREAM_MAP, getSubjectsForStream, getSection, getStreamType, needsTheologyReport, PRIMARY_ISLAMIC_SUBJECTS, NURSERY_ISLAMIC_SUBJECTS } = require('./config/schoolConfig');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uthman_primary';

// Random integer between min and max (inclusive)
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Random mark based on performance level
const randMark = (level) => {
  const ranges = {
    excellent: [80, 100],
    good: [60, 85],
    average: [45, 70],
    weak: [25, 55]
  };
  const [min, max] = ranges[level] || ranges.average;
  return randInt(min, max);
};

// Sample names
const MALE_NAMES = [
  'MUTEBI ADAM', 'SSENYONGA IBRAHIM', 'KATO ABDUL', 'OUMA DAVID', 'KAMYA JOHN',
  'MUGISHA YUSUF', 'TUMWINE MOSES', 'NSUBUGA ALI', 'ATUHE MICHAEL', 'BATTE HAKIM',
  'OKELLO SAMUEL', 'MUSOKE RASHID', 'MUWONGE ISMAIL', 'DDUMBA PETER', 'KASOZI RONALD',
  'LUBEGA FAHAD', 'NALWANGA JOSEPH', 'SEKANDI ISSA', 'WAMALA JIMMY', 'KIBUUKA UMAR'
];

const FEMALE_NAMES = [
  'MUKONYEZI HASSAN', 'ATIM SARAH', 'NANSUBUGA FATIMA', 'APIO GRACE', 'NAKATO HALIMA',
  'NAMAZZI AISHA', 'BABIRYE ESTHER', 'NALUBEGA ZAINAB', 'NANTEZA RUTH', 'MUGWANYA SAFIYA',
  'TENDO AMINA', 'KAYAGA HADIJA', 'NABWIRE PEACE', 'KIZZA MARIAM', 'NAGAWA BLESSING',
  'NAKIRYA SUMAYA', 'NASSAZI JULIET', 'NAMULINDWA JOY', 'SSEKO ASHA', 'NDAGIRE ROSE'
];

const PARENT_NAMES = [
  'Mr. Ssenyonga Hassan', 'Mrs. Kato Patricia', 'Mr. Ouma James', 'Mrs. Kamya Rehema',
  'Mr. Mugisha Abdu', 'Mrs. Tumwine Grace', 'Mr. Nsubuga Musa', 'Mrs. Atuhe Florence',
  'Mr. Okello Richard', 'Mrs. Musoke Saida', 'Mr. Muwonge Charles', 'Mrs. Ddumba Hope',
  'Mr. Kasozi Emmanuel', 'Mrs. Lubega Namiiro', 'Mr. Nalwanga Godfrey', 'Mrs. Sekandi Aidah',
  'Mr. Wamala Brian', 'Mrs. Kibuuka Zainabu', 'Mr. Batte Sulaiman', 'Mrs. Mukasa Catherine'
];

const performanceLevels = ['excellent', 'good', 'good', 'average', 'average', 'average', 'weak'];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Pupil.deleteMany({});
    await Mark.deleteMany({});
    console.log('Cleared existing data.');

    let admNo = 1000;
    const allPupils = [];

    // Seed a subset of classes for testing
    const classesToSeed = ['Baby', 'P.1', 'P.3', 'P.5', 'P.6', 'P.7'];

    for (const className of classesToSeed) {
      const classConfig = CLASS_STREAM_MAP[className];
      if (!classConfig) continue;

      for (const stream of classConfig.streams) {
        // Create 5-8 pupils per stream
        const count = randInt(5, 8);
        for (let i = 0; i < count; i++) {
          const isMale = Math.random() > 0.5;
          const nameList = isMale ? MALE_NAMES : FEMALE_NAMES;
          const name = nameList[randInt(0, nameList.length - 1)];
          admNo++;

          const pupil = new Pupil({
            name,
            admissionNumber: `UPS/${admNo}`,
            gender: isMale ? 'MALE' : 'FEMALE',
            class: className,
            stream: stream.name,
            streamType: stream.type,
            section: classConfig.section,
            parentName: PARENT_NAMES[randInt(0, PARENT_NAMES.length - 1)],
            parentContact: `07${randInt(10, 99)}${randInt(100000, 999999)}`,
            isActive: true
          });

          await pupil.save();
          allPupils.push(pupil);
        }
      }
    }

    console.log(`Created ${allPupils.length} pupils.`);

    // Create marks for Term 1, 2025/2026
    const markDocs = [];
    for (const pupil of allPupils) {
      const subjects = getSubjectsForStream(pupil.class, pupil.stream);
      const performanceLevel = performanceLevels[randInt(0, performanceLevels.length - 1)];

      const islamicSubjects = [...PRIMARY_ISLAMIC_SUBJECTS, ...NURSERY_ISLAMIC_SUBJECTS];

      for (const subject of subjects) {
        const isIslamic = islamicSubjects.includes(subject);
        const bot = randMark(performanceLevel);
        const mot = randMark(performanceLevel);
        const eot = randMark(performanceLevel);
        const total = bot + mot + eot;
        const avg = Math.round((total / 3) * 10) / 10;

        // Calculate grade inline to avoid needing pre-save hook
        let grade, gradePoints, remarks;
        if (avg >= 90) { grade = 'D1'; gradePoints = 1; remarks = 'Distinction'; }
        else if (avg >= 80) { grade = 'D2'; gradePoints = 2; remarks = 'Very Good'; }
        else if (avg >= 70) { grade = 'C3'; gradePoints = 3; remarks = 'Good'; }
        else if (avg >= 60) { grade = 'C4'; gradePoints = 4; remarks = 'Credit'; }
        else if (avg >= 55) { grade = 'C5'; gradePoints = 5; remarks = 'Fair Credit'; }
        else if (avg >= 50) { grade = 'C6'; gradePoints = 6; remarks = 'Credit Pass'; }
        else if (avg >= 45) { grade = 'P7'; gradePoints = 7; remarks = 'Pass'; }
        else if (avg >= 40) { grade = 'P8'; gradePoints = 8; remarks = 'Pass'; }
        else { grade = 'F9'; gradePoints = 9; remarks = 'Fail'; }

        markDocs.push({
          pupilId: pupil._id,
          subject,
          subjectCategory: isIslamic ? 'islamic' : 'secular',
          botMarks: bot,
          motMarks: mot,
          eotMarks: eot,
          totalMarks: total,
          averageMarks: avg,
          grade,
          gradePoints,
          remarks,
          term: 'Term 1',
          academicYear: '2025/2026'
        });
      }
    }

    // Bulk insert marks in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < markDocs.length; i += BATCH_SIZE) {
      await Mark.insertMany(markDocs.slice(i, i + BATCH_SIZE));
    }
    const markCount = markDocs.length;

    console.log(`Created ${markCount} mark records.`);
    console.log('Seeding complete!');

    // Print a summary
    for (const className of classesToSeed) {
      const classConfig = CLASS_STREAM_MAP[className];
      for (const stream of classConfig.streams) {
        const count = await Pupil.countDocuments({ class: className, stream: stream.name });
        console.log(`  ${className} - ${stream.name} (${stream.type}): ${count} pupils`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
