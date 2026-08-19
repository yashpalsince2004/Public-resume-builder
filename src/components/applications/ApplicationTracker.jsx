import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Card, Badge, EmptyState } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const STATUSES = ['all', 'saved', 'tailored', 'applied', 'interview', 'rejected', 'offer'];

export default function ApplicationTracker() {
  const { applications, updateApplication, addToast } = useApp();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = !searchQuery ||
      app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id, newStatus) => {
    updateApplication(id, { status: newStatus });
    addToast(`Status updated to ${newStatus}!`, 'info');
  };

  return (
    <div className="apps-container">
      <div className="apps-header">
        <div>
          <h1 className="apps-title">Application Tracker</h1>
          <p className="apps-subtitle">Track your tailored resumes, cover letters, application status, and interview timeline.</p>
        </div>
        <a href="/app/tailor">
          <Button variant="primary" icon="✦" size="sm">Tailor New Job</Button>
        </a>
      </div>

      {/* Filter & Search Bar */}
      <Card className="filter-bar" padding={false}>
        <div className="filter-bar-inner">
          <Input
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '32px', minWidth: '200px' }}
          />
          <div className="status-chips">
            {STATUSES.map(s => (
              <button
                key={s}
                className={`status-chip ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List View */}
      {filtered.length === 0 ? (
        <Card style={{ marginTop: 'var(--ds-space-6)' }}>
          <EmptyState
            icon="▣"
            title="No applications found"
            description={searchQuery || filterStatus !== 'all' ? 'No applications match your filter criteria.' : 'Create your first application by tailoring a resume for a job.'}
            action={
              <a href="/app/tailor">
                <Button variant="primary" size="sm">Tailor a Job</Button>
              </a>
            }
          />
        </Card>
      ) : (
        <div className="apps-list">
          {filtered.map((app) => (
            <Card key={app.id} className="app-card" hover onClick={() => setSelectedApp(app)}>
              <div className="app-main-info">
                <div>
                  <h3 className="app-company">{app.company || 'Company'}</h3>
                  <div className="app-role">{app.role || 'Role'}</div>
                </div>
                <div className="app-badge-group">
                  {app.atsScore > 0 && <Badge variant={app.atsScore >= 70 ? 'success' : 'warning'}>{app.atsScore}% ATS</Badge>}
                  <select
                    className="app-status-select"
                    value={app.status || 'saved'}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(app.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="saved">Saved</option>
                    <option value="tailored">Tailored</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="app-footer">
                <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' }}>
                  Created {new Date(app.createdAt).toLocaleDateString()}
                </span>
                {app.tailoredResume && (
                  <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-accent-text)' }}>
                    Tailored Resume Ready ✓
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="ds-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="ds-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="ds-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--ds-text-md)' }}>{selectedApp.company}</h3>
                <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' }}>{selectedApp.role}</span>
              </div>
              <button className="ds-modal-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>
            <div style={{ padding: 'var(--ds-space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--ds-space-2)', marginBottom: 'var(--ds-space-4)' }}>
                <Badge variant="accent">{selectedApp.status}</Badge>
                {selectedApp.atsScore > 0 && <Badge variant="success">{selectedApp.atsScore}% ATS Match</Badge>}
              </div>

              {selectedApp.jobDescription && (
                <div style={{ marginBottom: 'var(--ds-space-4)' }}>
                  <h4 style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)', marginBottom: '4px' }}>Job Description</h4>
                  <div style={{ padding: 'var(--ds-space-3)', background: 'var(--ds-surface-secondary)', borderRadius: 'var(--ds-radius-md)', fontSize: 'var(--ds-text-xs)', maxHeight: '160px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--ds-text-muted)' }}>
                    {selectedApp.jobDescription}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--ds-space-2)' }}>
                <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .apps-container { max-width: 1200px; }
        .apps-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--ds-space-6); flex-wrap: wrap; gap: var(--ds-space-4); }
        .apps-title { font-size: var(--ds-text-2xl); font-weight: 700; color: var(--ds-text-primary); margin: 0; }
        .apps-subtitle { font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin: 4px 0 0; }
        .filter-bar { margin-bottom: var(--ds-space-6); padding: 12px 16px !important; }
        .filter-bar-inner { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-4); flex-wrap: wrap; }
        .status-chips { display: flex; gap: 4px; overflow-x: auto; }
        .status-chip { padding: 4px 10px; background: transparent; border: 1px solid var(--ds-border); border-radius: var(--ds-radius-pill); color: var(--ds-text-muted); font-size: var(--ds-text-xs); cursor: pointer; transition: all var(--ds-transition); }
        .status-chip.active { background: var(--ds-accent-muted); border-color: var(--ds-accent); color: var(--ds-accent-text); font-weight: 500; }
        .apps-list { display: flex; flex-direction: column; gap: var(--ds-space-3); }
        .app-card { cursor: pointer; }
        .app-main-info { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--ds-space-3); }
        .app-company { font-size: var(--ds-text-md); font-weight: 600; color: var(--ds-text-primary); margin: 0; }
        .app-role { font-size: var(--ds-text-sm); color: var(--ds-text-muted); }
        .app-badge-group { display: flex; items: center; gap: var(--ds-space-2); }
        .app-status-select { background: var(--ds-surface-secondary); border: 1px solid var(--ds-border); color: var(--ds-text-primary); font-size: var(--ds-text-xs); padding: 2px 8px; border-radius: var(--ds-radius-sm); outline: none; }
        .app-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--ds-border); padding-top: var(--ds-space-2); }
      `}</style>
    </div>
  );
}
