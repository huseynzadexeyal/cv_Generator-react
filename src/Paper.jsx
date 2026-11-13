import { Fragment } from 'react';
import { lines, lv, names } from './data';

const Sec = ({ h, children }) => <section><h3>{h}</h3>{children}</section>;
// Bacarıq/dil səviyyəsi: zolaq (bar) və ya nöqtələr (dots)
const LV = ({ s, mode }) => lv(s).map((x, i) => (
  <div className="lv" key={i}>
    <span>{x.n}</span>
    {mode === 'dots' ? <em>{'●'.repeat(x.v) + '○'.repeat(5 - x.v)}</em> : <i><b style={{ width: x.v * 20 + '%' }} /></i>}
  </div>));

export default function Paper({ d, t, ac, zoom, L }) {
  const style = { zoom, ...(ac ? { '--ac': ac, '--bar': ac } : {}) };
  const ct = [d.birth, d.phone, d.email, d.city, d.link].filter(Boolean);
  const ini = (d.name || '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
  const pic = <div className="pic">{d.photo ? <img src={d.photo} alt="" /> : <span>{ini}</span>}</div>;
  const exp = d.exp.map((e, i) => (
    <div className="it" key={i}>
      <div className="row"><b>{e.role}</b><span>{e.period}</span></div>
      <div className="co">{e.company}</div>
      <ul>{lines(e.desc).map((l, j) => <li key={j}>{l}</li>)}</ul>
    </div>));
  const edu = d.edu.map((e, i) => (
    <div className="it" key={i}>
      <div className="row"><b>{e.school}</b><span>{e.period}</span></div><div>{e.degree}</div>
    </div>));

  if (t.id === 'london') return (
    <div className="paper c-london" style={style}>
      <div className="bd">
        <h1>{d.name}</h1><div className="ti4">{d.title}</div>
        <div className="ct">{ct.join('  |  ')}</div>
        <Sec h={L.summary}><div>{d.summary}</div></Sec>
        <Sec h={L.skills}><div>{names(d.skills).join(' • ')}</div></Sec>
        <Sec h={L.exp}>{exp}</Sec>
        <Sec h={L.edu}>{edu}</Sec>
        <Sec h={L.langs}><div>{names(d.langs).join(' • ')}</div></Sec>
      </div>
    </div>);

  const S = {
    ph: pic,
    nm: <div className="nm"><h1>{d.name}</h1><div className="ti">{d.title}</div></div>,
    hd: (
      <header className="hd">
        {t.hdPhoto === 'l' && pic}
        <div className="hn"><h1>{d.name}</h1><div className="ti">{d.title}</div>{t.hdAbout && <p>{d.summary}</p>}</div>
        {t.hdContact && <div className="hc">{ct.map((c, i) => <p key={i}>{c}</p>)}</div>}
        {t.hdPhoto === 'r' && pic}
      </header>),
    about: <Sec h={L.summary}><div>{d.summary}</div></Sec>,
    contact: <Sec h={L.contact}>{ct.map((c, i) => <p key={i}>{c}</p>)}</Sec>,
    skills: <Sec h={L.skills}><LV s={d.skills} mode={t.mode} /></Sec>,
    langs: <Sec h={L.langs}><LV s={d.langs} mode={t.mode} /></Sec>,
    exp: <Sec h={L.exp}>{exp}</Sec>,
    edu: <Sec h={L.edu}>{edu}</Sec>,
  };
  const R = (a) => (a || []).map((k) => <Fragment key={k}>{S[k]}</Fragment>);
  const cls = `paper lay-${t.lay} c-${t.id}${d.photo ? '' : ' nophoto'}`;

  if (t.lay === 'side') return (
    <div className={cls} style={style}>
      {/* DOM sırası ATS üçün: əvvəl əsas məzmun, sonra yan panel (CSS row-reverse vizual olaraq soldadır) */}
      <main>{R(t.main)}</main>
      <aside>{R(t.side)}</aside>
    </div>);

  return (
    <div className={cls} style={style}>
      {S.hd}
      <div className="bodyc"><div className="cl">{R(t.l)}</div><div className="cr">{R(t.r)}</div></div>
      {t.foot && <footer>{R(t.foot)}</footer>}
    </div>);
}
