import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const OG_TITLE       = 'Štatistiky slovenského športu – SportStats'
const OG_DESCRIPTION = 'Interaktívny dashboard dát o Slovenskom športe pre roky 2021-2026'
const OG_URL         = 'https://stats.sportup.sk'
const OG_IMAGE       = 'https://stats.sportup.sk/og-image.png'

const Logo = () => (
  <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#1A2D47"/>
      <rect x="7" y="25" width="5" height="8" rx="1.5" fill="#388FC3"/>
      <rect x="14" y="19" width="5" height="14" rx="1.5" fill="white"/>
      <rect x="21" y="22" width="5" height="11" rx="1.5" fill="#388FC3"/>
      <rect x="28" y="14" width="5" height="19" rx="1.5" fill="white"/>
    </svg>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#1A2D47', letterSpacing: '-0.02em', fontFamily: "'Poppins', system-ui, sans-serif", lineHeight: 1 }}>SportStats</span>
        <span style={{ fontSize: 11, background: '#1A2D47', color: 'white', padding: '2px 9px', borderRadius: 20, fontWeight: 500, letterSpacing: '0.03em', lineHeight: '18px' }}>štatistiky</span>
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', fontFamily: 'system-ui, sans-serif' }}>Good Idead Sport Slovakia</p>
    </div>
  </Link>
)

const AGE_ORDER = ['do 5','6-10','11-14','15-18','19-23','24-30','31-40','41-50','51-60','61+']
const YEARS = [2021,2022,2023,2024,2025,2026]

const COLORS = [
  '#378ADD','#1D9E75','#D85A30','#D4537E','#7F77DD',
  '#185FA5','#888780','#EF9F27','#0F6E56','#534AB7',
  '#993C1D','#E24B4A','#993556','#BA7517','#3B6D11',
  '#0C447C','#C0519A','#5DCAA5','#AFA9EC','#854F0B'
]

const Btn = ({ active, onClick, children, small }) => (
  <button onClick={onClick} style={{
    padding: small ? '3px 8px' : '4px 10px',
    borderRadius: 6, border: '1px solid',
    borderColor: active ? '#388FC3' : '#e5e7eb',
    background: active ? '#EBF5FB' : 'white',
    color: active ? '#1A2D47' : '#374151',
    cursor: 'pointer', fontSize: small ? 11 : 12,
    fontWeight: active ? 700 : 400
  }}>{children}</button>
)

const SportLoader = ({ size = 'large', text = 'Načítavam dáta...' }) => (
  <div style={{ textAlign: 'center', padding: size === 'large' ? '4rem 2rem' : '1.5rem 1rem' }}>
    <style>{`
      @keyframes sl-bounce {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      @keyframes sl-shadow {
        0%, 100% { transform: scaleX(1); opacity: 0.25; }
        50% { transform: scaleX(0.45); opacity: 0.08; }
      }
      @keyframes sl-dot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
        40% { transform: translateY(-5px); opacity: 1; }
      }
      @keyframes sl-shimmer {
        0% { background-position: -600px 0; }
        100% { background-position: 600px 0; }
      }
    `}</style>
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: size === 'large' ? 44 : 28, display: 'block', animation: 'sl-bounce 0.9s ease-in-out infinite', lineHeight: 1 }}>⚽</span>
      <div style={{ width: size === 'large' ? 28 : 18, height: 5, background: '#1A2D47', borderRadius: '50%', marginTop: 6, animation: 'sl-shadow 0.9s ease-in-out infinite' }} />
    </div>
    <div style={{ marginTop: 14, color: '#9ca3af', fontSize: size === 'large' ? 14 : 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <span>{text}</span>
      {[0, 0.18, 0.36].map((d, i) => (
        <span key={i} style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#388FC3', animation: `sl-dot 1.1s ease-in-out ${d}s infinite` }} />
      ))}
    </div>
  </div>
)

const SkeletonGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{ background: 'white', borderRadius: 12, padding: '1.2rem', border: '1px solid #f3f4f6' }}>
        <div style={{ height: 11, width: '55%', borderRadius: 6, marginBottom: 10, background: 'linear-gradient(90deg,#e5e7eb 25%,#f9fafb 50%,#e5e7eb 75%)', backgroundSize: '600px 100%', animation: `sl-shimmer 1.4s infinite linear ${i * 0.08}s` }} />
        <div style={{ height: 28, width: '75%', borderRadius: 6, background: 'linear-gradient(90deg,#e5e7eb 25%,#f9fafb 50%,#e5e7eb 75%)', backgroundSize: '600px 100%', animation: `sl-shimmer 1.4s infinite linear ${i * 0.08 + 0.1}s` }} />
      </div>
    ))}
  </div>
)


