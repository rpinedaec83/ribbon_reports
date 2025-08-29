import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trunks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('node')
      table.string('date')
      table.string('zone')
      table.string('local_trunk_name')
      table.string('state')
      table.string('mode')
      table.string('ip_call_limit')
      table.string('maximum_ingress_sustained_call_rate')
      table.string('maximum_ingress_call_burst_size')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
