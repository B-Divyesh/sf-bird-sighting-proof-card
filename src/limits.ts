export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 12_000_000;
export const MAX_TOTAL_ATTACHMENT_BYTES = 12_000_000;
export const MAX_IMPORT_BYTES = 20_000_000;

export const attachmentBudgetIssue = (sizes: number[]) => {
  if (sizes.length > MAX_FILES) return `A record can hold up to ${MAX_FILES} evidence files.`;
  if (sizes.some(size => size > MAX_FILE_BYTES)) return 'Each evidence file must be 12 MB or smaller.';
  if (sizes.reduce((total, size) => total + size, 0) > MAX_TOTAL_ATTACHMENT_BYTES) return 'Evidence files must total 12 MB or less so the exported JSON can be imported again.';
  return '';
};
