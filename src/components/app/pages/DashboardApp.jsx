import AppShell from '../AppShell.jsx';
import Dashboard from '../../dashboard/Dashboard.jsx';

export default function DashboardApp() {
  return (
    <AppShell activePath="/app/dashboard" title="Dashboard">
      <Dashboard />
    </AppShell>
  );
}
