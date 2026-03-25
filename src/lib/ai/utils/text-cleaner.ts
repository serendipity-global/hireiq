export function cleanResumeText(raw: string): string {
  return raw
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Normalize multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Remove page numbers (common in PDFs)
    .replace(/^\s*\d+\s*$/gm, '')
    // Remove common PDF artifacts
    .replace(/\f/g, '\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim()
}

export function validateResumeText(text: string): {
  isValid: boolean
  reason?: string
} {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'No text could be extracted from the PDF' }
  }

  if (text.length < 200) {
    return { isValid: false, reason: 'Resume appears to be too short or empty' }
  }

  if (text.length > 50000) {
    return { isValid: false, reason: 'Resume is too long. Please upload a concise resume' }
  }

  // Check if text looks like garbage (too many special chars)
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s.,;:!?@#$%&*()\-_+=]/g) || []).length / text.length
  if (specialCharRatio > 0.3) {
    return { isValid: false, reason: 'Could not read PDF content correctly. Please try a different PDF' }
  }

  // Check if there are actual words
  const words = text.match(/[a-zA-Z]{2,}/g) || []
  if (words.length < 50) {
    return { isValid: false, reason: 'Resume does not contain enough readable text' }
  }

  return { isValid: true }
}