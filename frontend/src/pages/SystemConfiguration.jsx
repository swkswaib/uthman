import React, { useEffect, useRef, useState } from 'react';
import { api } from '../utils/api';
import './SystemConfiguration.css';

const emptyForm = {
  schoolName: '',
  motto: '',
  address: '',
  logoUrl: '',
  reportTitle: '',
  islamicHeaderArabic: '',
  islamicSchoolName: '',
  islamicReportTitle: '',
  islamicAddress: '',
  islamicSectionTitle: ''
};

const SystemConfiguration = ({ onConfigSaved, isSetupMode = false }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoTab, setLogoTab] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, logoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setForm(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getSystemConfig();
        setForm({ ...emptyForm, ...data });
      } catch {
        setError('Failed to load configuration. Ensure the server is running.');
      }
      setLoading(false);
    };

    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await api.updateSystemConfig(form);
      if (response?.message && !response?._id) {
        setError(response.message);
      } else {
        setForm({ ...emptyForm, ...response });
        setMessage('System configuration saved successfully.');
        if (onConfigSaved) onConfigSaved(response);
      }
    } catch {
      setError('Failed to save configuration.');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="system-config-page">
        <div className="system-config-card">
          <p>Loading system configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-config-page">
      <div className="system-config-card">
        <h2><i className="fas fa-cogs"></i> {isSetupMode ? 'School Setup' : 'System Configuration'}</h2>
        {isSetupMode ? (
          <div className="setup-banner">
            <div className="setup-banner-icon"><i className="fas fa-school"></i></div>
            <div>
              <strong>Welcome! Let's set up your school.</strong>
              <p>Enter your school details below. The dashboard and all reports will use this information. You can update it anytime from the System Configuration menu.</p>
            </div>
          </div>
        ) : (
          <p className="system-config-intro">
            Set the school details shown at the top of each report card before users start printing reports.
          </p>
        )}

        <form onSubmit={handleSubmit} className="system-config-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="schoolName">School Name</label>
              <input
                id="schoolName"
                name="schoolName"
                value={form.schoolName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="motto">Motto</label>
              <input
                id="motto"
                name="motto"
                value={form.motto}
                onChange={handleChange}
                placeholder='Example: "Excellence in Education"'
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Address / Contacts</label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="P.O. Box..., Tel..., Email..."
              />
            </div>

            <div className="form-group full-width">
              <label>School Logo</label>
              <div className="logo-tabs">
                <button type="button" className={`logo-tab ${logoTab === 'upload' ? 'active' : ''}`} onClick={() => setLogoTab('upload')}>
                  <i className="fas fa-upload"></i> Upload File
                </button>
                <button type="button" className={`logo-tab ${logoTab === 'url' ? 'active' : ''}`} onClick={() => setLogoTab('url')}>
                  <i className="fas fa-link"></i> Paste URL
                </button>
              </div>

              {logoTab === 'upload' ? (
                <div className="logo-upload-area" onClick={() => fileInputRef.current?.click()}>
                  {form.logoUrl && (form.logoUrl.startsWith('data:') || logoTab === 'upload') && form.logoUrl ? (
                    <div className="logo-preview-wrap">
                      <img src={form.logoUrl} alt="Logo preview" className="logo-preview-img" />
                      <button type="button" className="logo-clear-btn" onClick={(e) => { e.stopPropagation(); clearLogo(); }}>
                        <i className="fas fa-times"></i> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="logo-upload-placeholder">
                      <i className="fas fa-image"></i>
                      <span>Click to choose an image</span>
                      <small>PNG, JPG, SVG · max 2 MB</small>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoFile}
                  />
                </div>
              ) : (
                <input
                  id="logoUrl"
                  name="logoUrl"
                  value={form.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              )}

              {form.logoUrl && logoTab === 'url' && (
                <div className="logo-preview-wrap url-preview">
                  <img src={form.logoUrl} alt="Logo preview" className="logo-preview-img" onError={(e) => e.target.style.display='none'} />
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="reportTitle">Secular Report Title</label>
              <input
                id="reportTitle"
                name="reportTitle"
                value={form.reportTitle}
                onChange={handleChange}
                placeholder="END OF TERM REPORT CARD"
              />
            </div>

            <div className="form-group full-width section-title">Islamic/Theology Header (Optional)</div>

            <div className="form-group full-width">
              <label htmlFor="islamicHeaderArabic">Arabic Header</label>
              <input
                id="islamicHeaderArabic"
                name="islamicHeaderArabic"
                value={form.islamicHeaderArabic}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="islamicSchoolName">Islamic Report School Name</label>
              <input
                id="islamicSchoolName"
                name="islamicSchoolName"
                value={form.islamicSchoolName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="islamicReportTitle">Islamic Report Title</label>
              <input
                id="islamicReportTitle"
                name="islamicReportTitle"
                value={form.islamicReportTitle}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="islamicAddress">Islamic Header Address/Contacts</label>
              <input
                id="islamicAddress"
                name="islamicAddress"
                value={form.islamicAddress}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="islamicSectionTitle">Islamic Section Title</label>
              <input
                id="islamicSectionTitle"
                name="islamicSectionTitle"
                value={form.islamicSectionTitle}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="config-alert error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {message && <div className="config-alert success"><i className="fas fa-check-circle"></i> {message}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={saving}>
              <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemConfiguration;
