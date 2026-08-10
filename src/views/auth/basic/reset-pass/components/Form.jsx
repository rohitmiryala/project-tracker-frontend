import { authService } from '@/services/authService'
import { useState } from 'react'
import { Alert, Button, Form, FormControl, FormLabel } from 'react-bootstrap'
import { useNavigate } from 'react-router'

const ResetForm = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const json = await authService.forgotPassword(email.trim())
      setInfo(json?.data?.message || json?.message || 'If an account exists, a code was sent.')
      navigate('/auth/two-factor', {
        replace: false,
        state: { email: email.trim().toLowerCase() },
      })
    } catch (err) {
      setError(err.message || 'Could not send reset code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-3">
        <FormLabel>
          Email address
          <span className="text-danger"> *</span>
        </FormLabel>
        <FormControl
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}
      {info && <Alert variant="success" className="py-2">{info}</Alert>}
      <div className="d-grid">
        <Button variant="primary" type="submit" className="fw-semibold py-2" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset code'}
        </Button>
      </div>
    </Form>
  )
}

export default ResetForm
