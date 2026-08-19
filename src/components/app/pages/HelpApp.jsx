import AppShell from '../AppShell.jsx';
import HelpPage from '../../help/HelpPage.jsx';

export default function HelpApp() {
  return (
    <AppShell activePath="/app/help" title="Help & Feedback">
      <HelpPage />
    </AppShell>
  );
}
