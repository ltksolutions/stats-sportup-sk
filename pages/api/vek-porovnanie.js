import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  const { year = '2026', activity = 'athlete' } = req.query
  try {
    const client = await clientPromise
    const db = client.db('is_sportu')

    const activityID = activity === 'expert' ? 'expert' : 'athlete'

    const data = await db.collection('osoby').aggregate([
      { $match: { Year: parseInt(year), ActivityID: activityID } },
      { $group: { _id: { sport: '$SportName', vek: '$VekovaSkupina' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ], { maxTimeMS: 25000 }).toArray()

    // Get top 30 sports by total count
    const sportTotals = {}
    data.forEach(d => {
      const s = d._id.sport
      if (s) sportTotals[s] = (sportTotals[s] || 0) + d.count
    })
    const top30 = Object.entries(sportTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([sport]) => sport)

    const filtered = data.filter(d => top30.includes(d._id.sport))

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json({ ok: true, year: parseInt(year), activity: activityID, sports: top30, data: filtered })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
