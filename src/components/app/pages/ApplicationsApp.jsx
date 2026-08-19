import AppShell from '../AppShell.jsx';
import ApplicationTracker from '../../applications/ApplicationTracker.jsx';

export default function ApplicationsApp() {
  return (
    <AppShell activePath="/app/applications" title="Applications">
      <ApplicationTracker />
    </AppShell>
  );
}
