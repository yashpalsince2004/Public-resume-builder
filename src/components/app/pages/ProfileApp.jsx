import AppShell from '../AppShell.jsx';
import ProfileSettings from '../../profile/ProfileSettings.jsx';

export default function ProfileApp() {
  return (
    <AppShell activePath="/app/profile" title="Profile & Account">
      <ProfileSettings />
    </AppShell>
  );
}
