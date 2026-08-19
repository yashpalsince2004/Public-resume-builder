import AppShell from '../AppShell.jsx';
import CoverLetterGenerator from '../../cover-letter/CoverLetterGenerator.jsx';

export default function CoverLettersApp() {
  return (
    <AppShell activePath="/app/cover-letters" title="Cover Letters">
      <CoverLetterGenerator />
    </AppShell>
  );
}
