import PasswordInputWithStrength from '@/components/PasswordInputWithStrength'
import { authService, getResetToken, storeResetToken } from '@/services/authService'
import { useEffect, useState } from 'react'
import { Alert, Button, Form, FormControl, FormLabel } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router'

const passwordLooksValid = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password)

const NewPassForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getResetToken()) {
      navigate('/auth/reset-pass', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!passwordLooksValid(password)) {
      setError('Password must be 8+ chars with upper, lower, number, and special character')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const resetToken = getResetToken()
    if (!resetToken) {
      setError('Reset session expired. Request a new code.')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({
        resetToken,
        password,
        confirmPassword,
      })
      storeResetToken(null)
      navigate('/auth/sign-in', {
        replace: true,
        state: { message: 'Password updated. Sign in with your new password.' },
      })
    } catch (err) {
      setError(err.message || 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {email && (
        <div className="mb-3">
          <FormLabel>
            Email address
            <span className="text-danger ms-1">*</span>
          </FormLabel>
          <FormControl type="email" value={email} disabled readOnly />
        </div>
      )}
      <div className="mb-3" data-password="bar">
        <PasswordInputWithStrength
          id="userPassword"
          label="New password"
          name="user-password"
          password={password}
          setPassword={setPassword}
          showIcon
          placeholder="••••••••"
        />
      </div>
      <div className="mb-3">
        <FormLabel>
          Confirm new password
          <span className="text-danger ms-1">*</span>
        </FormLabel>
        <FormControl
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}
      <div className="d-grid">
        <Button variant="primary" type="submit" className="fw-semibold py-2" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </div>
    </Form>
  )
}

export default NewPassForm
