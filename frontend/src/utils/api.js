const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // Pupils
  getPupils: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/pupils?${query}`).then(r => r.json());
  },
  createPupil: (data) =>
    fetch(`${API_BASE}/pupils`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  getSchoolStructure: () =>
    fetch(`${API_BASE}/pupils/school-structure`).then(r => r.json()),

  // Marks
  getMarks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/marks?${query}`).then(r => r.json());
  },
  enterMarks: (data) =>
    fetch(`${API_BASE}/marks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  bulkEnterMarks: (marks) =>
    fetch(`${API_BASE}/marks/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marks })
    }).then(r => r.json()),

  // Reports
  getPupilReport: (pupilId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/reports/pupil/${pupilId}?${query}`).then(r => r.json());
  },
  getClassReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/reports/class?${query}`).then(r => r.json());
  },
  getStatistics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/reports/statistics?${query}`).then(r => r.json());
  },

  // System Configuration
  getSystemConfig: () =>
    fetch(`${API_BASE}/system-config`).then(r => r.json()),
  updateSystemConfig: (data) =>
    fetch(`${API_BASE}/system-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
};
