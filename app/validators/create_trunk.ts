import vine from '@vinejs/vine'

export const createTrunkValidator = vine.compile(
  vine.object({
    node: vine.string(),
    date: vine.string(),
    zone: vine.string(),
    localTrunkName: vine.string(),
    state: vine.string(),
    mode: vine.string(),
    ipCallLimit: vine.string(),
    maximumIngressSustainedCallRate: vine.string(),
    maximumIngressCallBurstSize: vine.string(),
  })
)
