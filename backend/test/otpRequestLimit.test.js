const assert = require('node:assert/strict')
const { it } = require('node:test')
const { createOtpRequestLimit, WINDOW_MS } = require('../src/services/otpRequestLimit')

function fixture() {
  let now = Date.parse('2026-09-09T00:00:00Z')
  let legacy = []
  const documents = new Map()
  const store = {
    findById: (id) => ({ lean: async () => structuredClone(documents.get(id) || null) }),
    updateOne: async (query, update) => {
      let document = documents.get(query._id)
      if (update.$setOnInsert) {
        if (!document) documents.set(query._id, structuredClone(update.$setOnInsert))
        return { modifiedCount: 0 }
      }
      if (!document || query.__v !== undefined && query.__v !== document.__v) return { modifiedCount: 0 }
      if (update.$set) Object.assign(document, structuredClone(update.$set))
      if (update.$pull) document.requests = document.requests.filter((r) => r.id !== update.$pull.requests.id)
      document.__v += update.$inc.__v
      return { modifiedCount: 1 }
    },
  }
  const challenges = { find: () => ({ select: () => ({ sort: () => ({ lean: async () => legacy }) }) }) }
  return { limiter: createOtpRequestLimit({ store, challenges, clock: () => now }),
    advance: (ms) => { now += ms }, seed: (rows) => { legacy = rows }, documents, now }
}

it('shares a rolling send limit across devices and purposes after OTP TTL cleanup', async () => {
  const f = fixture()
  await f.limiter.reserve('account')
  f.advance(60000)
  await f.limiter.reserve('account')
  f.advance(60000)
  const third = await f.limiter.reserve('account')
  assert.equal(third.resendAvailableAt, new Date(f.now + WINDOW_MS).toISOString())
  f.advance(11 * 60000) // All verification records may be gone; send history remains.
  await assert.rejects(f.limiter.reserve('account'), { code: 'OTP_RATE_LIMITED' })
  await f.limiter.reserve('different-account')
  f.advance(2 * 60000)
  await f.limiter.reserve('account') // Only the oldest allowance is free.
  await assert.rejects(f.limiter.reserve('account'), { code: 'OTP_RATE_LIMITED' })
})

it('allows exactly three concurrent reservations for one account', async () => {
  const f = fixture()
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => f.limiter.reserve('account')))
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 3)
  assert.equal(f.documents.get('account').requests.length, 3)
})

it('releases only the failed send reservation', async () => {
  const f = fixture()
  const reservation = await f.limiter.reserve('account')
  await f.limiter.reserve('account'); await f.limiter.reserve('account')
  await f.limiter.release(reservation)
  await f.limiter.reserve('account')
  await assert.rejects(f.limiter.reserve('account'), { code: 'OTP_RATE_LIMITED' })
})

it('imports existing sends when initializing a new counter during rollout', async () => {
  const f = fixture()
  f.seed([1,2,3].map((id) => ({ _id: id, createdAt: new Date(f.now) })))
  await assert.rejects(f.limiter.reserve('account'), { code: 'OTP_RATE_LIMITED' })
})
