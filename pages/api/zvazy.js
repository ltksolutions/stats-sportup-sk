import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  const { year = '2024' } = req.query
  try {
    const client = await clientPromise
    const db = client.db('is_sportu')
    const data = await db.collection('osoby').aggregate([
      { $match: { ActivityID: 'athlete', Year: parseInt(year), Zvaz: { $ne: null } } },
      { $group: { _id: '$Zvaz', athletes: { $sum: 1 } } },
      { $sort: { athletes: -1 } },
      { $limit: 30 }
    ], { maxTimeMS: 25000 }).toArray()

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json({ ok: true, year: parseInt(year), data })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
