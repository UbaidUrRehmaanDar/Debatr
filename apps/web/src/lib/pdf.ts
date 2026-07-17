import { jsPDF } from 'jspdf';

interface PdfMessage {
  side: string;
  content: string;
  createdAt?: string;
}

interface PdfReport {
  outcome?: string;
  confidence?: number;
  verdict?: string;
  summary?: string;
  scores?: any;
  strengths?: any;
  weaknesses?: any;
  fallacies?: any;
}

// Generate a professional PDF of a debate transcript (and optional judge
// report) entirely client-side. No server cost, no new dependency beyond
// jspdf. Returns the PDF as a Blob URL the caller can download.
export function buildDebatePdf(opts: {
  topic: string;
  status?: string;
  messages: PdfMessage[];
  report?: PdfReport | null;
}): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxLine = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string) => {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(text, margin, y);
    y += 22;
  };

  const sub = (text: string) => {
    ensureSpace(18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(text, margin, y);
    doc.setTextColor(0);
    y += 16;
  };

  const body = (text: string, font: 'normal' | 'bold' = 'normal', size = 10) => {
    doc.setFont('helvetica', font);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxLine) as string[];
    for (const line of lines) {
      ensureSpace(14);
      doc.text(line, margin, y);
      y += 13;
    }
  };

  // Title
  heading('Debate Transcript');
  sub(opts.topic);
  if (opts.status) sub(`Status: ${opts.status.replace(/_/g, ' ')}`);
  sub(`Generated: ${new Date().toLocaleString()}`);

  // Transcript
  heading('Transcript');
  if (!opts.messages.length) {
    body('No messages were posted in this debate.');
  }
  for (const m of opts.messages) {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const sideLabel = m.side === 'system' ? 'System' : m.side.toUpperCase();
    doc.text(`${sideLabel}`, margin, y);
    if (m.createdAt) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text(new Date(m.createdAt).toLocaleTimeString(), margin + 80, y);
      doc.setTextColor(0);
    }
    y += 14;
    body(m.content);
    y += 6;
  }

  // Judge report
  if (opts.report) {
    doc.addPage();
    y = margin;
    heading('Judge Report');
    if (opts.report.outcome) sub(`Outcome: ${opts.report.outcome}`);
    if (typeof opts.report.confidence === 'number') sub(`Confidence: ${Math.round(opts.report.confidence * 100)}%`);
    if (opts.report.verdict) body(opts.report.verdict, 'bold', 11);
    y += 4;
    if (opts.report.summary) {
      heading('Summary');
      body(opts.report.summary);
    }
    if (opts.report.scores) {
      heading('Scores');
      body(JSON.stringify(opts.report.scores, null, 2));
    }
    if (Array.isArray(opts.report.strengths)) {
      heading('Strengths');
      for (const s of opts.report.strengths) body(`• ${typeof s === 'string' ? s : JSON.stringify(s)}`);
    }
    if (Array.isArray(opts.report.weaknesses)) {
      heading('Weaknesses');
      for (const w of opts.report.weaknesses) body(`• ${typeof w === 'string' ? w : JSON.stringify(w)}`);
    }
    if (Array.isArray(opts.report.fallacies)) {
      heading('Fallacies');
      for (const f of opts.report.fallacies) body(`• ${typeof f === 'string' ? f : JSON.stringify(f)}`);
    }
  }

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
