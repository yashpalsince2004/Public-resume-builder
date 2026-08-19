import AppShell from '../AppShell.jsx';
import TailorWorkflow from '../../tailor/TailorWorkflow.jsx';

export default function TailorApp() {
  return (
    <AppShell activePath="/app/tailor" title="Tailor a Job">
      <TailorWorkflow />
    </AppShell>
  );
}
