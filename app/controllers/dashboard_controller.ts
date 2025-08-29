import type { HttpContext } from '@adonisjs/core/http'
import Trunk from '#models/trunk'


export default class DashboardController {
  async index({ view }: HttpContext) {
    const result = await Trunk
  .query()
  .select('date')
  .countDistinct('state as total_states')
  .groupBy('date')
  .orderBy('date')
    console.log(result)
    return view.render('pages/dashboard', { result })
  }
}