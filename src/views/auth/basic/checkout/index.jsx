import { getPendingPayment } from '@/lib/apiClient'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import AuthLogo from '@/components/AuthLogo'
import { currentYear, META_DATA } from '@/config/constants'
import cardbg from '@/assets/images/auth-card-bg.svg'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { confirmPayment, isAuthenticated, loading, error, setError, user, logout } = useAuth()
  const [pending, setPending] = useState(() => getPendingPayment())
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/sign-in', { replace: true })
      return
    }
    const current = getPendingPayment()
    setPending(current)
    if (!current?.razorpay?.orderId) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const openCheckout = async () => {
    setError?.(null)
    const order = pending?.razorpay
    if (!order?.orderId || !order?.keyId) {
      setError?.('Missing payment order. Please sign in again.')
      return
    }

    setOpening(true)
    const ready = await loadRazorpayScript()
    if (!ready) {
      setOpening(false)
      setError?.('Could not load Razorpay. Check your connection and try again.')
      return
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: META_DATA.name || 'Velorak',
      description: `${pending.plan || 'Plan'} subscription`,
      order_id: order.orderId,
      prefill: {
        email: user?.email || '',
        name: user?.fullName || '',
      },
      handler: async (response) => {
        try {
          await confirmPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
        } catch {
          // surfaced via useAuth
        } finally {
          setOpening(false)
        }
      },
      modal: {
        ondismiss: () => setOpening(false),
      },
    })

    rzp.on('payment.failed', (response) => {
      setOpening(false)
      setError?.(response?.error?.description || 'Payment failed. Please try again.')
    })

    rzp.open()
    setOpening(false)
  }

  if (!pending?.razorpay) {
    return (
      <div className="auth-box d-flex align-items-center justify-content-center">
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div className="auth-box overflow-hidden align-items-center d-flex">
      <Container>
        <Row className="justify-content-center">
          <Col xxl={4} md={6} sm={8}>
            <Card className="p-4">
              <div className="position-absolute top-0 end-0" style={{ width: '180px' }}>
                <img src={cardbg} className="auth-card-bg-img" alt="" />
              </div>
              <div className="auth-brand text-center mb-4">
                <AuthLogo />
                <h4 className="mt-3 mb-2">Complete your subscription</h4>
                <p className="text-muted mb-0">
                  Your <strong className="text-capitalize">{pending.plan}</strong> plan is ready. Pay securely with Razorpay to activate.
                </p>
              </div>

              <div className="border rounded p-3 mb-3 bg-light">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Plan</span>
                  <strong className="text-capitalize">{pending.plan}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Amount</span>
                  <strong>
                    ₹{((pending.razorpay.amount || 0) / 100).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  className="fw-semibold py-2"
                  disabled={loading || opening}
                  onClick={openCheckout}
                >
                  {loading || opening ? 'Processing…' : 'Pay with Razorpay'}
                </Button>
                <Button variant="link" type="button" onClick={() => logout()}>
                  Sign out
                </Button>
              </div>
            </Card>
            <p className="text-center text-muted mt-4 mb-0">
              © {currentYear} {META_DATA.name}
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CheckoutPage
