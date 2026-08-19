import AppShell from '../AppShell.jsx';
import LinkedInOptimizer from '../../linkedin/LinkedInOptimizer.jsx';

export default function LinkedInApp() {
  return (
    <AppShell activePath="/app/linkedin" title="LinkedIn Optimizer">
      <LinkedInOptimizer />
    </AppShell>
  );
}
