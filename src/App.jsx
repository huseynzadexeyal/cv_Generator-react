import { useState, useEffect, useRef } from 'react';
import Paper from './Paper';
import { SAMPLES, TPL, COLORS, normalize } from './data';
import { T } from './i18n';
import { analyze } from './ats';
import { exportDocx } from './exportDocx';

// label input-u bürüyür: ekran oxuyucu və klik fokusu düzgün işləyir
const F = ({ l, v, on, ta }) => {
  const p = { value: v, onChange: (e) => on(e.target.value) };
  return <label><span className="lb">{l}</span>{ta ? <textarea {...p} /> : <input {...p} />}</label>;
};
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage bağlıdır */ } };
const strip = (o) => JSON.stringify({ ...o, photo: '' });

export default function App() {
  const [lang, setLang] = useState(() => load('cv-lang', 'az'));
  const [d, setD] = useState(() => normalize(load('cv-data', null), load('cv-lang', 'az')));
  const [tab, setTab] = useState(0), [tid, setTid] = useState(() => load('cv-ui', {}).tid || 'baki'), [ac, setAc] = useState(() => load('cv-ui', {}).ac || null), [msg, setMsg] = useState(''), [view, setView] = useState('edit'), [jd, setJd] = useState('');
  const [z, setZ] = useState(1), [perr, setPerr] = useState(''), wrap = useRef(), fi = useRef();
  const L = T[lang];

  useEffect(() => save('cv-data', d), [d]);
  useEffect(() => save('cv-ui', { tid, ac }), [tid, ac]);
  useEffect(() => { save('cv-lang', lang); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    // gizli (display:none) olanda eni 0 olur: o halda zoom-u dəyişmirik
    const f = () => { const w = wrap.current ? wrap.current.clientWidth : 0; if (w > 0) setZ(Math.min(1, (w - 2) / 794)); };
    f(); window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, [view]);

  // Dil dəyişəndə nümunə data toxunulmamışdırsa, həmin dilin nümunəsinə keçir (yazdığınız məlumat qorunur)
  const switchLang = (l) => {
    if (l === lang) return;
    if (strip(d) === strip(SAMPLES[lang])) setD({ ...SAMPLES[l], photo: d.photo });
    setLang(l);
  };

  const set = (k, v) => setD({ ...d, [k]: v });
  const setL = (k, i, f, v) => setD({ ...d, [k]: d[k].map((x, j) => (j === i ? { ...x, [f]: v } : x)) });
  const addL = (k, o) => setD({ ...d, [k]: [...d[k], o] });
  const delL = (k, i) => setD({ ...d, [k]: d[k].filter((_, j) => j !== i) });

  // İstənilən ölçülü şəkli kvadrat kəsir, 400px-ə kiçildir
  const photo = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setPerr('');
    const u = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      const s = Math.min(im.width, im.height), S = 400, c = document.createElement('canvas');
      c.width = c.height = S;
      c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, S, S);
      setD((p) => ({ ...p, photo: c.toDataURL('image/jpeg', 0.85) }));
      URL.revokeObjectURL(u);
    };
    im.onerror = () => { setPerr(L.photoErr); URL.revokeObjectURL(u); };
    im.src = u;
  };

  const doc = async () => { setMsg(''); try { await exportDocx(d, L); } catch { setMsg(L.exportErr); } };
  const tpl = TPL.find((x) => x.id === tid) || TPL[0], R = analyze(d, jd, tpl, L);
  const col = R.score >= 80 ? 'var(--ok)' : R.score >= 60 ? 'var(--wa)' : 'var(--no)';

  return (
    <div className={'app' + (view === 'pv' ? ' show-pv' : '')}>
      <div className="side">
        <div className="bar">
          <b>CV Yarat</b>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="lg">{['az', 'en'].map((l) => (
              <button key={l} className={lang === l ? 'on' : ''} onClick={() => switchLang(l)}>{l.toUpperCase()}</button>))}</span>
            <button className="btn g s" onClick={doc}>{L.word}</button>
            <button className="btn s" onClick={() => window.print()}>{L.pdf}</button>
          </span>
        </div>
        {msg && <div className="er">{msg}</div>}
        <div className="tabs">
          {[L.tabs[0], L.tabs[1], L.tabs[2] + ' ' + R.score].map((n, i) => (
            <button key={i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>{n}</button>))}
        </div>

        {tab === 0 && (<div>
          <h4>{L.personal}</h4>
          <div className="g2">
            <F l={L.name} v={d.name} on={(v) => set('name', v)} />
            <F l={L.jobTitle} v={d.title} on={(v) => set('title', v)} />
            <F l={L.email} v={d.email} on={(v) => set('email', v)} />
            <F l={L.phone} v={d.phone} on={(v) => set('phone', v)} />
            <F l={L.city} v={d.city} on={(v) => set('city', v)} />
            <F l={L.birth} v={d.birth || ''} on={(v) => set('birth', v)} />
            <F l={L.link} v={d.link} on={(v) => set('link', v)} />
          </div>
          <span className="lb">{L.photo}</span>
          <div className="ph">
            <div className="av">{d.photo ? <img src={d.photo} alt="" /> : '+'}</div>
            <div className="ac">
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn s" onClick={() => fi.current.click()}>{d.photo ? L.change : L.upload}</button>
                {d.photo && <button className="btn g s" onClick={() => set('photo', '')}>{L.del}</button>}
              </div>
              <small>{L.photoNote}</small>
              {perr && <span className="er">{perr}</span>}
              <input ref={fi} type="file" accept="image/*" hidden onChange={photo} />
            </div>
          </div>
          <F l={L.summary} ta v={d.summary} on={(v) => set('summary', v)} />

          <h4>{L.exp}</h4>
          {d.exp.map((e, i) => (
            <div className="blk" key={i}>
              <div className="g2">
                <F l={L.role} v={e.role} on={(v) => setL('exp', i, 'role', v)} />
                <F l={L.company} v={e.company} on={(v) => setL('exp', i, 'company', v)} />
              </div>
              <F l={L.period} v={e.period} on={(v) => setL('exp', i, 'period', v)} />
              <F l={L.bullets} ta v={e.desc} on={(v) => setL('exp', i, 'desc', v)} />
              <button className="btn g s" onClick={() => delL('exp', i)}>{L.del}</button>
            </div>))}
          <button className="btn g s" onClick={() => addL('exp', { role: '', company: '', period: '', desc: '' })}>{L.addExp}</button>

          <h4>{L.edu}</h4>
          {d.edu.map((e, i) => (
            <div className="blk" key={i}>
              <F l={L.school} v={e.school} on={(v) => setL('edu', i, 'school', v)} />
              <div className="g2">
                <F l={L.degree} v={e.degree} on={(v) => setL('edu', i, 'degree', v)} />
                <F l={L.period} v={e.period} on={(v) => setL('edu', i, 'period', v)} />
              </div>
              <button className="btn g s" onClick={() => delL('edu', i)}>{L.del}</button>
            </div>))}
          <button className="btn g s" onClick={() => addL('edu', { school: '', degree: '', period: '' })}>{L.addEdu}</button>

          <h4>{L.skills} / {L.langs}</h4>
          <F l={L.skillsIn} ta v={d.skills} on={(v) => set('skills', v)} />
          <F l={L.langsIn} v={d.langs} on={(v) => set('langs', v)} />
        </div>)}

        {tab === 1 && (<div>
          <div className="gal">
            {TPL.map((x) => (
              <div key={x.id} className={x.id === tid ? 'on' : ''} role="button" tabIndex={0} aria-pressed={x.id === tid}
                onClick={() => setTid(x.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setTid(x.id))}>
                <div className="th"><Paper d={d} t={x} ac={ac} zoom={0.2} L={L} /></div>
                <b>{x.name}</b><small>{x.ats ? L.tags.ats : L.tags.cr}</small>
              </div>))}
          </div>
          <h4>{L.color}</h4>
          <div className="sw">{COLORS.map((c) => <i key={c} className={c === ac ? 'on' : ''} style={{ background: c }} onClick={() => setAc(ac === c ? null : c)} />)}</div>
          <p style={{ color: 'var(--mu)', fontSize: 12 }}>{L.tplNote}</p>
        </div>)}

        {tab === 2 && (<div>
          <div className="score">
            <b style={{ color: col }}>{R.score}</b>
            <div className="meter"><div style={{ width: R.score + '%', background: col }} /></div>
          </div>
          {R.C.map((c, i) => (
            <div className="ck" key={i}>
              <span style={{ color: c.ok ? 'var(--ok)' : 'var(--no)' }}>{c.ok ? '✓' : '✗'}</span>
              <span>{c.m}{!c.ok && <small>{c.tip}</small>}</span>
            </div>))}
          <h4>{L.jdTitle}</h4>
          <textarea placeholder={L.jdPh} value={jd} onChange={(e) => setJd(e.target.value)} />
          {jd.trim() && (
            <div className="chips">
              {R.found.map((w) => <span className="chip y" key={w}>{w}</span>)}
              {R.miss.map((w) => <span className="chip n" key={w}>{w}</span>)}
            </div>)}
        </div>)}
      </div>
      <div className="pv" ref={wrap}><Paper d={d} t={tpl} ac={ac} zoom={z} L={L} /></div>
      <nav className="mbar">
        {[['edit', L.viewEdit], ['pv', L.viewPv]].map(([k, n]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => { setView(k); window.scrollTo(0, 0); }}>{n}</button>))}
      </nav>
    </div>
  );
}