export default function Home() {
  const [year, setYear] = useState('2026')
  const [scaleType, setScaleType] = useState('linear')
  const [chartType, setChartType] = useState('line')
  const [hidden, setHidden] = useState(new Set())
  const [selectedAges, setSelectedAges] = useState(new Set(AGE_ORDER))
  const [vekData, setVekData] = useState(null)
  const [zvazData, setZvazData] = useState(null)
  const [amProfiData, setAmProfiData] = useState(null)
  const [odborData, setOdborData] = useState(null)
  const [rokyData, setRokyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rokyLoading, setRokyLoading] = useState(true)

  // Comparison chart state
  const [compareActivity, setCompareActivity] = useState('athlete')
  const [compareData, setCompareData] = useState(null)
  const [compareLoading, setCompareLoading] = useState(true)
  const [compareSports, setCompareSports] = useState(new Set())
  const [compareSelectedAges, setCompareSelectedAges] = useState(new Set(AGE_ORDER))

  // Chart.js async load tracker — všetky grafy čakajú na chartReady=true
  const [chartReady, setChartReady] = useState(false)

  const vekRef = useRef(null)
  const zvazRef = useRef(null)
  const amRef = useRef(null)
  const odborRef = useRef(null)
  const rokyAthleteRef = useRef(null)
  const rokyExpertRef = useRef(null)
  const compareRef = useRef(null)

  // Polluj kým Chart.js nebude dostupný (načítava sa async)
  useEffect(() => {
    if (window.Chart) { setChartReady(true); return }
    const id = setInterval(() => {
      if (window.Chart) { setChartReady(true); clearInterval(id) }
    }, 50)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/vek-sporty?year=${year}`).then(r => r.json()),
      fetch(`/api/zvazy?year=${year}`).then(r => r.json()),
      fetch(`/api/amater-profi?year=${year}`).then(r => r.json()),
      fetch(`/api/odbornici?year=${year}`).then(r => r.json()),
    ]).then(([vek, zvaz, am, odbor]) => {
      setVekData(vek); setZvazData(zvaz); setAmProfiData(am); setOdborData(odbor)
      setHidden(new Set()); setLoading(false)
    })
  }, [year])

  useEffect(() => {
    setRokyLoading(true)
    fetch('/api/roky-sport').then(r => r.json()).then(d => { setRokyData(d); setRokyLoading(false) })
  }, [])

  useEffect(() => {
    setCompareLoading(true); setCompareSports(new Set())
    fetch(`/api/vek-porovnanie?year=${year}&activity=${compareActivity}`)
      .then(r => r.json()).then(d => {
        setCompareData(d)
        setCompareSports(new Set((d.sports || []).slice(0, 5)))
        setCompareLoading(false)
      })
  }, [year, compareActivity])

  const toggleAge = (age) => setSelectedAges(prev => {
    const next = new Set(prev)
    if (next.has(age)) { if (next.size > 1) next.delete(age) } else next.add(age)
    return next
  })
  const selectAllAges = () => setSelectedAges(new Set(AGE_ORDER))
  const clearAges = (group) => {
    if (group === 'youth')  setSelectedAges(new Set(['do 5','6-10','11-14','15-18']))
    if (group === 'adult')  setSelectedAges(new Set(['19-23','24-30','31-40']))
    if (group === 'senior') setSelectedAges(new Set(['41-50','51-60','61+']))
  }
  const toggleCompareSport = (sport) => setCompareSports(prev => {
    const next = new Set(prev)
    if (next.has(sport)) { if (next.size > 1) next.delete(sport) }
    else { if (next.size < 10) next.add(sport) }
    return next
  })
  const toggleCompareAge = (age) => setCompareSelectedAges(prev => {
    const next = new Set(prev)
    if (next.has(age)) { if (next.size > 1) next.delete(age) } else next.add(age)
    return next
  })
  const toggleSport = (sport) => setHidden(prev => {
    const next = new Set(prev); if (next.has(sport)) next.delete(sport); else next.add(sport); return next
  })

  // Chart 1: Vek × Šport
  useEffect(() => {
    if (!chartReady || !vekData || !vekRef.current) return
    const existing = window.Chart.getChart(vekRef.current); if (existing) existing.destroy()
    const activeAges = AGE_ORDER.filter(a => selectedAges.has(a))
    const { top20, data } = vekData
    const datasets = top20.map((sport, i) => ({
      label: sport,
      data: activeAges.map(age => { const r = data.find(d => d._id.sport === sport && d._id.vek === age); return r ? r.count : 0 }),
      borderColor: COLORS[i], backgroundColor: COLORS[i] + '33',
      borderWidth: 2, pointRadius: chartType === 'line' ? 3 : 0,
      tension: 0.35, fill: false, hidden: hidden.has(sport),
      type: chartType === 'bar' ? 'bar' : 'line',
      stack: chartType === 'bar' ? 'stack' : undefined,
    }))
    new window.Chart(vekRef.current, {
      type: chartType === 'bar' ? 'bar' : 'line', data: { labels: activeAges, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { itemSort: (a,b) => b.raw - a.raw, callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` } } },
        scales: {
          x: { stacked: chartType === 'bar', ticks: { color: '#888' }, grid: { color: 'rgba(128,128,128,0.1)' } },
          y: { stacked: chartType === 'bar', type: scaleType, min: scaleType === 'logarithmic' ? 1 : 0, ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } }
        }
      }
    })
  }, [chartReady, vekData, scaleType, chartType, hidden, selectedAges])

  // Chart 2: Zväzy
  useEffect(() => {
    if (!chartReady || !zvazData || !zvazRef.current) return
    const existing = window.Chart.getChart(zvazRef.current); if (existing) existing.destroy()
    const labels = zvazData.data.map(d => d._id), values = zvazData.data.map(d => d.athletes)
    new window.Chart(zvazRef.current, {
      type: 'bar', data: { labels, datasets: [{ label: 'Športovci', data: values, backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length] + 'CC'), borderColor: labels.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 1 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x.toLocaleString('sk-SK')} športovcov` } } }, scales: { x: { ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } }, y: { ticks: { color: '#555', font: { size: 11 } }, grid: { display: false } } } }
    })
  }, [chartReady, zvazData])

  // Chart 3: Amatér vs Profi
  useEffect(() => {
    if (!chartReady || !amProfiData || !amRef.current) return
    const existing = window.Chart.getChart(amRef.current); if (existing) existing.destroy()
    const { top20, data } = amProfiData
    const types = [...new Set(data.map(d => d._id.typ))]
    const typeColors = { athlete_amateur: '#378ADD', athlete_professional: '#D85A30' }
    new window.Chart(amRef.current, {
      type: 'bar', data: { labels: top20, datasets: types.map(typ => ({ label: typ === 'athlete_amateur' ? 'Amatér' : typ === 'athlete_professional' ? 'Profesionál' : typ, data: top20.map(sport => { const r = data.find(d => d._id.sport === sport && d._id.typ === typ); return r ? r.count : 0 }), backgroundColor: (typeColors[typ] || '#888') + 'BB', borderColor: typeColors[typ] || '#888', borderWidth: 1, stack: 'stack' })) },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 12 }, color: '#555' } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` } } }, scales: { x: { stacked: true, ticks: { color: '#555', font: { size: 11 }, maxRotation: 35 }, grid: { display: false } }, y: { stacked: true, ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } } } }
    })
  }, [chartReady, amProfiData])

  // Chart 4: Odborníci
  useEffect(() => {
    if (!chartReady || !odborData || !odborRef.current) return
    const existing = window.Chart.getChart(odborRef.current); if (existing) existing.destroy()
    const topOdbor = odborData.data.slice(0, 25)
    new window.Chart(odborRef.current, {
      type: 'bar', data: { labels: topOdbor.map(d => `${d._id.kategoria} – ${d._id.sport}`), datasets: [{ label: 'Odborníci', data: topOdbor.map(d => d.count), backgroundColor: COLORS.map(c => c + 'BB'), borderColor: COLORS, borderWidth: 1 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x.toLocaleString('sk-SK')} odborníkov` } } }, scales: { x: { ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } }, y: { ticks: { color: '#555', font: { size: 11 } }, grid: { display: false } } } }
    })
  }, [chartReady, odborData])

  // Charts 5 & 6: Vývoj po rokoch
  const buildRokyChart = (canvasRef, seriesData) => {
    if (!canvasRef.current) return
    const existing = window.Chart.getChart(canvasRef.current); if (existing) existing.destroy()
    new window.Chart(canvasRef.current, {
      type: 'line', data: { labels: YEARS, datasets: seriesData.map((s, i) => ({ label: s.sport, data: s.values, borderColor: COLORS[i], backgroundColor: COLORS[i] + '22', borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.3, fill: false })) },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#555', boxWidth: 12, padding: 10 } }, tooltip: { itemSort: (a,b) => b.raw - a.raw, callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` } } }, scales: { x: { ticks: { color: '#888' }, grid: { color: 'rgba(128,128,128,0.1)' } }, y: { ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } } } }
    })
  }
  useEffect(() => { if (chartReady && rokyData?.athleteData) buildRokyChart(rokyAthleteRef, rokyData.athleteData) }, [chartReady, rokyData])
  useEffect(() => { if (chartReady && rokyData?.expertData)  buildRokyChart(rokyExpertRef,  rokyData.expertData)  }, [chartReady, rokyData])

  // Chart 7: Porovnanie športov
  useEffect(() => {
    if (!chartReady || !compareData || compareSports.size === 0) return
    // rAF zaručí, že canvas má správne rozmery po každom layout-e
    const raf = requestAnimationFrame(() => {
      if (!compareRef.current) return
      const existing = window.Chart.getChart(compareRef.current); if (existing) existing.destroy()
      const activeAges = AGE_ORDER.filter(a => compareSelectedAges.has(a))
      const selectedList = [...compareSports]
      new window.Chart(compareRef.current, {
        type: 'line',
        data: { labels: activeAges, datasets: selectedList.map((sport, i) => ({ label: sport, data: activeAges.map(age => { const r = compareData.data.find(d => d._id.sport === sport && d._id.vek === age); return r ? r.count : 0 }), borderColor: COLORS[i % COLORS.length], backgroundColor: COLORS[i % COLORS.length] + '22', borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 7, tension: 0.35, fill: false })) },
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, color: '#555', boxWidth: 14, padding: 12 } }, tooltip: { itemSort: (a,b) => b.raw - a.raw, callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` } } }, scales: { x: { ticks: { color: '#888' }, grid: { color: 'rgba(128,128,128,0.1)' } }, y: { min: 0, ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(1)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } } } }
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [chartReady, compareData, compareSports, compareSelectedAges, compareLoading])

  const totalAthletes = vekData?.data?.reduce((s, d) => s + d.count, 0) || 0

  return (
    <>
      <Head>
        <title>{OG_TITLE}</title>
        <meta name="description" content={OG_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type"         content="website" />
        <meta property="og:url"          content={OG_URL} />
        <meta property="og:title"        content={OG_TITLE} />
        <meta property="og:description"  content={OG_DESCRIPTION} />
        <meta property="og:image"        content={OG_IMAGE} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale"       content="sk_SK" />
        <meta property="og:site_name"    content="stats.sportup.sk" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={OG_TITLE} />
        <meta name="twitter:description" content={OG_DESCRIPTION} />
        <meta name="twitter:image"       content={OG_IMAGE} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" async />
      </Head>

      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '2rem', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Logo />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Rok:</span>
            {['2021','2022','2023','2024','2025','2026'].map(y => (
              <button key={y} onClick={() => setYear(y)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid', borderColor: year === y ? '#388FC3' : '#e5e7eb', background: year === y ? '#EBF5FB' : 'white', color: year === y ? '#1A2D47' : '#374151', fontWeight: year === y ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{y}</button>
            ))}
          </div>
        </header>

        <div style={{ background: "#FFF8E1", border: "1px solid #F9A825", borderRadius: 8, padding: "8px 16px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18, lineHeight: 1 }}>⚠️</span><span style={{ fontSize: 13, color: "#7B5E00", fontWeight: 500 }}>Neverifikované, neoficiálne čísla — beta verzia</span></div>
        {loading && <><SkeletonGrid /><SportLoader size='large' text='Načítavam dáta' /></>}

        {!loading && vekData && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
              {[
                { label: 'Športovci spolu', value: totalAthletes.toLocaleString('sk-SK') },
                { label: 'Sledovaný rok',   value: year },
                { label: 'Top šport',       value: vekData.top20?.[0] || '–' },
                { label: 'Počet zväzov',    value: zvazData?.data?.length || '–' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* ─── SEKCIA 1: Vekový profil ─── */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Vekový profil top 20 športov</h2>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Počet športovcov podľa vekovej skupiny · {year}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Btn active={chartType==='line'} onClick={() => setChartType('line')} small>Čiary</Btn>
                  <Btn active={chartType==='bar'}  onClick={() => setChartType('bar')}  small>Stĺpce</Btn>
                  <Btn active={scaleType==='linear'}      onClick={() => setScaleType('linear')}      small>Lineárna</Btn>
                  <Btn active={scaleType==='logarithmic'} onClick={() => setScaleType('logarithmic')} small>Log</Btn>
                </div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>Vekové skupiny:</span>
                  <button onClick={selectAllAges} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: selectedAges.size === AGE_ORDER.length ? '#dbeafe' : 'white', color: selectedAges.size === AGE_ORDER.length ? '#1d4ed8' : '#6b7280', cursor: 'pointer' }}>Všetky</button>
                  {['youth','adult','senior'].map(g => (
                    <button key={g} onClick={() => clearAges(g)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: 'white', color: '#6b7280', cursor: 'pointer' }}>
                      {g === 'youth' ? 'Mládež' : g === 'adult' ? 'Dospelí' : 'Seniori'}
                    </button>
                  ))}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {AGE_ORDER.map(age => (
                      <button key={age} onClick={() => toggleAge(age)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid', borderColor: selectedAges.has(age) ? '#388FC3' : '#e5e7eb', background: selectedAges.has(age) ? '#EBF5FB' : 'white', color: selectedAges.has(age) ? '#1A2D47' : '#9ca3af', cursor: 'pointer' }}>{age}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 12 }}>
                {vekData.top20.map((sport, i) => (
                  <span key={sport} onClick={() => toggleSport(sport)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', color: '#555', opacity: hidden.has(sport) ? 0.35 : 1 }}>
                    <span style={{ width: 12, height: 3, borderRadius: 2, background: COLORS[i], display: 'inline-block' }} />{sport}
                  </span>
                ))}
              </div>
              <div style={{ position: 'relative', height: 380 }}><canvas ref={vekRef} /></div>
            </section>

            {/* ─── SEKCIA 2: Porovnanie ─── */}
            <section style={{ marginBottom: '3rem', background: '#f9fafb', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Porovnanie športov podľa vekovej štruktúry</h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Výber 1–10 športov · {year}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Kategória:</span>
                {[['athlete','Športovci'],['expert','Odborníci']].map(([val, label]) => (
                  <button key={val} onClick={() => setCompareActivity(val)} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid', borderColor: compareActivity === val ? '#1A2D47' : '#e5e7eb', background: compareActivity === val ? '#1A2D47' : 'white', color: compareActivity === val ? 'white' : '#374151', fontWeight: compareActivity === val ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{label}</button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
              {/* Loader overlay — canvas zostáva v DOM */}
              {compareLoading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, zIndex: 10 }}>
                  <SportLoader size='small' text='Načítavam porovnanie' />
                </div>
              )}
              {/* Ovládacie prvky — zobrazia sa keď dáta sú pripravené */}
              {!compareLoading && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Vybrané športy ({compareSports.size}/10) — kliknutím pridáš alebo odoberieš:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(compareData?.sports || []).map((sport) => {
                        const isSelected = compareSports.has(sport)
                        const idx = [...compareSports].indexOf(sport)
                        return (
                          <button key={sport} onClick={() => toggleCompareSport(sport)} style={{ padding: '4px 10px', borderRadius: 20, border: '2px solid', borderColor: isSelected ? COLORS[idx % COLORS.length] : '#e5e7eb', background: isSelected ? COLORS[idx % COLORS.length] + '22' : 'white', color: isSelected ? '#111' : '#6b7280', cursor: 'pointer', fontSize: 12, fontWeight: isSelected ? 600 : 400, opacity: !isSelected && compareSports.size >= 10 ? 0.4 : 1 }}>{sport}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: 8, padding: '8px 12px', marginBottom: 14, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>Vek:</span>
                      <button onClick={() => setCompareSelectedAges(new Set(AGE_ORDER))} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: compareSelectedAges.size === AGE_ORDER.length ? '#dbeafe' : 'white', color: compareSelectedAges.size === AGE_ORDER.length ? '#1d4ed8' : '#6b7280', cursor: 'pointer' }}>Všetky</button>
                      {AGE_ORDER.map(age => (
                        <button key={age} onClick={() => toggleCompareAge(age)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid', borderColor: compareSelectedAges.has(age) ? '#388FC3' : '#e5e7eb', background: compareSelectedAges.has(age) ? '#EBF5FB' : 'white', color: compareSelectedAges.has(age) ? '#1A2D47' : '#9ca3af', cursor: 'pointer' }}>{age}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {/* Canvas VŽDY v DOM — nikdy display:none, Chart.js má vždy správne rozmery */}
              <div style={{ position: 'relative', height: 360, background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid #e5e7eb' }}>
                <canvas ref={compareRef} />
              </div>
              {/* Súčty po vybraných športoch */}
              {!compareLoading && compareData && compareSports.size > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Celkový počet (vybrané vekové skupiny)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[...compareSports]
                      .map((sport, i) => {
                        const activeAges = AGE_ORDER.filter(a => compareSelectedAges.has(a))
                        const total = activeAges.reduce((sum, age) => {
                          const r = compareData.data.find(d => d._id.sport === sport && d._id.vek === age)
                          return sum + (r ? r.count : 0)
                        }, 0)
                        return { sport, total, color: COLORS[i % COLORS.length] }
                      })
                      .sort((a, b) => b.total - a.total)
                      .map(({ sport, total, color }) => (
                        <div key={sport} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e5e7eb', borderLeft: `4px solid ${color}`, borderRadius: 8, padding: '8px 14px', minWidth: 160 }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{sport}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{total.toLocaleString('sk-SK')}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            </section>

            {/* ─── SEKCIA 3: Zväzy ─── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Top 30 zväzov podľa počtu športovcov</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1rem' }}>Aktívni športovci registrovaní v zväze · {year}</p>
              <div style={{ position: 'relative', height: zvazData.data.length * 28 + 60 }}><canvas ref={zvazRef} /></div>
            </section>

            {/* ─── SEKCIA 4: Amatér vs Profi ─── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Amatéri vs. profesionáli – top 20 športov</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1rem' }}>Rozdelenie podľa statusu športovca · {year}</p>
              <div style={{ position: 'relative', height: 380 }}><canvas ref={amRef} /></div>
            </section>

            {/* ─── SEKCIA 5: Odborníci ─── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Športoví odborníci – top 25 kategórií</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1rem' }}>Počet odborníkov podľa kategórie a športu · {year}</p>
              <div style={{ position: 'relative', height: 800 }}><canvas ref={odborRef} /></div>
            </section>
          </>
        )}

        {/* ─── SEKCIA 6 & 7: Vývoj po rokoch ─── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Vývoj top 10 športov 2021–2026</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1.5rem' }}>Počet registrovaných osôb po rokoch</p>
          {rokyLoading ? (
            <SportLoader size='small' text='Načítavam ročné dáta' />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div><p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Športovci</p><div style={{ position: 'relative', height: 320 }}><canvas ref={rokyAthleteRef} /></div></div>
              <div><p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Športoví odborníci</p><div style={{ position: 'relative', height: 320 }}><canvas ref={rokyExpertRef} /></div></div>
            </div>
          )}
        </section>

        <footer style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          Dáta: Informačný systém športu SR · stats.sportup.sk
        </footer>
      </div>
    </>
  )
}
