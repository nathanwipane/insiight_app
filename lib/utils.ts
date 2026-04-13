// ── Generate Parent Org ID ─────────────────────────────────────────────────────────
export function generateParentOrgId(organizationName: string) {
  if (!organizationName || typeof organizationName !== 'string') {
    throw new Error('Organization name must be a non-empty string');
  }
  
  // Remove all spaces and take first 8 letters, convert to lowercase
  const code = organizationName
    .replace(/\s+/g, '') // Replace all spaces with empty string
    .replace(/[^a-zA-Z]/g, '') // Keep only letters
    .substring(0, 8) // Take first 8 characters
    .toLowerCase(); // Convert to lowercase
  
  if (code.length === 0) {
    throw new Error('No valid letters found in organization name');
  }
  
  return code;
}