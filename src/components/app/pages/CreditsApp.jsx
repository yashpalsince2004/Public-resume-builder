import AppShell from '../AppShell.jsx';
import CreditsPage from '../../credits/CreditsPage.jsx';

export default function CreditsApp() {
  return (
    <AppShell activePath="/app/credits" title="Plans & Credits">
      <CreditsPage />
    </AppShell>
  );
}
