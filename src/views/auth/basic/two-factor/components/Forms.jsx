import OTPInput from '@/components/OTPInput'
import { authService, storeResetToken } from '@/services/authService'
import { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router'

const Forms = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [code, setCode] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!email) {
      navigate('/auth/reset-pass', { replace: true })
    }
  }, [email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const otp = code.join('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }

    setLoading(true)
    try {
      const json = await authService.verifyForgotOtp({ email, otp })
      const resetToken = json?.data?.resetToken
      if (!resetToken) {
        throw new Error('Reset token missing from server response')
      }
      storeResetToken(resetToken)
      navigate('/auth/new-pass', {
        replace: true,
        state: { email },
      })
    } catch (err) {
      setError(err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    setResending(true)
    try {
      const json = await authService.resendForgotOtp(email)
      setInfo(json?.data?.message || 'A new code was sent if the account exists.')
      setCode(Array(6).fill(''))
    } catch (err) {
      setError(err.message || 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <p className="text-muted mb-3">
        Enter the 6-digit code sent to <strong>{email}</strong>
      </p>
      <div className="mb-3">
        <OTPInput code={code} setCode={setCode} label="Enter your 6-digit code" />
      </div>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}
      {info && <Alert variant="success" className="py-2">{info}</Alert>}
      <div className="d-grid gap-2">
        <Button variant="primary" type="submit" className="fw-semibold py-2" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify code'}
        </Button>
        <Button variant="link" type="button" disabled={resending} onClick={handleResend}>
          {resending ? 'Resending…' : 'Resend code'}
        </Button>
        <Link to="/auth/reset-pass" className="text-center text-muted small">
          Use a different email
        </Link>
      </div>
    </Form>
  )
}

export default Forms
