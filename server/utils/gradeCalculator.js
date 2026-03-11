// Uthman Primary School - Grade Calculator

// Primary & Nursery Grading Scale
const GRADE_SCALE = [
  { grade: 'D1', min: 90, max: 100, points: 1, remarks: 'Distinction' },
  { grade: 'D2', min: 80, max: 89, points: 2, remarks: 'Very Good' },
  { grade: 'C3', min: 70, max: 79, points: 3, remarks: 'Good' },
  { grade: 'C4', min: 60, max: 69, points: 4, remarks: 'Credit' },
  { grade: 'C5', min: 55, max: 59, points: 5, remarks: 'Fair Credit' },
  { grade: 'C6', min: 50, max: 54, points: 6, remarks: 'Credit Pass' },
  { grade: 'P7', min: 45, max: 49, points: 7, remarks: 'Pass' },
  { grade: 'P8', min: 40, max: 44, points: 8, remarks: 'Weak Pass' },
  { grade: 'F9', min: 0, max: 39, points: 9, remarks: 'Failure' }
];

const calculateGrade = (marks) => {
  if (marks === null || marks === undefined || isNaN(marks)) {
    return { grade: '-', points: 0, remarks: 'No marks' };
  }
  
  const roundedMarks = Math.round(marks);
  
  for (const scale of GRADE_SCALE) {
    if (roundedMarks >= scale.min && roundedMarks <= scale.max) {
      return {
        grade: scale.grade,
        points: scale.points,
        remarks: scale.remarks
      };
    }
  }
  
  return { grade: 'F9', points: 9, remarks: 'Failure' };
};

// Aggregate points → Division (PLE style for P.7)
const calculateDivision = (totalPoints, subjectCount) => {
  if (subjectCount === 0) return { division: '-', description: 'No subjects' };
  
  // Use best 4 subjects' aggregate (lower is better)
  if (totalPoints >= 4 && totalPoints <= 12) {
    return { division: 'I', description: 'First Class' };
  } else if (totalPoints >= 13 && totalPoints <= 23) {
    return { division: 'II', description: 'Second Class' };
  } else if (totalPoints >= 24 && totalPoints <= 29) {
    return { division: 'III', description: 'Third Class' };
  } else if (totalPoints >= 30 && totalPoints <= 34) {
    return { division: 'IV', description: 'Fourth Class' };
  } else {
    return { division: 'U', description: 'Ungraded' };
  }
};

// Generate class teacher comment based on average marks
const generateClassTeacherComment = (averageMarks) => {
  if (averageMarks >= 90) return 'An outstanding performer. Keep it up!';
  if (averageMarks >= 80) return 'Excellent performance. Very impressive work!';
  if (averageMarks >= 70) return 'Good performance. Continue working hard.';
  if (averageMarks >= 60) return 'Fair performance. More effort is needed.';
  if (averageMarks >= 50) return 'Average performance. Must put in extra effort.';
  if (averageMarks >= 40) return 'Below average. Needs serious improvement.';
  return 'Weak performance. Requires urgent attention and support.';
};

// Generate head teacher comment
const generateHeadTeacherComment = (averageMarks) => {
  if (averageMarks >= 80) return 'We are proud of this pupil. Excellent work!';
  if (averageMarks >= 60) return 'A promising pupil. Encouraged to aim higher.';
  if (averageMarks >= 45) return 'More dedication and hard work is needed.';
  return 'Parents/guardians are advised to provide extra support at home.';
};

// Arabic remarks for individual subject marks
const getArabicRemarks = (marks) => {
  if (marks === null || marks === undefined || isNaN(marks)) return '\u0644\u0627 \u062a\u0648\u062c\u062f \u062f\u0631\u062c\u0627\u062a';
  const m = Math.round(marks);
  if (m >= 90) return '\u0645\u0645\u062a\u0627\u0632';
  if (m >= 80) return '\u062c\u064a\u062f \u062c\u062f\u0627\u064b';
  if (m >= 70) return '\u062c\u064a\u062f';
  if (m >= 60) return '\u0645\u0642\u0628\u0648\u0644';
  if (m >= 50) return '\u0648\u0633\u0637';
  if (m >= 40) return '\u0636\u0639\u064a\u0641';
  return '\u0631\u0627\u0633\u0628';
};

