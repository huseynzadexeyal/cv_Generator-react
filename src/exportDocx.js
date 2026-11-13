import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { lines, names } from './data';

// ATS-dostu Word: tək sütun, standart başlıqlar, real bullet-lər
export async function exportDocx(d, L) {
  const H = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } });
  const P = (t, o = {}) => new Paragraph({ children: [new TextRun({ text: t, ...o })] });
  const B = (t) => new Paragraph({ text: t, bullet: { level: 0 } });
  const children = [
    new Paragraph({ children: [new TextRun({ text: d.name, bold: true, size: 36 })] }),
    P(d.title, { bold: true }),
    P([d.birth, d.email, d.phone, d.city, d.link].filter(Boolean).join(' | ')),
    H(L.summary), P(d.summary),
    H(L.exp),
    ...d.exp.flatMap((e) => [P(`${e.role} — ${e.company}`, { bold: true }), P(e.period, { italics: true }), ...lines(e.desc).map(B)]),
    H(L.edu), ...d.edu.map((e) => P(`${e.school}, ${e.degree} (${e.period})`)),
    H(L.skills), P(names(d.skills).join(', ')),
    H(L.langs), P(names(d.langs).join(', ')),
  ];
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'CV.docx';
  a.click();
  URL.revokeObjectURL(a.href);
}
