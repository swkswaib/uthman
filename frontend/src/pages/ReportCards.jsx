import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { api } from '../utils/api';
import { getAllClasses, getStreamsForClass, needsTheologyReport, GRADE_SCALE } from '../utils/schoolConfig';
import ReportCardTemplate from './ReportCardTemplate';
import './ReportCards.css';

const ReportCards = () => {
  const [mode, setMode] = useState('individual'); // individual | class
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [pupils, setPupils] = useState([]);
  const [selectedPupilId, setSelectedPupilId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [classReports, setClassReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef(null);

  const classes = getAllClasses();

  const handleClassChange = useCallback(async (className) => {
    setSelectedClass(className);
    setSelectedStream('');
    setSelectedPupilId('');
    setReportData(null);
    setClassReports([]);

    if (className) {
      try {
        const data = await api.getPupils({ class: className });
        setPupils(Array.isArray(data) ? data : []);
      } catch {
        setPupils([]);
      }
    } else {
      setPupils([]);
    }
  }, []);

  const handleStreamChange = useCallback(async (streamName) => {
    setSelectedStream(streamName);
    setSelectedPupilId('');
    setReportData(null);
    setClassReports([]);

    if (selectedClass && streamName) {
      try {
        const data = await api.getPupils({ class: selectedClass, stream: streamName });
        setPupils(Array.isArray(data) ? data : []);
      } catch {
        setPupils([]);
      }
    }
  }, [selectedClass]);

  const generateIndividualReport = async () => {
    if (!selectedPupilId) {
      setError('Please select a pupil');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getPupilReport(selectedPupilId, {
        term: selectedTerm,
        academicYear
      });
      if (data.message) {
        setError(data.message);
      } else {
        setReportData(data);
      }
    } catch (err) {
      setError('Failed to generate report. Make sure the server is running.');
    }
    setLoading(false);
  };

  const generateClassReport = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = { class: selectedClass, term: selectedTerm, academicYear };
      if (selectedStream) params.stream = selectedStream;
      const data = await api.getClassReports(params);
      if (data.message) {
        setError(data.message);
      } else {
        setClassReports(data.reports || []);
      }
    } catch (err) {
      setError('Failed to generate class reports. Make sure the server is running.');
    }
    setLoading(false);
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setLoading(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      // Each .report-card is a separate card (secular or islamic) — render each on its own page
      const cards = reportRef.current.querySelectorAll('.report-card');
      let pageAdded = false;

      for (let i = 0; i < cards.length; i++) {
        const canvas = await html2canvas(cards[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        if (pageAdded) pdf.addPage();
        pageAdded = true;

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If the card is taller than one page, scale it to fit
        const maxHeight = 277;
        if (imgHeight > maxHeight) {
          const scaledWidth = imgWidth * (maxHeight / imgHeight);
          pdf.addImage(imgData, 'PNG', 10 + (190 - scaledWidth) / 2, 10, scaledWidth, maxHeight);
        } else {
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
      }

      const fileName = mode === 'class'
        ? `Uthman_PS_${selectedClass}_${selectedStream || 'All'}_${selectedTerm}_${academicYear}.pdf`
        : `Uthman_PS_Report_${reportData?.pupil?.name || 'Unknown'}_${selectedTerm}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      setError('Error generating PDF');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const streams = selectedClass ? getStreamsForClass(selectedClass) : [];
  const filteredPupils = selectedStream
    ? pupils.filter(p => p.stream === selectedStream)
    : pupils;
  const reportsToShow = mode === 'individual' && reportData ? [reportData] : classReports;

  return (
    <div className="report-cards-page">
      {/* Controls Panel */}
      <div className="report-controls no-print">
        <h2><i className="fas fa-file-alt"></i> Report Card Generator</h2>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'individual' ? 'active' : ''}`}
            onClick={() => { setMode('individual'); setReportData(null); setClassReports([]); }}
          >
            <i className="fas fa-user"></i> Individual Pupil
          </button>
          <button
            className={`mode-btn ${mode === 'class' ? 'active' : ''}`}
            onClick={() => { setMode('class'); setReportData(null); setClassReports([]); }}
          >
            <i className="fas fa-users"></i> Entire Class
          </button>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="filter-group">
            <label>Class</label>
            <select value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Stream</label>
            <select value={selectedStream} onChange={e => handleStreamChange(e.target.value)} disabled={!selectedClass}>
              <option value="">All Streams</option>
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
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Academic Year</label>
            <select value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
              <option>2025/2026</option>
              <option>2024/2025</option>
              <option>2026/2027</option>
            </select>
          </div>
        </div>

        {/* Pupil Selector (individual mode) */}
        {mode === 'individual' && (
          <div className="filter-row">
            <div className="filter-group full-width">
              <label>Select Pupil</label>
              <select value={selectedPupilId} onChange={e => setSelectedPupilId(e.target.value)} disabled={!selectedClass}>
                <option value="">Select a pupil...</option>
                {filteredPupils.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {p.admissionNumber} ({p.stream})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-row">
          <button
            className="btn-generate"
            onClick={mode === 'individual' ? generateIndividualReport : generateClassReport}
            disabled={loading || (!selectedClass)}
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {reportsToShow.length > 0 && (
            <>
              <button className="btn-pdf" onClick={exportToPDF} disabled={loading}>
                <i className="fas fa-file-pdf"></i> Export PDF
              </button>
              <button className="btn-print" onClick={handlePrint}>
                <i className="fas fa-print"></i> Print
              </button>
            </>
          )}
        </div>

        {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}

        {/* Stream Info */}
        {selectedStream && (
          <div className="stream-info">
            <span className={`stream-badge ${needsTheologyReport(selectedClass, selectedStream) ? 'muslim' : ['P.6','P.7'].includes(selectedClass) ? 'combined' : 'non-muslim'}`}>
              {needsTheologyReport(selectedClass, selectedStream) 
                ? '☪ Muslim Stream — Secular + Islamic Theology' 
                : ['P.6','P.7'].includes(selectedClass) 
                  ? '📚 Combined Stream — Secular Only (No Theology Report)'
                  : '📖 Non-Muslim Stream — Secular Only'}
            </span>
          </div>
        )}
      </div>

      {/* Report Display Area */}
      {reportsToShow.length > 0 && (
        <div className="report-display" ref={reportRef}>
          {reportsToShow.map((report, idx) => (
            <ReportCardTemplate key={idx} report={report} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {reportsToShow.length === 0 && !loading && !error && (
        <div className="empty-state no-print">
          <i className="fas fa-graduation-cap"></i>
          <h3>Uthman Primary School</h3>
          <p>Select a class and pupil, then click "Generate Report" to create report cards.</p>
          <div className="grade-scale-reference">
            <h4>Grading Scale</h4>
            <table>
              <thead>
                <tr>
                  {GRADE_SCALE.map(g => <th key={g.grade}>{g.grade}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {GRADE_SCALE.map(g => <td key={g.grade}>{g.min}-{g.max}</td>)}
                </tr>
                <tr>
                  {GRADE_SCALE.map(g => <td key={g.grade} className="remarks">{g.remarks}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCards;
