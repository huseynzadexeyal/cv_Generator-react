const AZ = {
  name: 'Xəyal Əliyev', title: 'Frontend Developer', email: 'xayal@example.com',
  phone: '+994 50 123 45 67', birth: '11.02.1998', city: 'Bakı, Azərbaycan', link: 'github.com/xayal', photo: '',
  summary: 'Frontend developer HTML, CSS və JavaScript üzrə təcrübəyə malikdir. React ilə responsiv və sürətli interfeyslər hazırlayır, istifadəçi təcrübəsinə və təmiz koda diqqət yetirir. Real layihələrdə komanda ilə işləməyi və yeni texnologiyalar öyrənməyi sevir.',
  exp: [{ role: 'Frontend Developer', company: 'Freelance', period: '2024 – indi',
    desc: '10+ responsiv veb səhifə hazırladım\nSəhifə yüklənmə sürətini 35% artırdım\nReact ilə təkrar istifadə olunan komponentlər yazdım' }],
  edu: [{ school: 'Bakı Dövlət Universiteti', degree: 'Bakalavr, İnformatika', period: '2020 – 2024' }],
  skills: 'HTML:5, CSS:5, JavaScript:4, React:4, Git:4, Bootstrap:4, REST API:3, Responsive Design:5',
  langs: 'Azərbaycan dili:5, İngilis dili:4, Rus dili:3',
};
const EN = {
  name: 'Khayal Aliyev', title: 'Frontend Developer', email: 'xayal@example.com',
  phone: '+994 50 123 45 67', birth: '11.02.1998', city: 'Baku, Azerbaijan', link: 'github.com/xayal', photo: '',
  summary: 'Frontend developer experienced in HTML, CSS and JavaScript. Builds fast, responsive interfaces with React and cares about user experience and clean code. Enjoys working with a team on real-world projects.',
  exp: [{ role: 'Frontend Developer', company: 'Freelance', period: '2024 – Present',
    desc: 'Built 10+ responsive websites\nImproved page load speed by 35%\nWrote reusable React components' }],
  edu: [{ school: 'Baku State University', degree: 'Bachelor, Computer Science', period: '2020 – 2024' }],
  skills: 'HTML:5, CSS:5, JavaScript:4, React:4, Git:4, Bootstrap:4, REST API:3, Responsive Design:5',
  langs: 'Azerbaijani:5, English:4, Russian:3',
};
export const SAMPLES = { az: AZ, en: EN };
export const SAMPLE = AZ;
// lay: side = sol sütunlu, cols = başlıq + 2 sütun. ats: tək sütun (ATS-dostu)
export const TPL = [
  { id: 'london', name: 'Klassik', ats: true, noPhoto: true },
  { id: 'baki', name: 'Okean', lay: 'side', mode: 'bar', side: ['ph', 'contact', 'skills', 'langs'], main: ['hd', 'about', 'exp', 'edu'] },
  { id: 'gence', name: 'Günbatan', lay: 'side', mode: 'bar', side: ['ph', 'contact', 'skills', 'langs'], main: ['hd', 'about', 'edu', 'exp'] },
  { id: 'seki', name: 'Polad', lay: 'side', mode: 'dots', side: ['ph', 'about', 'contact'], main: ['hd', 'exp', 'edu', 'skills', 'langs'] },
  { id: 'lenk', name: 'Qəhvə', lay: 'side', mode: 'dots', side: ['ph', 'about', 'skills', 'langs', 'contact'], main: ['hd', 'edu', 'exp'] },
  { id: 'quba', name: 'Səma', lay: 'side', mode: 'bar', side: ['ph', 'nm', 'about', 'contact', 'langs'], main: ['edu', 'exp', 'skills'] },
  { id: 'nax', name: 'Qranit', lay: 'cols', mode: 'bar', hdPhoto: 'l', hdContact: 1, l: ['about', 'exp', 'langs'], r: ['edu', 'skills'] },
  { id: 'susa', name: 'Alov', lay: 'cols', mode: 'dots', hdPhoto: 'r', hdAbout: 1, l: ['edu'], r: ['exp'], foot: ['langs', 'skills', 'contact'] },
  { id: 'qabala', name: 'Şəfəq', lay: 'cols', mode: 'bar', hdPhoto: 'r', l: ['about', 'exp', 'contact'], r: ['edu', 'langs', 'skills'] },
  { id: 'sum', name: 'Kəhrəba', lay: 'cols', mode: 'bar', hdPhoto: 'l', hdAbout: 1, l: ['contact', 'skills', 'langs'], r: ['exp', 'edu'] },
  { id: 'min', name: 'Qızıl Gecə', lay: 'cols', mode: 'bar', hdPhoto: 'l', l: ['exp', 'edu'], r: ['contact', 'skills', 'langs'] },
];
export const COLORS = ['#f5a524', '#4f6ef7', '#0f766e', '#be185d', '#334155'];
export const lines = (s) => (s || '').split('\n').map((x) => x.trim()).filter(Boolean);
export const list = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);
// "React:4" -> { n: 'React', v: 4 } (səviyyə 1–5, yoxdursa 4)
export const lv = (s) => list(s).map((x) => { const m = x.match(/^(.*?)\s*:\s*([1-5])$/); return m ? { n: m[1], v: +m[2] } : { n: x, v: 4 }; });
export const names = (s) => lv(s).map((x) => x.n);

// Saxlanmış/zədələnmiş datanı təhlükəsiz formaya salır (çatışmayan sahələr nümunədən doldurulur)
export const normalize = (x, lang = 'az') => {
  const base = SAMPLES[lang] || SAMPLES.az;
  if (!x || typeof x !== 'object' || Array.isArray(x)) return base;
  const arr = (v) => (Array.isArray(v) ? v : []);
  return {
    ...base, ...x,
    exp: arr(x.exp).map((e) => ({ role: '', company: '', period: '', desc: '', ...e })),
    edu: arr(x.edu).map((e) => ({ school: '', degree: '', period: '', ...e })),
  };
};
