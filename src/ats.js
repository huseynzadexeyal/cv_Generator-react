import { lines, list } from './data';

const STOP = new Set('və ilə üçün bir bu da də ki kimi olan olaraq daha çox the and for with you our are will have from that this'.split(' '));

// Vakansiya mətnindən ən çox təkrarlanan 20 açar söz
export const keywords = (jd) => {
  const m = {};
  (jd.toLowerCase().match(/[\p{L}#+.]{3,}/gu) || []).forEach((w) => { if (!STOP.has(w)) m[w] = (m[w] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 20).map((x) => x[0]);
};
// Azərbaycan şəkilçilərini nəzərə almaq üçün sözün sonunu kəsib axtarır
const has = (t, w) => t.includes(w.length > 6 ? w.slice(0, -2) : w);

// Hər yoxlama: { ok, w (çəki), m (mesaj), tip (məsləhət) }
export function analyze(d, jd, tpl, L) {
  const C = [];
  const A = (ok, w, [m, tip]) => C.push({ ok, w, m, tip });
  const X = L.ats;
  const sw = (d.summary.match(/\S+/g) || []).length;
  const all = [d.name, d.title, d.summary, d.skills, d.langs,
    ...d.exp.flatMap((e) => [e.role, e.company, e.desc]),
    ...d.edu.flatMap((e) => [e.school, e.degree])].join(' ').toLowerCase();

  A(/^\S+@\S+\.\S+$/.test(d.email), 10, X.email);
  A(d.phone.replace(/\D/g, '').length >= 9, 10, X.phone);
  A(!!d.name && !!d.title, 5, X.title);
  A(sw >= 30 && sw <= 90, 10, X.summary(sw));
  A(d.exp.length > 0 && d.exp.every((e) => e.role && e.company && e.period), 10, X.exp);
  A(d.exp.some((e) => /\d/.test(e.desc)), 10, X.nums);
  A(d.exp.length > 0 && d.exp.every((e) => lines(e.desc).length >= 2), 5, X.bul);
  A(list(d.skills).length >= 8, 10, X.skills(list(d.skills).length));
  A(d.edu.length > 0, 5, X.edu);
  A(tpl.ats, 10, X.tpl);
  A(!d.photo || tpl.noPhoto, 5, X.photo);

  const found = [], miss = [];
  if (jd.trim()) {
    const k = keywords(jd);
    k.forEach((w) => (has(all, w) ? found : miss).push(w));
    A(k.length > 0 && found.length / k.length >= 0.6, 20, X.kw(found.length, k.length));
  }
  const tot = C.reduce((s, c) => s + c.w, 0);
  const got = C.filter((c) => c.ok).reduce((s, c) => s + c.w, 0);
  return { score: Math.round((got / tot) * 100), C, found, miss };
}
