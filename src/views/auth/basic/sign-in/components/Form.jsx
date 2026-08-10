import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Alert, Button, Form, FormCheck, FormControl, FormLabel } from 'react-bootstrap'
import { Link, useLocation } from 'react-router'

const LoginForm = () => {
  const { login, loading, error, setError } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const successMessage = location.state?.message

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError?.(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email.trim(), form.password)
    } catch {
      // error via useAuth
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {successMessage && <Alert variant="success" className="py-2">{successMessage}</Alert>}
      <div className="mb-3">
        <FormLabel>
          Email address <span className="text-danger">*</span>
        </FormLabel>
        <FormControl
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          required
          onChange={handleChange}
          autoComplete="email"
        />
      </div>
      <div className="mb-3">
        <FormLabel>
          Password <span className="text-danger">*</span>
        </FormLabel>
        <FormControl
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          required
          onChange={handleChange}
          autoComplete="current-password"
        />
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <FormCheck>
          <Form.Check.Input className="form-check-input-light fs-14" type="checkbox" id="rememberMe" />
          <Form.Check.Label htmlFor="rememberMe">Keep me signed in</Form.Check.Label>
        </FormCheck>
        <Link to="/auth/reset-pass" className="text-decoration-underline link-offset-3 text-muted">
          Forgot Password?
        </Link>
      </div>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}
      <div className="d-grid">
        <Button variant="primary" type="submit" className="fw-semibold py-2" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </div>
    </form>
  )
}

export default LoginForm
