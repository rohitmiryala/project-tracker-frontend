import PasswordInputWithStrength from '@/components/PasswordInputWithStrength'
import { formatInr, planLimitLabel, planSeatLabel } from '@/config/plans'
import { useAuth } from '@/hooks/useAuth'
import { plansService } from '@/services/plansService'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, FormCheck, FormControl, FormLabel, Spinner } from 'react-bootstrap'
import { useSearchParams } from 'react-router'

const passwordLooksValid = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password)

const Forms = () => {
  const { register, loading, error, setError } = useAuth()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState(null)

  const initialPlan = useMemo(() => searchParams.get('plan') || 'free', [searchParams])

  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: initialPlan,
    terms: false,
  })

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const json = await plansService.list()
        const list = json?.data || []
        if (!alive) return
        setPlans(list)
        if (!list.some((p) => p.id === form.plan) && list[0]) {
          setForm((prev) => ({ ...prev, plan: list[0].id }))
        }
      } catch (err) {
        if (alive) setPlansError(err.message || 'Could not load plans')
      } finally {
        if (alive) setPlansLoading(false)
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, [])

  const selectedPlan = plans.find((p) => p.id === form.plan)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError?.(null)
  }

  const setPassword = (password) => {
    setForm((prev) => ({ ...prev, password }))
    setError?.(null)
  }

  const goNext = (e) => {
    e.preventDefault()
    setError?.(null)
    if (!form.terms) {
      setError?.('Please agree to the Terms & Policy')
      return
    }
    if (!passwordLooksValid(form.password)) {
      setError?.('Password must be 8+ chars with upper, lower, number, and special character')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError?.('Passwords do not match')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError?.(null)
    if (!form.plan) {
      setError?.('Select a plan to continue')
      return
    }
    try {
      await register({
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        plan: form.plan,
      })
    } catch {
      // error via useAuth
    }
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="small text-muted fw-semibold">Step {step} of 2</span>
        <div className="d-flex gap-1" aria-hidden="true">
          <span className={`rounded-pill ${step === 1 ? 'bg-primary' : 'bg-primary-subtle'}`} style={{ width: 28, height: 6 }} />
          <span className={`rounded-pill ${step === 2 ? 'bg-primary' : 'bg-secondary-subtle'}`} style={{ width: 28, height: 6 }} />
        </div>
      </div>

      {step === 1 && (
        <Form onSubmit={goNext}>
          <p className="text-muted small mb-3">Account basics — you&apos;ll pick a plan next.</p>
          <div className="mb-3">
            <FormLabel>
              Full name <span className="text-danger">*</span>
            </FormLabel>
            <FormControl type="text" name="fullName" placeholder="Jane Doe" value={form.fullName} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <FormLabel>
              Company name <span className="text-danger">*</span>
            </FormLabel>
            <FormControl
              type="text"
              name="companyName"
              placeholder="Acme Pvt Ltd"
              value={form.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <FormLabel>
              Email address <span className="text-danger">*</span>
            </FormLabel>
            <FormControl
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-3" data-password="bar">
            <PasswordInputWithStrength
              id="password"
              label="Password"
              name="password"
              password={form.password}
              setPassword={setPassword}
              showIcon
              placeholder="••••••••"
            />
          </div>
          <div className="mb-3">
            <FormLabel>
              Confirm password <span className="text-danger">*</span>
            </FormLabel>
            <FormControl
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <FormCheck>
              <Form.Check.Input
                className="form-check-input-light fs-14"
                type="checkbox"
                id="termAndPolicy"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
              />
              <Form.Check.Label htmlFor="termAndPolicy">Agree the Terms &amp; Policy</Form.Check.Label>
            </FormCheck>
          </div>
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          <div className="d-grid">
            <Button variant="primary" type="submit" className="fw-semibold py-2">
              Continue to plans
            </Button>
          </div>
        </Form>
      )}

      {step === 2 && (
        <Form onSubmit={handleSubmit}>
          <p className="text-muted small mb-3">Choose how you want to bill — prices come from live plan config.</p>

          {plansLoading && (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          )}
          {plansError && <Alert variant="danger">{plansError}</Alert>}

          <div className="d-flex flex-column gap-2 mb-3">
            {plans.map((plan) => {
              const active = form.plan === plan.id
              const isFree = plan.id === 'free' || !plan.pricePerUserInr
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`text-start border rounded-3 p-3 bg-transparent ${active ? 'border-primary shadow-sm' : ''}`}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, plan: plan.id }))
                    setError?.(null)
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-bold">
                        {plan.name}
                        {plan.isPopular && <span className="badge text-bg-warning ms-2">Popular</span>}
                      </div>
                      <div className="small text-muted mt-1">{plan.description}</div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div className="fw-bold">
                        {isFree ? '₹0' : `${formatInr(plan.pricePerUserInr)}/user`}
                      </div>
                      <div className="small text-muted">
                        {isFree ? planSeatLabel(plan) : `from ${formatInr(plan.minBillInr)}/mo`}
                      </div>
                    </div>
                  </div>
                  {active && (
                    <ul className="small text-muted mb-0 mt-2 ps-3">
                      {(plan.features || []).slice(0, 4).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                      <li>{planLimitLabel(plan.maxActiveProjects, 'active projects')}</li>
                      <li>{planLimitLabel(plan.maxClients, 'clients')}</li>
                    </ul>
                  )}
                </button>
              )
            })}
          </div>

          {selectedPlan && !plansLoading && (
            <Alert variant="light" className="border small mb-3">
              Selected <strong>{selectedPlan.name}</strong>
              {selectedPlan.pricePerUserInr > 0
                ? ` — billed seats = max(your users, ${selectedPlan.minSeats}). First charge: ${formatInr(selectedPlan.minBillInr)}.`
                : ` — up to ${selectedPlan.maxSeats} users, free.`}
            </Alert>
          )}

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <div className="d-flex gap-2">
            <Button variant="outline-secondary" type="button" className="fw-semibold" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" type="submit" className="fw-semibold flex-grow-1" disabled={loading || plansLoading || !form.plan}>
              {loading
                ? 'Creating…'
                : form.plan === 'free'
                  ? 'Create free account'
                  : 'Continue to payment'}
            </Button>
          </div>
        </Form>
      )}
    </>
  )
}

export default Forms
