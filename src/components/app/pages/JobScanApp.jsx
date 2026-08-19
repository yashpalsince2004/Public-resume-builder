import AppShell from '../AppShell.jsx';
import JobScan from '../../job-scan/JobScan.jsx';

export default function JobScanApp() {
  return (
    <AppShell activePath="/app/job-scan" title="Job Scan">
      <JobScan />
    </AppShell>
  );
}
