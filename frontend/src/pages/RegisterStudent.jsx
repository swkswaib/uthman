import React, { useState } from 'react';
import { api } from '../utils/api';
import {
  getAllClasses,
  getStreamsForClass,
  CLASS_STREAM_MAP
} from '../utils/schoolConfig';
import './RegisterStudent.css';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    admissionNumber: '',
    gender: '',
    dateOfBirth: '',
    class: '',
    stream: '',
    parentName: '',
    parentContact: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type, message }

  // Registered pupils list
  const [pupils, setPupils] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [loadingPupils, setLoadingPupils] = useState(false);
  const [showList, setShowList] = useState(false);

  const classes = getAllClasses();
  const streams = formData.class ? getStreamsForClass(formData.class) : [];
  const filterStreams = filterClass ? getStreamsForClass(filterClass) : [];

  // Get section & stream type label
  const getStreamInfo = () => {
    if (!formData.class || !formData.stream) return null;
    const config = CLASS_STREAM_MAP[formData.class];
    if (!config) return null;
    const stream = config.streams.find(s => s.name === formData.stream);
    if (!stream) return null;
    const typeLabel = stream.type === 'muslim' ? 'Muslim' : stream.type === 'non_muslim' ? 'Non-Muslim' : 'Combined';
    return { section: config.section, type: stream.type, typeLabel };
  };

  const streamInfo = getStreamInfo();

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Reset stream when class changes
      if (field === 'class') updated.stream = '';
      return updated;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setStatus(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Pupil name is required';
    if (!formData.admissionNumber.trim()) errs.admissionNumber = 'Admission number is required';
    if (!formData.gender) errs.gender = 'Gender is required';
    if (!formData.class) errs.class = 'Class is required';
    if (!formData.stream) errs.stream = 'Stream is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = {
        name: formData.name.trim(),
        admissionNumber: formData.admissionNumber.trim(),
        gender: formData.gender,
        class: formData.class,
        stream: formData.stream,
        parentName: formData.parentName.trim() || undefined,
        parentContact: formData.parentContact.trim() || undefined
      };
      if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;

      const result = await api.createPupil(payload);

      if (result.message && !result._id) {
        // Server returned an error
        setStatus({ type: 'error', message: result.message });
      } else {
        setStatus({ type: 'success', message: `${result.name} registered successfully! (${result.admissionNumber})` });
        // Reset form but keep class/stream for batch registration
        setFormData(prev => ({
          ...prev,
          name: '',
          admissionNumber: '',
          gender: '',
          dateOfBirth: '',
          parentName: '',
          parentContact: ''
        }));
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to register pupil. Please try again.' });
    }
    setSubmitting(false);
  };

  // Fetch pupils by class/stream
  const fetchPupils = async () => {
    if (!filterClass) return;
    setLoadingPupils(true);
    try {
      const params = { class: filterClass };
      if (filterStream) params.stream = filterStream;
      const data = await api.getPupils(params);
      const list = Array.isArray(data) ? data : (data.pupils || []);
      setPupils(list);
      setShowList(true);
    } catch (err) {
      setPupils([]);
    }
    setLoadingPupils(false);
  };

  return (
    <div className="register-student">
      {/* ──── HEADER ──── */}
      <div className="rs-header">
        <h2><i className="fas fa-user-plus"></i> Register Pupil</h2>
      </div>

      <div className="rs-layout">
        {/* ──── REGISTRATION FORM ──── */}
        <div className="rs-form-card">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="rs-section">
              <h3><i className="fas fa-user"></i> Personal Information</h3>
              <div className="rs-fields">
                <div className={`rs-field ${errors.name ? 'has-error' : ''}`}>
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. NAKATO SARAH"
                  />
                  {errors.name && <span className="rs-error">{errors.name}</span>}
                </div>

                <div className={`rs-field ${errors.admissionNumber ? 'has-error' : ''}`}>
                  <label>Admission Number <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.admissionNumber}
                    onChange={e => handleChange('admissionNumber', e.target.value)}
                    placeholder="e.g. UPS/2026/001"
                  />
                  {errors.admissionNumber && <span className="rs-error">{errors.admissionNumber}</span>}
                </div>

                <div className={`rs-field ${errors.gender ? 'has-error' : ''}`}>
                  <label>Gender <span className="required">*</span></label>
                  <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  {errors.gender && <span className="rs-error">{errors.gender}</span>}
                </div>

                <div className="rs-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="rs-section">
              <h3><i className="fas fa-school"></i> Academic Information</h3>
              <div className="rs-fields">
                <div className={`rs-field ${errors.class ? 'has-error' : ''}`}>
                  <label>Class <span className="required">*</span></label>
                  <select value={formData.class} onChange={e => handleChange('class', e.target.value)}>
                    <option value="">Select Class</option>
                    <optgroup label="Nursery">
                      {classes.filter(c => CLASS_STREAM_MAP[c].section === 'nursery').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Primary">
                      {classes.filter(c => CLASS_STREAM_MAP[c].section === 'primary').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  </select>
                  {errors.class && <span className="rs-error">{errors.class}</span>}
                </div>

                <div className={`rs-field ${errors.stream ? 'has-error' : ''}`}>
                  <label>Stream <span className="required">*</span></label>
                  <select
                    value={formData.stream}
                    onChange={e => handleChange('stream', e.target.value)}
                    disabled={!formData.class}
                  >
                    <option value="">Select Stream</option>
                    {streams.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.type === 'muslim' ? 'Muslim' : s.type === 'non_muslim' ? 'Non-Muslim' : 'Combined'})
                      </option>
                    ))}
                  </select>
                  {errors.stream && <span className="rs-error">{errors.stream}</span>}
                </div>
              </div>

              {/* Stream type badge */}
              {streamInfo && (
                <div className="rs-stream-badge-row">
                  <span className={`rs-badge section-${streamInfo.section}`}>
                    {streamInfo.section === 'nursery' ? 'Nursery Section' : 'Primary Section'}
                  </span>
                  <span className={`rs-badge type-${streamInfo.type}`}>
                    {streamInfo.typeLabel} Stream
                  </span>
                </div>
              )}
            </div>

            {/* Parent/Guardian */}
            <div className="rs-section">
              <h3><i className="fas fa-phone-alt"></i> Parent / Guardian</h3>
              <div className="rs-fields">
                <div className="rs-field">
                  <label>Parent Name</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={e => handleChange('parentName', e.target.value)}
                    placeholder="e.g. MR. SSEBAGGALA YUSUF"
                  />
                </div>

                <div className="rs-field">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={formData.parentContact}
                    onChange={e => handleChange('parentContact', e.target.value)}
                    placeholder="e.g. 0772 123456"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="rs-actions">
              <button type="submit" className="rs-submit" disabled={submitting}>
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Registering...</>
                  : <><i className="fas fa-user-plus"></i> Register Pupil</>
                }
              </button>
              <button
                type="button"
                className="rs-reset"
                onClick={() => {
                  setFormData({ name: '', admissionNumber: '', gender: '', dateOfBirth: '', class: '', stream: '', parentName: '', parentContact: '' });
                  setErrors({});
                  setStatus(null);
                }}
              >
                <i className="fas fa-redo"></i> Reset Form
              </button>
            </div>

            {/* Status message */}
            {status && (
              <div className={`rs-status ${status.type}`}>
                <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {status.message}
              </div>
            )}
          </form>
        </div>

        {/* ──── PUPIL LIST PANEL ──── */}
        <div className="rs-list-card">
          <h3><i className="fas fa-list"></i> Registered Pupils</h3>

          <div className="rs-list-filters">
            <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterStream(''); setPupils([]); setShowList(false); }}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={filterStream} onChange={e => setFilterStream(e.target.value)} disabled={!filterClass}>
              <option value="">All Streams</option>
              {filterStreams.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>

            <button className="rs-fetch-btn" onClick={fetchPupils} disabled={!filterClass || loadingPupils}>
              {loadingPupils ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
              {loadingPupils ? ' Loading...' : ' Fetch'}
            </button>
          </div>

          {showList && (
            <div className="rs-pupils-list">
              {pupils.length === 0 ? (
                <div className="rs-no-pupils">No pupils found</div>
              ) : (
                <>
                  <div className="rs-list-count">{pupils.length} pupil(s) found</div>
                  <table className="rs-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Adm. No</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Stream</th>
                        <th>Parent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pupils.map((p, i) => (
                        <tr key={p._id}>
                          <td>{i + 1}</td>
                          <td>{p.admissionNumber}</td>
                          <td>{p.name}</td>
                          <td>{p.gender}</td>
                          <td>{p.stream}</td>
                          <td>{p.parentName || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {!showList && (
            <div className="rs-empty-list">
              <i className="fas fa-users"></i>
              <p>Select a class and click Fetch to view pupils</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