// Arabic class supervisor comment
const generateIslamicClassComment = (averageMarks) => {
  if (averageMarks >= 90) return '\u0623\u062f\u0627\u0621 \u0645\u062a\u0645\u064a\u0632 \u0645\u0627 \u0634\u0627\u0621 \u0627\u0644\u0644\u0647. \u0627\u0633\u062a\u0645\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0631\u0627\u0626\u0639!';
  if (averageMarks >= 80) return '\u0623\u062f\u0627\u0621 \u0645\u0645\u062a\u0627\u0632 \u0628\u0627\u0631\u0643 \u0627\u0644\u0644\u0647 \u0641\u064a\u0643. \u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0647\u0627\u062f!';
  if (averageMarks >= 70) return '\u0623\u062f\u0627\u0621 \u062c\u064a\u062f. \u062d\u0627\u0641\u0638 \u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0627\u0643 \u0648\u0632\u062f \u0645\u0646 \u0627\u0644\u0627\u062c\u062a\u0647\u0627\u062f.';
  if (averageMarks >= 60) return '\u0623\u062f\u0627\u0621 \u0645\u0642\u0628\u0648\u0644. \u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u062c\u0647\u062f \u0648\u0627\u0644\u0645\u062b\u0627\u0628\u0631\u0629.';
  if (averageMarks >= 50) return '\u0623\u062f\u0627\u0621 \u0645\u062a\u0648\u0633\u0637. \u064a\u062c\u0628 \u0628\u0630\u0644 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u062c\u0647\u062f \u0641\u064a \u0627\u0644\u062f\u0631\u0627\u0633\u0629.';
  if (averageMarks >= 40) return '\u0623\u062f\u0627\u0621 \u0636\u0639\u064a\u0641. \u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u062a\u062d\u0633\u064a\u0646 \u0643\u0628\u064a\u0631 \u0648\u0645\u062a\u0627\u0628\u0639\u0629 \u0645\u0633\u062a\u0645\u0631\u0629.';
  return '\u0623\u062f\u0627\u0621 \u0636\u0639\u064a\u0641 \u062c\u062f\u0627\u064b. \u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u062f\u0639\u0645 \u062e\u0627\u0635 \u0648\u0645\u062a\u0627\u0628\u0639\u0629 \u0645\u0646 \u0648\u0644\u064a \u0627\u0644\u0623\u0645\u0631.';
};

// Arabic education supervisor comment
const generateIslamicSupervisorComment = (averageMarks) => {
  if (averageMarks >= 80) return '\u0637\u0627\u0644\u0628 \u0645\u062a\u0641\u0648\u0642 \u0645\u0627 \u0634\u0627\u0621 \u0627\u0644\u0644\u0647. \u0646\u0641\u062e\u0631 \u0628\u0645\u0633\u062a\u0648\u0627\u0647 \u0627\u0644\u062f\u0631\u0627\u0633\u064a.';
  if (averageMarks >= 60) return '\u0637\u0627\u0644\u0628 \u0645\u062c\u062a\u0647\u062f. \u0646\u0634\u062c\u0639\u0647 \u0639\u0644\u0649 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u062a\u0642\u062f\u0645.';
  if (averageMarks >= 45) return '\u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0627\u0647\u062a\u0645\u0627\u0645 \u0648\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0645\u0631\u0629.';
  return '\u0646\u0648\u0635\u064a \u0648\u0644\u064a \u0627\u0644\u0623\u0645\u0631 \u0628\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0645\u0631\u0629 \u0648\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u062f\u0639\u0645 \u0627\u0644\u0644\u0627\u0632\u0645.';
};

// Arabic headmaster comment
const generateIslamicHeadComment = (averageMarks) => {
  if (averageMarks >= 80) return '\u0628\u0627\u0631\u0643 \u0627\u0644\u0644\u0647 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0637\u0627\u0644\u0628. \u0623\u062f\u0627\u0621 \u064a\u0633\u062a\u062d\u0642 \u0627\u0644\u062b\u0646\u0627\u0621 \u0648\u0627\u0644\u062a\u0642\u062f\u064a\u0631.';
  if (averageMarks >= 60) return '\u0646\u062a\u0645\u0646\u0649 \u0644\u0647 \u0645\u0632\u064a\u062f\u0627\u064b \u0645\u0646 \u0627\u0644\u062a\u0648\u0641\u064a\u0642 \u0648\u0627\u0644\u0646\u062c\u0627\u062d \u0625\u0646 \u0634\u0627\u0621 \u0627\u0644\u0644\u0647.';
  if (averageMarks >= 45) return '\u0646\u0623\u0645\u0644 \u0623\u0646 \u064a\u0628\u0630\u0644 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u062c\u0647\u062f \u0641\u064a \u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u0642\u0627\u062f\u0645.';
  return '\u0646\u0631\u062c\u0648 \u0645\u0646 \u0648\u0644\u064a \u0627\u0644\u0623\u0645\u0631 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u062c\u0627\u062f\u0629 \u0645\u0639 \u0627\u0644\u0645\u062f\u0631\u0633\u0629.';
};

module.exports = {
  GRADE_SCALE,
  calculateGrade,
  calculateDivision,
  generateClassTeacherComment,
  generateHeadTeacherComment,
  getArabicRemarks,
  generateIslamicClassComment,
  generateIslamicSupervisorComment,
  generateIslamicHeadComment
};
