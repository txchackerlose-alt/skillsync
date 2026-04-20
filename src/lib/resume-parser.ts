// This file is server-only — never import it from client components.
// pdf-parse and mammoth are Node.js libraries.

/**
 * Extract plain text from a PDF file buffer.
 */
async function extractFromPdf(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid bundling issues with Next.js edge runtime
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');
  try {
    const result = await pdfParse(buffer);
    return result.text || '';
  } catch {
    throw new Error('Failed to parse PDF. The file may be corrupted or encrypted.');
  }
}

/**
 * Extract plain text from a DOCX file buffer.
 */
async function extractFromDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require('mammoth');
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch {
    throw new Error('Failed to parse DOCX. The file may be corrupted.');
  }
}

export interface ParseResult {
  text: string;
  error?: string;
}

/**
 * Accepts a File object (from FormData), reads its bytes,
 * and returns the extracted plain text.
 */
export async function parseResume(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (ext === 'pdf') {
    try {
      const text = await extractFromPdf(buffer);
      return { text };
    } catch (err: any) {
      return { text: '', error: err.message };
    }
  }

  if (ext === 'docx') {
    try {
      const text = await extractFromDocx(buffer);
      return { text };
    } catch (err: any) {
      return { text: '', error: err.message };
    }
  }

  if (ext === 'doc') {
    // .doc (old Word format) — mammoth has limited support but try it
    try {
      const text = await extractFromDocx(buffer);
      return { text };
    } catch {
      return { text: '', error: '.doc format has limited support. Please use .docx or .pdf for best results.' };
    }
  }

  return { text: '', error: 'Unsupported file type. Use PDF, DOC, or DOCX.' };
}
