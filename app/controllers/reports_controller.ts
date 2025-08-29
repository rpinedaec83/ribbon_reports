// app/Controllers/Http/ReportsController.ts
import Trunk from '#models/trunk'
import { HttpContext } from '@adonisjs/core/http'


export default class ReportsController {

  public async index({ view }: HttpContext) {
    return view.render('pages/report/index')
  }
  
public async totales({ request, response }: HttpContext) {
  try {
    const { node } = request.qs()

    // Traer todos los registros (puedes filtrar por node si lo necesitas)
    let query = Trunk.query()
    if (node) {
      query.where('node', node)
    }
    const trunks = await query

    // Agrupar y sumar por node y date
    const totalesPorNodeDate: Record<string, Record<string, {
      totalIpCallLimit: number,
      totalMaxIngressSustainedCallRate: number,
      totalMaxIngressCallBurstSize: number
    }>> = {}

    trunks.forEach(t => {
      const nodeKey = t.node
      const dateKey = t.date || 'Sin Fecha'

      if (!totalesPorNodeDate[nodeKey]) {
        totalesPorNodeDate[nodeKey] = {}
      }
      if (!totalesPorNodeDate[nodeKey][dateKey]) {
        totalesPorNodeDate[nodeKey][dateKey] = {
          totalIpCallLimit: 0,
          totalMaxIngressSustainedCallRate: 0,
          totalMaxIngressCallBurstSize: 0
        }
      }
      totalesPorNodeDate[nodeKey][dateKey].totalIpCallLimit += t.ipCallLimit === 'UNLMT' ? 0 : Number(t.ipCallLimit || 0)
      totalesPorNodeDate[nodeKey][dateKey].totalMaxIngressSustainedCallRate += Number(t.maximumIngressSustainedCallRate || 0)
      totalesPorNodeDate[nodeKey][dateKey].totalMaxIngressCallBurstSize += Number(t.maximumIngressCallBurstSize || 0)
    })

    return response.json(totalesPorNodeDate)
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'Error al obtener totales de trunks' })
  }
}

  public async data({ request, response }: HttpContext) {
    try {
      const { node, trunk, draw, start = 0, length = 10 } = request.qs()

      let baseQuery = Trunk.query()

      if (node) {
        baseQuery.where('node', node)
      }

      if (trunk) {
        baseQuery.where('local_trunk_name', trunk)
      }

      // Total sin filtrar
      const recordsTotal = await Trunk.query().count('* as total')
      // Total filtrado
      const recordsFilteredQuery = baseQuery.clone()
      const recordsFilteredResult = await recordsFilteredQuery.count('* as total')
      const recordsFiltered = recordsFilteredResult[0]?.$extras?.total || 0

      // Datos paginados
      const rows = await baseQuery
        .clone()
        .offset(Number(start))
        .limit(Number(length))

      return response.json({
        draw: Number(draw),
        recordsTotal: recordsTotal[0]?.$extras?.total || 0,
        recordsFiltered,
        data: rows,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Error al obtener trunks' })
    }
  }

  public async filters({ request, response }: HttpContext) {
    const { node, date } = request.qs()

    // Si no hay node ni date, devuelve todos los nodes
    if (!node && !date) {
      const nodes = await Trunk.query().distinct('node').select('node')
      return response.json({
        nodes: nodes.map(n => n.node),
        dates: [],
        trunks: [],
      })
    }

    // Si hay node pero no date, devuelve las fechas disponibles para ese node
    if (node && !date) {
      const dates = await Trunk.query()
        .where('node', node)
        .distinct('date')
        .select('date')
      return response.json({
        nodes: [],
        dates: dates.map(d => d.date),
        trunks: [],
      })
    }

    // Si hay node y date, devuelve los trunks disponibles para ese node y date
    if (node && date) {
      const trunks = await Trunk.query()
        .where('node', node)
        .where('date', date)
        .distinct('local_trunk_name')
        .select('local_trunk_name')
      return response.json({
        nodes: [],
        dates: [],
        trunks: trunks.map(t => t.localTrunkName),
      })
    }

    // Si solo hay date (caso raro), devuelve nodes para esa fecha
    if (!node && date) {
      const nodes = await Trunk.query()
        .where('date', date)
        .distinct('node')
        .select('node')
      return response.json({
        nodes: nodes.map(n => n.node),
        dates: [],
        trunks: [],
      })
    }
  }

  public async deleteByDate({ request, response }: HttpContext) {
    try {
      const { date } = request.only(['date'])
      if (!date) return response.badRequest({ success: false, error: 'Fecha requerida' })

      await Trunk.query().where('date', date).delete()

      return response.json({ success: true })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ success: false, error: 'Error al eliminar registros' })
    }
  }
}
