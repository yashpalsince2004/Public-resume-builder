import AppShell from '../AppShell.jsx';
import MasterResumeEditor from '../../master-resume/MasterResumeEditor.jsx';

export default function MasterResumeApp() {
  return (
    <AppShell activePath="/app/master-resume" title="Master Resume">
      <MasterResumeEditor />
    </AppShell>
  );
}
