import { useEffect, useState } from 'react'
import { deadlineRemaining, formatCountdown } from './verificationFeedback'

export function useVerificationTiming(challenge, retry) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!challenge && !retry) return
    // Recalculate from timestamps so backgrounding does not pause the countdown.
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [challenge, retry])
  const resendSeconds = Math.max(
    deadlineRemaining(challenge?.resendAvailableAt, challenge, now),
    deadlineRemaining(retry?.retryAt, retry, now),
  )
  const expiresSeconds = deadlineRemaining(challenge?.expiresAt, challenge, now)
  return {
    resendSeconds,
    resendLabel: resendSeconds ? `Resend code in ${formatCountdown(resendSeconds)}` : 'Resend code',
    expirationLabel: challenge?.expiresAt
      ? expiresSeconds ? `Code expires in ${formatCountdown(expiresSeconds)}` : 'Code expired. Request a new code.'
      : '',
  }
}
