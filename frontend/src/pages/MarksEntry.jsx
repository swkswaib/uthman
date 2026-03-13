import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import {
  getAllClasses,
  getStreamsForClass,
  getSubjectsForStream,
  isIslamicSubject,
  needsTheologyReport,
  GRADE_SCALE,
  CLASS_STREAM_MAP
} from '../utils/schoolConfig';
import './MarksEntry.css';

const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const currentYear = new Date().getFullYear();
const YEARS = [
  `${currentYear - 1}/${currentYear}`,
  `${currentYear}/${currentYear + 1}`,
  `${currentYear + 1}/${currentYear + 2}`
];

const getGrade = (avg) => {
  if (avg === null || avg === undefined || isNaN(avg)) return '-';
  const rounded = Math.round(avg);
  const found = GRADE_SCALE.find(g => rounded >= g.min && rounded <= g.max);
  return found ? found.grade : '-';
};

const getRemarks = (avg) => {
  if (avg === null || avg === undefined || isNaN(avg)) return '';
  const rounded = Math.round(avg);
  const found = GRADE_SCALE.find(g => rounded >= g.min && rounded <= g.max);
  return found ? found.remarks : '';
};

const MarksEntry = () => {
  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);

  // Data
  const [pupils, setPupils] = useState([]);
  const [selectedPupil, setSelectedPupil] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [existingMarks, setExistingMarks] = useState({});

  // UI State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // {type: 'success'|'error', message}
  const [mode, setMode] = useState('individual'); // 'individual' | 'class'
  const [classMarksData, setClassMarksData] = useState({});

  const classes = getAllClasses();

  // Reset downstream when class changes
  useEffect(() => {
    setSelectedStream('');
    setSelectedPupil(null);
    setPupils([]);
    setSubjects([]);
    setMarksData({});
    setClassMarksData({});
  }, [selectedClass]);

  // Load pupils when class + stream selected
  useEffect(() => {
    if (!selectedClass || !selectedStream) return;

    const loadPupils = async () => {
      setLoading(true);
      try {
        const data = await api.getPupils({
          class: selectedClass,
          stream: selectedStream
        });
        const pupilList = data.pupils || data;
        setPupils(Array.isArray(pupilList) ? pupilList : []);
      } catch (err) {
        setPupils([]);
      }
      setLoading(false);
    };

    loadPupils();
    const subs = getSubjectsForStream(selectedClass, selectedStream);
    setSubjects(subs);
    setSelectedPupil(null);
    setMarksData({});
  }, [selectedClass, selectedStream]);

  // Load existing marks for selected pupil
  const loadPupilMarks = useCallback(async (pupilId) => {
    if (!pupilId || !selectedTerm || !selectedYear) return;
    try {
      const data = await api.getMarks({
        pupilId,
        term: selectedTerm,
        academicYear: selectedYear
      });
      const marks = Array.isArray(data) ? data : (data.marks || []);
      const marksMap = {};
      marks.forEach(m => {
        marksMap[m.subject] = {
          botMarks: m.botMarks ?? '',
          motMarks: m.motMarks ?? '',
          eotMarks: m.eotMarks ?? '',
          _id: m._id
        };
      });
      setExistingMarks(marksMap);

      // Initialize marksData from existing
      const initialData = {};
      subjects.forEach(sub => {
        if (marksMap[sub]) {
          initialData[sub] = { ...marksMap[sub] };
        } else {
          initialData[sub] = { botMarks: '', motMarks: '', eotMarks: '' };
        }
      });
      setMarksData(initialData);
    } catch (err) {
      setExistingMarks({});
      const initialData = {};
      subjects.forEach(sub => {
        initialData[sub] = { botMarks: '', motMarks: '', eotMarks: '' };
      });
      setMarksData(initialData);
    }
  }, [selectedTerm, selectedYear, subjects]);

  // When pupil selected, load their marks
  useEffect(() => {
    if (selectedPupil) {
      loadPupilMarks(selectedPupil._id);
    }
  }, [selectedPupil, loadPupilMarks]);

  // Load all class marks in class mode
  const loadClassMarks = useCallback(async () => {
    if (!pupils.length || !selectedTerm || !selectedYear) return;
    setLoading(true);
    try {
      const allMarks = {};
      for (const pupil of pupils) {
        const data = await api.getMarks({
          pupilId: pupil._id,
          term: selectedTerm,
          academicYear: selectedYear
        });
        const marks = Array.isArray(data) ? data : (data.marks || []);
        const pupilMarks = {};
        subjects.forEach(sub => {
          const found = marks.find(m => m.subject === sub);
          pupilMarks[sub] = found
            ? { botMarks: found.botMarks ?? '', motMarks: found.motMarks ?? '', eotMarks: found.eotMarks ?? '' }
            : { botMarks: '', motMarks: '', eotMarks: '' };
        });
        allMarks[pupil._id] = pupilMarks;
      }
      setClassMarksData(allMarks);
    } catch (err) {
      setClassMarksData({});
    }
    setLoading(false);
  }, [pupils, selectedTerm, selectedYear, subjects]);

  useEffect(() => {
    if (mode === 'class' && pupils.length && subjects.length) {
      loadClassMarks();
    }
  }, [mode, pupils, subjects, loadClassMarks]);

  // Handle individual mark change
  const handleMarkChange = (subject, field, value) => {
    const numVal = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value) || 0));
    setMarksData(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: numVal }
    }));
    setSaveStatus(null);
  };

  // Handle class-wide mark change
  const handleClassMarkChange = (pupilId, subject, field, value) => {
    const numVal = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value) || 0));
    setClassMarksData(prev => ({
      ...prev,
      [pupilId]: {
        ...prev[pupilId],
        [subject]: {
          ...(prev[pupilId]?.[subject] || { botMarks: '', motMarks: '', eotMarks: '' }),
          [field]: numVal
        }
      }
    }));
    setSaveStatus(null);
  };

  // Calculate totals for a subject row
  const calcTotal = (bot, mot, eot) => {
    const b = parseFloat(bot) || 0;
    const m = parseFloat(mot) || 0;
    const e = parseFloat(eot) || 0;
    if (bot === '' && mot === '' && eot === '') return null;
    return b + m + e;
  };

  const calcAverage = (bot, mot, eot) => {
    const b = parseFloat(bot) || 0;
    const m = parseFloat(mot) || 0;
    const e = parseFloat(eot) || 0;
    const count = (bot !== '' ? 1 : 0) + (mot !== '' ? 1 : 0) + (eot !== '' ? 1 : 0);
    if (count === 0) return null;
    return (b + m + e) / count;
  };

  // Save individual pupil marks
  const handleSave = async () => {
    if (!selectedPupil) return;
    setSaving(true);
    setSaveStatus(null);

    const marksToSave = [];
    for (const subject of subjects) {
      const data = marksData[subject];
      if (!data) continue;

      if (isIslamicSubject(subject)) {
        // Islamic: single mark stored in botMarks field, replicated to all 3 so averageMarks = the mark
        if (data.botMarks === '') continue;
        const val = Number(data.botMarks);
        marksToSave.push({
          pupilId: selectedPupil._id,
          subject,
          subjectCategory: 'islamic',
          botMarks: val, motMarks: val, eotMarks: val,
          term: selectedTerm,
          academicYear: selectedYear
        });
      } else {
        // Secular: BOT/MOT/EOT
        if (data.botMarks === '' && data.motMarks === '' && data.eotMarks === '') continue;
        marksToSave.push({
          pupilId: selectedPupil._id,
          subject,
          subjectCategory: 'secular',
          botMarks: data.botMarks === '' ? 0 : Number(data.botMarks),
          motMarks: data.motMarks === '' ? 0 : Number(data.motMarks),
          eotMarks: data.eotMarks === '' ? 0 : Number(data.eotMarks),
          term: selectedTerm,
          academicYear: selectedYear
        });
      }
    }

    if (marksToSave.length === 0) {
      setSaveStatus({ type: 'error', message: 'No marks to save' });
      setSaving(false);
      return;
    }

    try {
      const result = await api.bulkEnterMarks(marksToSave);
      if (result.errors && result.errors.length > 0) {
        setSaveStatus({ type: 'error', message: `Saved with ${result.errors.length} error(s)` });
      } else {
        setSaveStatus({ type: 'success', message: `Saved ${marksToSave.length} subject(s) successfully` });
        loadPupilMarks(selectedPupil._id);
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Failed to save marks' });
    }
    setSaving(false);
  };

  // Save all class marks
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);

    const marksToSave = [];
    for (const pupil of pupils) {
      const pupilMarks = classMarksData[pupil._id];
      if (!pupilMarks) continue;
      for (const subject of subjects) {
        const data = pupilMarks[subject];
        if (!data) continue;

        if (isIslamicSubject(subject)) {
          if (data.botMarks === '') continue;
          const val = Number(data.botMarks);
          marksToSave.push({
            pupilId: pupil._id,
            subject,
            subjectCategory: 'islamic',
            botMarks: val, motMarks: val, eotMarks: val,
            term: selectedTerm,
            academicYear: selectedYear
          });
        } else {
          if (data.botMarks === '' && data.motMarks === '' && data.eotMarks === '') continue;
          marksToSave.push({
            pupilId: pupil._id,
            subject,
            subjectCategory: 'secular',
            botMarks: data.botMarks === '' ? 0 : Number(data.botMarks),
            motMarks: data.motMarks === '' ? 0 : Number(data.motMarks),
            eotMarks: data.eotMarks === '' ? 0 : Number(data.eotMarks),
            term: selectedTerm,
            academicYear: selectedYear
          });
        }
      }
    }

    if (marksToSave.length === 0) {
      setSaveStatus({ type: 'error', message: 'No marks to save' });
      setSaving(false);
      return;
    }

    try {
      const result = await api.bulkEnterMarks(marksToSave);
      if (result.errors && result.errors.length > 0) {
        setSaveStatus({ type: 'error', message: `Saved with ${result.errors.length} error(s)` });
      } else {
        setSaveStatus({ type: 'success', message: `Saved marks for ${pupils.length} pupil(s) successfully` });
        loadClassMarks();
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Failed to save class marks' });
    }
    setSaving(false);
  };

  const streams = selectedClass ? getStreamsForClass(selectedClass) : [];
  const hasIslamic = selectedClass && selectedStream && needsTheologyReport(selectedClass, selectedStream);
  const secularSubjects = subjects.filter(s => !isIslamicSubject(s));
  const islamicSubjects = subjects.filter(s => isIslamicSubject(s));

  return (
    <div className="marks-entry">
      <div className="marks-entry-header">
        <h2><i className="fas fa-edit"></i> Enter Marks</h2>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'individual' ? 'active' : ''}`}
            onClick={() => setMode('individual')}
          >
            <i className="fas fa-user"></i> Individual Pupil
          </button>
          <button
            className={`mode-btn ${mode === 'class' ? 'active' : ''}`}
            onClick={() => setMode('class')}
          >
            <i className="fas fa-users"></i> Whole Class
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="marks-filters">
        <div className="filter-group">
          <label>Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Stream</label>
          <select value={selectedStream} onChange={e => setSelectedStream(e.target.value)} disabled={!selectedClass}>
            <option value="">Select Stream</option>
            {streams.map(s => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.type === 'muslim' ? 'Muslim' : s.type === 'non_muslim' ? 'Non-Muslim' : 'Combined'})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Year</label>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stream Type Badge */}
      {selectedStream && (
        <div className="stream-info">
          <span className={`stream-badge ${hasIslamic ? 'muslim' : 'secular'}`}>
            {hasIslamic ? 'Muslim Stream — Secular + Islamic Subjects' : 'Secular Subjects Only'}
          </span>
          <span className="subject-count">{subjects.length} subjects</span>
        </div>
      )}

      {loading && <div className="marks-loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>}

      {/* ──────────── INDIVIDUAL MODE ──────────── */}
      {mode === 'individual' && selectedClass && selectedStream && !loading && (
        <>
          {/* Pupil Selection */}
          <div className="pupil-selector">
            <label>Select Pupil</label>
            <select
              value={selectedPupil?._id || ''}
              onChange={e => {
                const p = pupils.find(p => p._id === e.target.value);
                setSelectedPupil(p || null);
              }}
            >
              <option value="">-- Choose a pupil --</option>
              {pupils.map(p => (
                <option key={p._id} value={p._id}>
                  {p.admissionNumber} — {p.name}
                </option>
              ))}
            </select>
            {pupils.length === 0 && <span className="no-data">No pupils found in this stream</span>}
          </div>

          {selectedPupil && subjects.length > 0 && (
            <>
              <div className="pupil-info-bar">
                <span><strong>{selectedPupil.name}</strong></span>
                <span>{selectedClass} - {selectedStream}</span>
                <span>{selectedTerm} | {selectedYear}</span>
              </div>

              {/* Secular Subjects Table */}
              <div className="marks-table-section">
                <h3>Secular Subjects</h3>
                <div className="marks-table-wrapper">
                  <table className="marks-table">
                    <thead>
                      <tr>
                        <th className="col-subject">Subject</th>
                        <th className="col-marks">BOT</th>
                        <th className="col-marks">MOT</th>
                        <th className="col-marks">EOT</th>
                        <th className="col-calc">Total</th>
                        <th className="col-calc">Average</th>
                        <th className="col-grade">Grade</th>
                        <th className="col-remarks">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {secularSubjects.map(sub => {
                        const d = marksData[sub] || { botMarks: '', motMarks: '', eotMarks: '' };
                        const total = calcTotal(d.botMarks, d.motMarks, d.eotMarks);
                        const avg = calcAverage(d.botMarks, d.motMarks, d.eotMarks);
                        return (
                          <tr key={sub}>
                            <td className="col-subject">{sub}</td>
                            <td className="col-marks">
                              <input
                                type="number"
                                min="0" max="100"
                                value={d.botMarks}
                                onChange={e => handleMarkChange(sub, 'botMarks', e.target.value)}
                                placeholder="0"
                              />
                            </td>
                            <td className="col-marks">
                              <input
                                type="number"
                                min="0" max="100"
                                value={d.motMarks}
                                onChange={e => handleMarkChange(sub, 'motMarks', e.target.value)}
                                placeholder="0"
                              />
                            </td>
                            <td className="col-marks">
                              <input
                                type="number"
                                min="0" max="100"
                                value={d.eotMarks}
                                onChange={e => handleMarkChange(sub, 'eotMarks', e.target.value)}
                                placeholder="0"
                              />
                            </td>
                            <td className="col-calc">{total !== null ? total : '-'}</td>
                            <td className="col-calc">{avg !== null ? avg.toFixed(1) : '-'}</td>
                            <td className="col-grade">{getGrade(avg)}</td>
                            <td className="col-remarks">{getRemarks(avg)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Islamic Subjects Table — single mark per subject */}
              {hasIslamic && islamicSubjects.length > 0 && (
                <div className="marks-table-section islamic-section">
                  <h3 dir="rtl">المواد الإسلامية — Islamic Subjects</h3>
                  <div className="marks-table-wrapper">
                    <table className="marks-table islamic-table" dir="rtl">
                      <thead>
                        <tr>
                          <th className="col-subject">المواد</th>
                          <th className="col-calc">الدرجة الكبرى</th>
                          <th className="col-marks">الدرجة الصغرى</th>
                          <th className="col-grade">النسب</th>
                          <th className="col-remarks">الملاحظة</th>
                          <th>توقيع المدرس</th>
                        </tr>
                      </thead>
                      <tbody>
                        {islamicSubjects.map(sub => {
                          const d = marksData[sub] || { botMarks: '' };
                          const marks = d.botMarks !== '' ? Number(d.botMarks) : null;
                          return (
                            <tr key={sub}>
                              <td className="col-subject">{sub}</td>
                              <td className="col-calc">١٠٠</td>
                              <td className="col-marks">
                                <input
                                  type="number"
                                  min="0" max="100"
                                  value={d.botMarks}
                                  onChange={e => handleMarkChange(sub, 'botMarks', e.target.value)}
                                  placeholder="٠"
                                />
                              </td>
                              <td className="col-grade">{getGrade(marks)}</td>
                              <td className="col-remarks">{getRemarks(marks)}</td>
                              <td></td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="summary-row">
                          <td className="col-subject bold">المجموع</td>
                          <td className="col-calc bold">٥٠٠</td>
                          <td className="col-marks bold">
                            {islamicSubjects.reduce((sum, sub) => {
                              const v = marksData[sub]?.botMarks;
                              return sum + (v !== '' && v !== undefined ? Number(v) : 0);
                            }, 0) || '-'}
                          </td>
                          <td colSpan="3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="marks-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Marks</>}
                </button>
                {saveStatus && (
                  <div className={`save-status ${saveStatus.type}`}>
                    <i className={`fas ${saveStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {saveStatus.message}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ──────────── CLASS MODE ──────────── */}
      {mode === 'class' && selectedClass && selectedStream && !loading && pupils.length > 0 && subjects.length > 0 && (
        <>
          <div className="class-mode-info">
            <span>{pupils.length} pupils | {subjects.length} subjects</span>
          </div>

          {/* One table per subject */}
          {secularSubjects.map(sub => (
            <div key={sub} className="class-subject-table">
              <h4>{sub}</h4>
              <div className="marks-table-wrapper">
                <table className="marks-table compact">
                  <thead>
                    <tr>
                      <th className="col-name">Pupil</th>
                      <th className="col-marks">BOT</th>
                      <th className="col-marks">MOT</th>
                      <th className="col-marks">EOT</th>
                      <th className="col-calc">Avg</th>
                      <th className="col-grade">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pupils.map(pupil => {
                      const d = classMarksData[pupil._id]?.[sub] || { botMarks: '', motMarks: '', eotMarks: '' };
                      const avg = calcAverage(d.botMarks, d.motMarks, d.eotMarks);
                      return (
                        <tr key={pupil._id}>
                          <td className="col-name">{pupil.name}</td>
                          <td className="col-marks">
                            <input type="number" min="0" max="100" value={d.botMarks}
                              onChange={e => handleClassMarkChange(pupil._id, sub, 'botMarks', e.target.value)} placeholder="0" />
                          </td>
                          <td className="col-marks">
                            <input type="number" min="0" max="100" value={d.motMarks}
                              onChange={e => handleClassMarkChange(pupil._id, sub, 'motMarks', e.target.value)} placeholder="0" />
                          </td>
                          <td className="col-marks">
                            <input type="number" min="0" max="100" value={d.eotMarks}
                              onChange={e => handleClassMarkChange(pupil._id, sub, 'eotMarks', e.target.value)} placeholder="0" />
                          </td>
                          <td className="col-calc">{avg !== null ? avg.toFixed(1) : '-'}</td>
                          <td className="col-grade">{getGrade(avg)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Islamic subjects in class mode — single mark per subject */}
          {hasIslamic && islamicSubjects.map(sub => (
            <div key={sub} className="class-subject-table islamic-section">
              <h4 dir="rtl">{sub}</h4>
              <div className="marks-table-wrapper">
                <table className="marks-table compact" dir="rtl">
                  <thead>
                    <tr>
                      <th className="col-name">الطالب</th>
                      <th className="col-calc">الدرجة الكبرى</th>
                      <th className="col-marks">الدرجة الصغرى</th>
                      <th className="col-grade">النسب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pupils.map(pupil => {
                      const d = classMarksData[pupil._id]?.[sub] || { botMarks: '' };
                      const marks = d.botMarks !== '' ? Number(d.botMarks) : null;
                      return (
                        <tr key={pupil._id}>
                          <td className="col-name">{pupil.name}</td>
                          <td className="col-calc">١٠٠</td>
                          <td className="col-marks">
                            <input type="number" min="0" max="100" value={d.botMarks}
                              onChange={e => handleClassMarkChange(pupil._id, sub, 'botMarks', e.target.value)} placeholder="٠" />
                          </td>
                          <td className="col-grade">{getGrade(marks)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Save All Button */}
          <div className="marks-actions">
            <button className="save-btn save-all" onClick={handleSaveAll} disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving All...</> : <><i className="fas fa-save"></i> Save All Marks</>}
            </button>
            {saveStatus && (
              <div className={`save-status ${saveStatus.type}`}>
                <i className={`fas ${saveStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {saveStatus.message}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedClass && (
        <div className="marks-empty">
          <i className="fas fa-clipboard-list"></i>
          <p>Select a class and stream to start entering marks</p>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
