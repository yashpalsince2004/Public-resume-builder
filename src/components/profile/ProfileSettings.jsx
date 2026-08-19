import { useApp } from '../../context/AppContext.jsx';
import { Card } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export default function ProfileSettings() {
  const { user, profile, updateProfile, handleSignOut, addToast } = useApp();

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Master_Resume_${profile.name || 'Candidate'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Profile data exported as JSON!', 'info');
  };

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-header">
        <h1 className="profile-settings-title">Account & Profile Settings</h1>
        <p className="profile-settings-subtitle">Manage your account information, preferences, and data privacy options.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-6)' }}>
        {/* User Account Info */}
        <Card>
          <h3 style={{ fontSize: 'var(--ds-text-md)', margin: '0 0 var(--ds-space-4)' }}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)', fontSize: 'var(--ds-text-sm)' }}>
            <div>
              <span style={{ color: 'var(--ds-text-muted)', display: 'inline-block', width: '120px' }}>Email:</span>
              <strong style={{ color: 'var(--ds-text-primary)' }}>{user?.email || 'Guest User'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ds-text-muted)', display: 'inline-block', width: '120px' }}>User ID:</span>
              <code style={{ fontSize: '11px', color: 'var(--ds-text-muted)' }}>{user?.uid || 'anonymous'}</code>
            </div>
            <div>
              <span style={{ color: 'var(--ds-text-muted)', display: 'inline-block', width: '120px' }}>Auth Provider:</span>
              <strong style={{ color: 'var(--ds-text-primary)' }}>Google Sign-In</strong>
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <h3 style={{ fontSize: 'var(--ds-text-md)', margin: '0 0 var(--ds-space-4)' }}>Data Privacy & Export</h3>
          <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-muted)', marginBottom: 'var(--ds-space-4)' }}>
            You own 100% of your data. You can export your full candidate master resume JSON or delete your account at any time.
          </p>
          <div style={{ display: 'flex', gap: 'var(--ds-space-3)' }}>
            <Button variant="secondary" icon="📥" onClick={handleExportData}>
              Export Master Resume JSON
            </Button>
            <a href="/app/master-resume">
              <Button variant="ghost" icon="✏️">
                Edit Master Resume
              </Button>
            </a>
          </div>
        </Card>

        {/* Sign Out */}
        <Card>
          <h3 style={{ fontSize: 'var(--ds-text-md)', margin: '0 0 var(--ds-space-4)', color: 'var(--ds-error)' }}>Session Management</h3>
          <Button variant="danger" icon="⏻" onClick={handleSignOut}>
            Sign Out of ResumeBuilder
          </Button>
        </Card>
      </div>

      <style>{`
        .profile-settings-container { max-width: 800px; }
        .profile-settings-header { margin-bottom: var(--ds-space-6); }
        .profile-settings-title { font-size: var(--ds-text-2xl); font-weight: 700; color: var(--ds-text-primary); margin: 0; }
        .profile-settings-subtitle { font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin: 4px 0 0; }
      `}</style>
    </div>
  );
}
