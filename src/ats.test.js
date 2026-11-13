import { describe, it, expect } from 'vitest';
import { analyze } from './ats';
import { SAMPLES, TPL, lv, names, normalize } from './data';
import { T } from './i18n';

const klassik = TPL.find((t) => t.id === 'london');
const okean = TPL.find((t) => t.id === 'baki');
const run = (d, jd = '', t = klassik, lang = 'az') => analyze(d, jd, t, T[lang]);

describe('analyze', () => {
  it('nümunə CV (AZ və EN) ATS şablonunda 100 alır', () => {
    expect(run(SAMPLES.az).score).toBe(100);
    expect(run(SAMPLES.en, '', klassik, 'en').score).toBe(100);
  });
  it('çoxsütunlu şablonun balı daha aşağıdır', () => {
    expect(run(SAMPLES.az, '', okean).score).toBeLessThan(run(SAMPLES.az).score);
  });
  it('səhv e-poçtu və boş təcrübəni tutur', () => {
    const r = run({ ...SAMPLES.az, email: 'abc', exp: [] });
    expect(r.C.filter((c) => !c.ok).length).toBeGreaterThanOrEqual(2);
  });
  it('şəkil yalnız onu göstərən şablonda cərimələnir', () => {
    const d = { ...SAMPLES.az, photo: 'data:x' };
    expect(run(d, '', klassik).score).toBe(100);
    expect(run(d, '', okean).score).toBeLessThan(run(SAMPLES.az, '', okean).score);
  });
  it('vakansiya açar sözlərini tapır və çatışmayanı göstərir', () => {
    const r = run(SAMPLES.en, 'We need React JavaScript and Kubernetes Kubernetes experience', klassik, 'en');
    expect(r.found).toContain('react');
    expect(r.miss).toContain('kubernetes');
  });
});

describe('lv / names', () => {
  it('səviyyəni oxuyur, yoxdursa 4 qoyur', () => {
    expect(lv('React:5, Git')).toEqual([{ n: 'React', v: 5 }, { n: 'Git', v: 4 }]);
  });
  it('səviyyəsiz adları qaytarır', () => { expect(names('HTML:5, CSS')).toEqual(['HTML', 'CSS']); });
});

describe('normalize', () => {
  it('zədəli datada nümunəyə qayıdır', () => {
    expect(normalize(null)).toBe(SAMPLES.az);
    expect(normalize('x')).toBe(SAMPLES.az);
  });
  it('çatışmayan massiv və sahələri doldurur', () => {
    const d = normalize({ name: 'A', exp: [{ role: 'Dev' }], edu: 5 });
    expect(d.exp[0]).toEqual({ role: 'Dev', company: '', period: '', desc: '' });
    expect(d.edu).toEqual([]);
    expect(d.email).toBe(SAMPLES.az.email);
  });
});
