/**
 * pdfExport.js (Redirected to Native Vector Print Engine)
 */
import { printResume } from './printExport';

export const exportToPDF = async (element, filename) => {
  printResume();
  return Promise.resolve(true);
};

export { printResume };
