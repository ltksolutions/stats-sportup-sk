import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  const { year = '2024' } = req.query
  try {
    const client = await clientPromise
    const db = client.db('is_sportu')
    const data = await db.collection('osoby').aggregate([
      { $match: { ActivityID: 'athlete', Year: parseInt(year) } },
      { $group: { _id: { sport: '$SportName', vek: '$VekovaSkupina' }, count: { $sum: 1 } } },
      { $sort: { '_id.sport': 1, '_id.vek': 1 } }
    ], { maxTimeMS: 25000 }).toArray()

    // top 20 sports by total
    const totals = {}
    data.forEach(d => {
      const s = d._id.sport
      totals[s] = (totals[s] || 0) + d.count
    })
    const top20 = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0])
    const filtered = data.filter(d => top20.includes(d._id.sport))

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json({ ok: true, year: parseInt(year), top20, data: filtered })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
