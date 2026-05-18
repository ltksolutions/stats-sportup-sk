import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'

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
    borderColor: active ? '#3b82f6' : '#e5e7eb',
    background: active ? '#eff6ff' : 'white',
    color: active ? '#2563eb' : '#374151',
    cursor: 'pointer', fontSize: small ? 11 : 12,
    fontWeight: active ? 600 : 400
  }}>{children}</button>
)

export default function Home() {
  const [year, setYear] = useState('2026')
  const [scaleType, setScaleType] = useState('logarithmic')
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

  const vekRef = useRef(null)
  const zvazRef = useRef(null)
  const amRef = useRef(null)
  const odborRef = useRef(null)
  const rokyAthleteRef = useRef(null)
  const rokyExpertRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/vek-sporty?year=${year}`).then(r => r.json()),
      fetch(`/api/zvazy?year=${year}`).then(r => r.json()),
      fetch(`/api/amater-profi?year=${year}`).then(r => r.json()),
      fetch(`/api/odbornici?year=${year}`).then(r => r.json()),
    ]).then(([vek, zvaz, am, odbor]) => {
      setVekData(vek)
      setZvazData(zvaz)
      setAmProfiData(am)
      setOdborData(odbor)
      setHidden(new Set())
      setLoading(false)
    })
  }, [year])

  useEffect(() => {
    setRokyLoading(true)
    fetch('/api/roky-sport').then(r => r.json()).then(d => {
      setRokyData(d)
      setRokyLoading(false)
    })
  }, [])

  const toggleAge = (age) => {
    setSelectedAges(prev => {
      const next = new Set(prev)
      if (next.has(age)) { if (next.size > 1) next.delete(age) }
      else next.add(age)
      return next
    })
  }
  const selectAllAges = () => setSelectedAges(new Set(AGE_ORDER))
  const clearAges = (group) => {
    if (group === 'youth') setSelectedAges(new Set(['do 5','6-10','11-14','15-18']))
    if (group === 'adult') setSelectedAges(new Set(['19-23','24-30','31-40']))
    if (group === 'senior') setSelectedAges(new Set(['41-50','51-60','61+']))
  }

  // Chart 1: Vek × Šport (s age filtrom)
  useEffect(() => {
    if (!vekData || !window.Chart || !vekRef.current) return
    const existing = window.Chart.getChart(vekRef.current)
    if (existing) existing.destroy()

    const activeAges = AGE_ORDER.filter(a => selectedAges.has(a))
    const { top20, data } = vekData
    const datasets = top20.map((sport, i) => {
      const pts = activeAges.map(age => {
        const row = data.find(d => d._id.sport === sport && d._id.vek === age)
        return row ? row.count : 0
      })
      return {
        label: sport, data: pts,
        borderColor: COLORS[i], backgroundColor: COLORS[i] + '33',
        borderWidth: 2, pointRadius: chartType === 'line' ? 3 : 0,
        tension: 0.35, fill: false, hidden: hidden.has(sport),
        type: chartType === 'bar' ? 'bar' : 'line',
        stack: chartType === 'bar' ? 'stack' : undefined,
      }
    })

    new window.Chart(vekRef.current, {
      type: chartType === 'bar' ? 'bar' : 'line',
      data: { labels: activeAges, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: {
          itemSort: (a,b) => b.raw - a.raw,
          callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` }
        }},
        scales: {
          x: { stacked: chartType === 'bar', ticks: { color: '#888' }, grid: { color: 'rgba(128,128,128,0.1)' } },
          y: { stacked: chartType === 'bar', type: scaleType, min: scaleType === 'logarithmic' ? 1 : undefined,
            ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v },
            grid: { color: 'rgba(128,128,128,0.1)' }
          }
        }
      }
    })
  }, [vekData, scaleType, chartType, hidden, selectedAges])

  // Chart 2: Zväzy
  useEffect(() => {
    if (!zvazData || !window.Chart || !zvazRef.current) return
    const existing = window.Chart.getChart(zvazRef.current)
    if (existing) existing.destroy()
    const labels = zvazData.data.map(d => d._id)
    const values = zvazData.data.map(d => d.athletes)
    new window.Chart(zvazRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Športovci', data: values,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length] + 'CC'),
        borderColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 1 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: c => ` ${c.parsed.x.toLocaleString('sk-SK')} športovcov` }
        }},
        scales: {
          x: { ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } },
          y: { ticks: { color: '#555', font: { size: 11 } }, grid: { display: false } }
        }
      }
    })
  }, [zvazData])

  // Chart 3: Amatér vs Profi
  useEffect(() => {
    if (!amProfiData || !window.Chart || !amRef.current) return
    const existing = window.Chart.getChart(amRef.current)
    if (existing) existing.destroy()
    const { top20, data } = amProfiData
    const types = [...new Set(data.map(d => d._id.typ))]
    const typeColors = { athlete_amateur: '#378ADD', athlete_professional: '#D85A30' }
    const datasets = types.map(typ => ({
      label: typ === 'athlete_amateur' ? 'Amatér' : typ === 'athlete_professional' ? 'Profesionál' : typ,
      data: top20.map(sport => {
        const row = data.find(d => d._id.sport === sport && d._id.typ === typ)
        return row ? row.count : 0
      }),
      backgroundColor: (typeColors[typ] || '#888') + 'BB',
      borderColor: typeColors[typ] || '#888',
      borderWidth: 1, stack: 'stack'
    }))
    new window.Chart(amRef.current, {
      type: 'bar', data: { labels: top20, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 12 }, color: '#555' } }, tooltip: {
          callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` }
        }},
        scales: {
          x: { stacked: true, ticks: { color: '#555', font: { size: 11 }, maxRotation: 35 }, grid: { display: false } },
          y: { stacked: true, ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } }
        }
      }
    })
  }, [amProfiData])

  // Chart 4: Odborníci
  useEffect(() => {
    if (!odborData || !window.Chart || !odborRef.current) return
    const existing = window.Chart.getChart(odborRef.current)
    if (existing) existing.destroy()
    const topOdbor = odborData.data.slice(0, 25)
    const labels = topOdbor.map(d => `${d._id.kategoria} – ${d._id.sport}`)
    const values = topOdbor.map(d => d.count)
    new window.Chart(odborRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Odborníci', data: values,
        backgroundColor: COLORS.map(c => c + 'BB'), borderColor: COLORS, borderWidth: 1 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: c => ` ${c.parsed.x.toLocaleString('sk-SK')} odborníkov` }
        }},
        scales: {
          x: { ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } },
          y: { ticks: { color: '#555', font: { size: 11 } }, grid: { display: false } }
        }
      }
    })
  }, [odborData])

  // Chart 5 & 6: Vývoj po rokoch
  const buildRokyChart = (canvasRef, seriesData, title) => {
    if (!seriesData || !window.Chart || !canvasRef.current) return
    const existing = window.Chart.getChart(canvasRef.current)
    if (existing) existing.destroy()
    const datasets = seriesData.map((s, i) => ({
      label: s.sport, data: s.values,
      borderColor: COLORS[i], backgroundColor: COLORS[i] + '22',
      borderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
      tension: 0.3, fill: false
    }))
    new window.Chart(canvasRef.current, {
      type: 'line',
      data: { labels: YEARS, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#555', boxWidth: 12, padding: 10 } },
          tooltip: {
            itemSort: (a,b) => b.raw - a.raw,
            callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('sk-SK')}` }
          }
        },
        scales: {
          x: { ticks: { color: '#888' }, grid: { color: 'rgba(128,128,128,0.1)' } },
          y: { ticks: { color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, grid: { color: 'rgba(128,128,128,0.1)' } }
        }
      }
    })
  }

  useEffect(() => { buildRokyChart(rokyAthleteRef, rokyData?.athleteData) }, [rokyData])
  useEffect(() => { buildRokyChart(rokyExpertRef, rokyData?.expertData) }, [rokyData])

  const toggleSport = (sport) => {
    setHidden(prev => { const next = new Set(prev); if (next.has(sport)) next.delete(sport); else next.add(sport); return next })
  }

  const totalAthletes = vekData?.data?.reduce((s, d) => s + d.count, 0) || 0

  return (
    <>
      <Head>
        <title>Štatistiky slovenského športu – IS Športu {year}</title>
        <meta name="description" content="Interaktívne štatistiky z Informačného systému športu Slovenska" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" async />
      </Head>

      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* Header */}
        <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '2rem', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: '#111' }}>IS Športu</span>
              <span style={{ fontSize: 13, background: '#f3f4f6', color: '#6b7280', padding: '2px 10px', borderRadius: 20 }}>štatistiky</span>
            </div>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '2px 0 0' }}>Dáta z Informačného systému športu Slovenska</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Rok:</span>
            {['2021','2022','2023','2024','2025','2026'].map(y => (
              <button key={y} onClick={() => setYear(y)} style={{
                padding: '4px 12px', borderRadius: 6, border: '1px solid',
                borderColor: year === y ? '#3b82f6' : '#e5e7eb',
                background: year === y ? '#eff6ff' : 'white',
                color: year === y ? '#2563eb' : '#374151',
                fontWeight: year === y ? 600 : 400,
                cursor: 'pointer', fontSize: 13
              }}>{y}</button>
            ))}
          </div>
        </header>

        {loading && <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: 15 }}>Načítavam dáta...</div>}

        {!loading && vekData && (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
              {[
                { label: 'Športovci spolu', value: totalAthletes.toLocaleString('sk-SK') },
                { label: 'Sledovaný rok', value: year },
                { label: 'Top šport', value: vekData.top20?.[0] || '–' },
                { label: 'Počet zväzov', value: zvazData?.data?.length || '–' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Section 1: Vek × Šport */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Vekový profil top 20 športov</h2>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Počet športovcov podľa vekovej skupiny</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Btn active={chartType==='line'} onClick={() => setChartType('line')} small>Čiary</Btn>
                  <Btn active={chartType==='bar'} onClick={() => setChartType('bar')} small>Stĺpce</Btn>
                  <Btn active={scaleType==='linear'} onClick={() => setScaleType('linear')} small>Lineárna</Btn>
                  <Btn active={scaleType==='logarithmic'} onClick={() => setScaleType('logarithmic')} small>Log</Btn>
                </div>
              </div>

              {/* Filter vekových skupín */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>Vekové skupiny:</span>
                  <button onClick={selectAllAges} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: selectedAges.size === AGE_ORDER.length ? '#dbeafe' : 'white', color: selectedAges.size === AGE_ORDER.length ? '#1d4ed8' : '#6b7280', cursor: 'pointer' }}>Všetky</button>
                  <button onClick={() => clearAges('youth')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: 'white', color: '#6b7280', cursor: 'pointer' }}>Mládež</button>
                  <button onClick={() => clearAges('adult')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: 'white', color: '#6b7280', cursor: 'pointer' }}>Dospelí</button>
                  <button onClick={() => clearAges('senior')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #d1d5db', background: 'white', color: '#6b7280', cursor: 'pointer' }}>Seniori</button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {AGE_ORDER.map(age => (
                      <button key={age} onClick={() => toggleAge(age)} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid',
                        borderColor: selectedAges.has(age) ? '#3b82f6' : '#e5e7eb',
                        background: selectedAges.has(age) ? '#eff6ff' : 'white',
                        color: selectedAges.has(age) ? '#2563eb' : '#9ca3af',
                        cursor: 'pointer'
                      }}>{age}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legenda športov */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 12 }}>
                {vekData.top20.map((sport, i) => (
                  <span key={sport} onClick={() => toggleSport(sport)} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, cursor: 'pointer', color: '#555',
                    opacity: hidden.has(sport) ? 0.35 : 1
                  }}>
                    <span style={{ width: 12, height: 3, borderRadius: 2, background: COLORS[i], display: 'inline-block' }} />
                    {sport}
                  </span>
                ))}
              </div>

              <div style={{ position: 'relative', height: 380 }}>
                <canvas ref={vekRef} />
              </div>
            </section>

            {/* Section 2: Zväzy */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Top 30 zväzov podľa počtu športovcov</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1rem' }}>Aktívni športovci registrovaní v zväze</p>
              <div style={{ position: 'relative', height: zvazData.data.length * 28 + 60 }}>
                <canvas ref={zvazRef} />
              </div>
            </section>

            {/* Section 3: Amatér vs Profi */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Amatéri vs. profesionáli – top 20 športov</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1rem' }}>Rozdelenie podľa statusu športovca</p>
              <div style={{ position: 'relative', height: 380 }}>
                <canvas ref={amRef} />
              </div>
            </section>

            {/* Section 4: Odborníci */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Športoví odborníci – top 25 kategórií</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1rem' }}>Počet odborníkov podľa kategórie a športu</p>
              <div style={{ position: 'relative', height: 800 }}>
                <canvas ref={odborRef} />
              </div>
            </section>
          </>
        )}

        {/* Section 5 & 6: Vývoj po rokoch – vždy viditeľné */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>Vývoj top 10 športov 2021–2026</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 1.5rem' }}>Počet registrovaných osôb po rokoch</p>

          {rokyLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 14 }}>Načítavam ročné dáta...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Športovci</p>
                <div style={{ position: 'relative', height: 320 }}>
                  <canvas ref={rokyAthleteRef} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Športoví odborníci</p>
                <div style={{ position: 'relative', height: 320 }}>
                  <canvas ref={rokyExpertRef} />
                </div>
              </div>
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
