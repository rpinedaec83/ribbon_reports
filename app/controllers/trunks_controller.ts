// import type { HttpContext } from '@adonisjs/core/http'
import Trunk from '#models/trunk'
import { createTrunkValidator } from '#validators/create_trunk'
import type { HttpContext } from '@adonisjs/core/http'

export default class TrunksController {
  public async index({}: HttpContext) {
    return await Trunk.all()
  }

  public async store({ request }: HttpContext) {
    const data = await request.validateUsing(createTrunkValidator)
    return await Trunk.create(data)
  }

  public async show({ params }: HttpContext) {
    return await Trunk.findOrFail(params.id)
  }

  public async destroy({ params }: HttpContext) {
    const trunk = await Trunk.findOrFail(params.id)
    await trunk.delete()
    return { message: 'Trunk deleted' }
  }
}
