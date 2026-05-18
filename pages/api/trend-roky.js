import clientPromise from '../../lib/mongodb'

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026]

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db('is_sportu')

    const [athleteData, expertData] = await Promise.all([
      db.collection('osoby').aggregate([
        { $match: { ActivityID: 'athlete', Year: { $in: YEARS } } },
        { $group: { _id: { sport: '$SportName', year: '$Year' }, count: { $sum: 1 } } }
      ], { maxTimeMS: 25000 }).toArray(),
      db.collection('osoby').aggregate([
        { $match: { ActivityID: 'expert', Year: { $in: YEARS } } },
        { $group: { _id: { sport: '$SportName', year: '$Year' }, count: { $sum: 1 } } }
      ], { maxTimeMS: 25000 }).toArray(),
    ])

    const top10 = (data) => {
      const totals = {}
      data.forEach(d => { totals[d._id.sport] = (totals[d._id.sport] || 0) + d.count })
      return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0])
    }

    const top10Athletes = top10(athleteData)
    const top10Experts = top10(expertData)

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json({
      ok: true,
      years: YEARS,
      athletes: {
        top10: top10Athletes,
        data: athleteData.filter(d => top10Athletes.includes(d._id.sport))
      },
      experts: {
        top10: top10Experts,
        data: expertData.filter(d => top10Experts.includes(d._id.sport))
      }
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
