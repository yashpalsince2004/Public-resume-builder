/**
 * printExport.js
 * Clean, lightweight native browser vector PDF print helper.
 * Triggers Chromium / Safari / Firefox's native PDF engine via window.print().
 */

export function printResume() {
  if (typeof window === 'undefined') return;

  document.body.classList.add('printing');

  requestAnimationFrame(() => {
    window.print();

    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 500);
  });
}

export const copyResumeText = async (element) => {
  if (!element || typeof window === 'undefined') return false;
  try {
    const text = element.innerText || element.textContent || '';
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Clipboard write failed:', e);
    return false;
  }
};

// Backwards compatibility alias for exportToPDF
export const exportToPDF = async (element, filename) => {
  printResume();
  return Promise.resolve(true);
};
