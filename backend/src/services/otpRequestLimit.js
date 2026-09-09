const { randomUUID } = require('crypto')
const { OtpRequestWindow, EmailVerification } = require('../models')

const WINDOW_MS = 15 * 60 * 1000
const LIMIT = 3
const limited = (retryAt) => Object.assign(new Error('Too many codes requested. Please wait before requesting another code.'), {
	status: 429, code: 'OTP_RATE_LIMITED', retryAt: new Date(retryAt).toISOString(),
})

const createOtpRequestLimit = ({ store = OtpRequestWindow, challenges = EmailVerification, clock = () => Date.now() } = {}) => {
	const reserve = async (userId) => {
		const key = String(userId)
		let bucket = await store.findById(key).lean()
		if (!bucket) {
			const now = clock()
			// Preserve still-existing requests during rollout instead of resetting the allowance.
			const legacy = await challenges.find({ userId, createdAt: { $gt: new Date(now - WINDOW_MS) } })
				.select('_id createdAt').sort({ createdAt: 1 }).lean()
			try {
				await store.updateOne({ _id: key }, { $setOnInsert: {
					requests: legacy.map((item) => ({ id: String(item._id), at: item.createdAt })),
					expiresAt: new Date(now + WINDOW_MS), __v: 0,
				} }, { upsert: true })
			} catch (error) {
				if (error.code !== 11000) throw error // Another process initialized the same account.
			}
		}
		for (let attempt = 0; attempt < 12; attempt += 1) {
			bucket = await store.findById(key).lean()
			if (!bucket) return reserve(userId) // TTL cleanup raced with initialization.
			const now = clock()
			const requests = bucket.requests.filter((item) => new Date(item.at).getTime() > now - WINDOW_MS)
			if (requests.length >= LIMIT) throw limited(new Date(requests[0].at).getTime() + WINDOW_MS)
			const id = randomUUID()
			requests.push({ id, at: new Date(now) })
			const updated = await store.updateOne({ _id: key, __v: bucket.__v }, {
				$set: { requests, expiresAt: new Date(now + WINDOW_MS) }, $inc: { __v: 1 },
			})
			if (updated.modifiedCount) return {
				id, userId: key,
				resendAvailableAt: new Date(requests.length >= LIMIT ? new Date(requests[0].at).getTime() + WINDOW_MS : now).toISOString(),
			}
		}
		throw limited(clock() + 1000)
	}
	const release = async ({ userId, id }) => store.updateOne({ _id: userId }, {
		$pull: { requests: { id } }, $inc: { __v: 1 },
	})
	return { reserve, release }
}

module.exports = { ...createOtpRequestLimit(), createOtpRequestLimit, WINDOW_MS, LIMIT }
