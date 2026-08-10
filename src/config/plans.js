/**
 * Format helpers for API plan objects from GET /payments/plans.
 * Prices are INR from backend .env — do not hardcode amounts here.
 */

export const formatInr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`

export const planSeatLabel = (plan) => {
  if (!plan) return ''
  if (plan.id === 'free') {
    return plan.maxSeats != null ? `Up to ${plan.maxSeats} users` : 'Limited users'
  }
  if (plan.minSeats > 0) {
    return `Min ${plan.minSeats} seats`
  }
  return 'No seat minimum'
}

export const planLimitLabel = (n, noun) => {
  if (n == null) return `Unlimited ${noun}`
  return `${n} ${noun}`
}
