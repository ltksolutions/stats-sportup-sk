import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db('is_sportu')

    const data = await db.collection('osoby').aggregate([
      { $match: { ActivityID: { $in: ['athlete', 'expert'] } } },
      { $group: { _id: { year: '$Year', sport: '$SportName', activity: '$ActivityID' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1 } }
    ], { maxTimeMS: 25000 }).toArray()

    const athleteTotals = {}
    const expertTotals = {}
    data.forEach(d => {
      if (d._id.activity === 'athlete') athleteTotals[d._id.sport] = (athleteTotals[d._id.sport] || 0) + d.count
      if (d._id.activity === 'expert') expertTotals[d._id.sport] = (expertTotals[d._id.sport] || 0) + d.count
    })
    const top10athletes = Object.entries(athleteTotals).sort((a,b) => b[1]-a[1]).slice(0,10).map(e=>e[0])
    const top10experts = Object.entries(expertTotals).sort((a,b) => b[1]-a[1]).slice(0,10).map(e=>e[0])

    const years = [2021,2022,2023,2024,2025,2026]

    const athleteData = top10athletes.map(sport => ({
      sport,
      values: years.map(y => {
        const row = data.find(d => d._id.sport===sport && d._id.year===y && d._id.activity==='athlete')
        return row ? row.count : 0
      })
    }))

    const expertData = top10experts.map(sport => ({
      sport,
      values: years.map(y => {
        const row = data.find(d => d._id.sport===sport && d._id.year===y && d._id.activity==='expert')
        return row ? row.count : 0
      })
    }))

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json({ ok: true, years, athleteData, expertData })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
