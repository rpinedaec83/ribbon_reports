import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Trunk extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare node: string

  @column()
  declare date: string

  @column()
  declare zone: string

  @column({ columnName: 'local_trunk_name' })
  declare localTrunkName: string

  @column()
  declare state: string

  @column()
  declare mode: string

  @column({ columnName: 'ip_call_limit' })
  declare ipCallLimit: string

  @column({ columnName: 'maximum_ingress_sustained_call_rate' })
  declare maximumIngressSustainedCallRate: string

  @column({ columnName: 'maximum_ingress_call_burst_size' })
  declare maximumIngressCallBurstSize: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
