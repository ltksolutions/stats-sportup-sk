import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  const { year = '2024' } = req.query
  try {
    const client = await clientPromise
    const db = client.db('is_sportu')
    const data = await db.collection('osoby').aggregate([
      { $match: { ActivityID: 'expert', Year: parseInt(year) } },
      { $group: { _id: { sport: '$SportName', kategoria: '$SubActivity' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ], { maxTimeMS: 25000 }).toArray()

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json({ ok: true, year: parseInt(year), data })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
