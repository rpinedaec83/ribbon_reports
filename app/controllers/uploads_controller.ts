import Trunk from '#models/trunk'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs'

export default class UploadsController {
  public async store({ request, response, session }: HttpContext) {
    const file = request.file('file', {
      extnames: ['txt'],
      size: '20mb',
    })

    if (!file) {
      return response.badRequest('No file uploaded')
    }

    await file.move(app.tmpPath('uploads'), {
      overwrite: true,
    })

    const filePath = app.tmpPath(`uploads/${file.fileName}`)
    const rawText = fs.readFileSync(filePath, 'utf-8')

    const parsedData = this.parseFile(rawText)

    let inserted = 0
    let duplicated = 0

    for (const data of parsedData) {
      const exists = await Trunk.query()
        .where('local_trunk_name', data.localTrunkName)
        .andWhere('node', data.node)
        .andWhere('date', data.date)
        .first()

      if (exists) {
        duplicated++
        continue
      }

      await Trunk.create(data)
      inserted++
    }

    fs.unlinkSync(filePath)

    session.flash('success', `Carga completa: ${inserted} insertados, ${duplicated} duplicados`)
    return response.redirect('/report')
  }

  async show({ view }: HttpContext) {
    return view.render('pages/upload/upload')
  }

  private parseFile(rawText: string) {
    const entries: any[] = []
    const blocks = rawText.split(/Local Trunk Name:/g).slice(1)
    const nodeInfo = rawText.match(/Node:\s+(.*?)\s+Date:\s+(.*?)\s+Zone:\s+(.*)/)

    const node = nodeInfo?.[1]?.trim() || ''
    const date = nodeInfo?.[2]?.trim() || ''
    const zone = nodeInfo?.[3]?.trim() || ''

    for (let block of blocks) {
      const lines = block.split('\n')
      const data: any = {
        node,
        date,
        zone,
        localTrunkName: lines[0].trim(),
      }

      const fields: Record<string, string> = {
        state: 'State',
        mode: 'Mode',
        ipCallLimit: 'IP Call Limit',
        maximumIngressSustainedCallRate: 'Maximum Ingress Sustained Call Rate',
        maximumIngressCallBurstSize: 'Maximum Ingress Call Burst Size',
      }

      for (const [key, label] of Object.entries(fields)) {
        const match = block.match(new RegExp(label + '\\s+(.*)'))
        data[key] = match?.[1]?.trim() || ''
      }

      entries.push(data)
    }

    return entries
  }
}
