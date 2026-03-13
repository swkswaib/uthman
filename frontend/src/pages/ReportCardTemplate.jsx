import React from 'react';
import { GRADE_SCALE } from '../utils/schoolConfig';

const ReportCardTemplate = ({ report }) => {
  if (!report || !report.pupil) return null;

  const { pupil, academicInfo, secularSubjects, islamicSubjects, summary, hasTheologyReport, comments } = report;
  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="report-card-page">
      {/* ═══ SECULAR REPORT CARD ═══ */}
      <div className="report-card secular-report">
        {/* School Header */}
        <div className="rc-header">
          <div className="rc-logo">
            <i className="fas fa-school"></i>
          </div>
          <div className="rc-school-info">
            <h1>UTHMAN PRIMARY SCHOOL</h1>
            <p className="rc-motto">"Excellence in Education"</p>
            <p className="rc-address">P.O. Box XXXX | Tel: +256 XXX XXX XXX</p>
          </div>
          <div className="rc-logo">
            <i className="fas fa-book-open"></i>
          </div>
        </div>

        <div className="rc-title-bar">
          <h2>
            {pupil.section === 'nursery' ? 'NURSERY' : 'PRIMARY'} SECTION — END OF TERM REPORT CARD
          </h2>
        </div>

        {/* Pupil Details */}
        <div className="rc-pupil-info">
          <div className="rc-info-grid">
            <div className="rc-info-item">
              <span className="rc-label">Pupil's Name:</span>
              <span className="rc-value">{pupil.name}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Adm No:</span>
              <span className="rc-value">{pupil.admissionNumber}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Class:</span>
              <span className="rc-value">{pupil.class}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Stream:</span>
              <span className="rc-value">{pupil.stream}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Gender:</span>
              <span className="rc-value">{pupil.gender}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Term:</span>
              <span className="rc-value">{academicInfo.term}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Year:</span>
              <span className="rc-value">{academicInfo.academicYear}</span>
            </div>
            <div className="rc-info-item">
              <span className="rc-label">Position:</span>
              <span className="rc-value highlight">{summary.position} out of {summary.totalPupils}</span>
            </div>
          </div>
        </div>

        {/* Secular Subjects Table */}
        <div className="rc-section">
          <h3 className="rc-section-title">ACADEMIC PERFORMANCE — SECULAR SUBJECTS</h3>
          <table className="rc-table">
            <thead>
              <tr>
                <th className="subject-col">Subject</th>
                <th>BOT</th>
                <th>MOT</th>
                <th>EOT</th>
                <th>Total</th>
                <th>Average</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {secularSubjects.length > 0 ? secularSubjects.map((sub, i) => (
                <tr key={i}>
                  <td className="subject-col">{sub.subject}</td>
                  <td>{sub.botMarks ?? '-'}</td>
                  <td>{sub.motMarks ?? '-'}</td>
                  <td>{sub.eotMarks ?? '-'}</td>
                  <td className="bold">{sub.totalMarks ?? '-'}</td>
                  <td className="bold">{sub.averageMarks ?? '-'}</td>
                  <td><span className={`grade-cell grade-${(sub.grade || '').charAt(0).toLowerCase()}`}>{sub.grade || '-'}</span></td>
                  <td className="remarks-cell">{sub.remarks || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="no-data">No marks entered yet</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="summary-row">
                <td className="subject-col bold">TOTAL / AVERAGE</td>
                <td colSpan="3"></td>
                <td className="bold">{summary.secularTotal || '-'}</td>
                <td className="bold highlight">{summary.secularAverage || '-'}%</td>
                <td><span className={`grade-cell grade-${(summary.overallGrade || '').charAt(0).toLowerCase()}`}>{summary.overallGrade || '-'}</span></td>
                <td>{summary.overallRemarks || '-'}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Performance Summary */}
        <div className="rc-summary-bar">
          <div className="rc-summary-item">
            <span>Aggregate Points:</span>
            <strong>{summary.secularAggregatePoints || '-'}</strong>
          </div>
          {summary.division && (
            <div className="rc-summary-item">
              <span>Division:</span>
              <strong>{summary.division.division} ({summary.division.description})</strong>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="rc-comments">
          <div className="rc-comment-box">
            <label>Class Teacher's Comment:</label>
            <p>{comments.classTeacher}</p>
            <div className="rc-signature">Signature: ____________________</div>
          </div>
          <div className="rc-comment-box">
            <label>Head Teacher's Comment:</label>
            <p>{comments.headTeacher}</p>
            <div className="rc-signature">Signature: ____________________</div>
          </div>
        </div>

        {/* Grading Scale */}
        <div className="rc-grading-scale">
          <h4>Grading Scale</h4>
          <table>
            <tbody>
              <tr>
                {GRADE_SCALE.map(g => <th key={g.grade}>{g.grade}</th>)}
              </tr>
              <tr>
                {GRADE_SCALE.map(g => <td key={g.grade}>{g.min}-{g.max}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="rc-footer">
          <p>Date: {currentDate}</p>
          <p>Next Term Begins: ____________________</p>
        </div>
      </div>

      {/* ═══ ISLAMIC THEOLOGY REPORT CARD (only for Muslim streams, not P.6/P.7) ═══ */}
      {hasTheologyReport && (
        <div className="report-card islamic-report">
          {/* School Header */}
          <div className="rc-header islamic-header">
            <div className="rc-logo">
              <i className="fas fa-mosque"></i>
            </div>
            <div className="rc-school-info">
                <h1>بسم الله الرحمن الرحيم</h1>
              <h1>UTHMAN MIXED PRIMARY SCHOOL</h1>
              <h3>END OF TERM ONE ACADEMIC REPORT CARD</h3>
              <p className="rc-motto">P.O BOX 477 MASINDI Tel: 0778600597, 0703465464</p>
              
            </div>
           
          </div>

          <div className="rc-title-bar islamic-title">
            <h2>قسم السفلي</h2>
          </div>

          {/* Pupil Info (brief) */}
          <div className="rc-pupil-info">
            <div className="rc-info-grid">
              <div className="rc-info-item">
                <span className="rc-label">الاسم:</span>
                <span className="rc-value">{pupil.name}</span>
              </div>
              <div className="rc-info-item">
                <span className="rc-label">الفصل:</span>
                <span className="rc-value">{pupil.class} </span>
              </div>
               <div className="rc-info-item">
                <span className="rc-label">عام:</span>
                <span className="rc-value">{academicInfo.academicYear}</span>
              </div>
              <div className="rc-info-item">
                <span className="rc-label">الدرجة:</span>
                <span className="rc-value">{summary.position} </span>
              </div>
              <div className="rc-info-item">
                <span className="rc-label">عدد التلاميذ:</span>
                <span className="rc-value">{summary.totalPupils} </span>
              </div>
            </div>
          </div>

          {/* Islamic Subjects Table */}
          <div className="rc-section">
            <h3 className="rc-section-title islamic-section-title">ISLAMIC THEOLOGY SUBJECTS</h3>
            <table className="rc-table islamic-table">
              <thead>
                <tr>
                  <th className="subject-col">المواد</th>
                  <th>الدرجة الكبرى</th>
                  <th>الدرجة الصغرى</th>
                  <th>النسب</th>
                  <th>الملاحظة</th>
                  <th>توقيع المدرس</th>
                  
                </tr>
              </thead>
              <tbody>
                {islamicSubjects.length > 0 ? islamicSubjects.map((sub, i) => (
                  <tr key={i}>
                    <td className="subject-col">{sub.subject}</td>
                    <td className="bold">١٠٠</td>
                    <td className="bold">{sub.averageMarks ?? '-'}</td>
                    <td><span className={`grade-cell grade-${(sub.grade || '').charAt(0).toLowerCase()}`}>{sub.grade || '-'}</span></td>
                    <td className="remarks-cell">{sub.arabicRemarks || sub.remarks || '-'}</td>
                    <td></td>
                    
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="no-data">No Islamic theology marks entered yet</td></tr>
                )}
              </tbody>
              {islamicSubjects.length > 0 && (
                <tfoot>
                  <tr className="summary-row">
                    <td className="subject-col bold">المجموع</td>
                    <td className="bold">٥٠٠</td>
                    <td className="bold highlight">{islamicSubjects.reduce((sum, s) => sum + (s.averageMarks || 0), 0) || '-'}</td>
                    <td></td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Islamic Teacher Comments */}
          <div className="rc-comments">
            <div className="rc-comment-box">
              <label>ملاحظات مشرف الفصل:</label>
              <p>{comments.islamicClassSupervisor}</p>
            </div>
          </div>
         
          <div className="rc-comments">
            <div className="rc-comment-box">
              <label>ملاحظات مشرف التعليم:</label>
              <p>{comments.islamicEducationSupervisor}</p>
            </div>
          </div>
           <div className="rc-comments">
            <div className="rc-comment-box">
              <label>توقيع مدير المدرسة:</label>
              <p>{comments.islamicHeadmaster}</p>
            </div>
          </div>
          {/* Grading Scale */}
        <div className="rc-grading-scale">
          <h4>Grading Scale</h4>
          <table>
            <tbody>
              <tr>
                {GRADE_SCALE.map(g => <th key={g.grade}>{g.grade}</th>)}
              </tr>
              <tr>
                {GRADE_SCALE.map(g => <td key={g.grade}>{g.min}-{g.max}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
           <div className="rc-footer">
            <p>THIS TERM ENDS ON: {currentDate} AND NEXT TERM BEGINS ON :</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardTemplate;
