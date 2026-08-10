import { apiRequest, sessionKeys } from '@/lib/apiClient'

export const authService = {
  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  logout: (refreshToken) =>
    apiRequest('/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : {},
      auth: true,
    }),

  confirmPayment: (payload) =>
    apiRequest('/auth/confirm-payment', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  verifyForgotOtp: ({ email, otp }) =>
    apiRequest('/auth/verify-forgot-otp', {
      method: 'POST',
      body: { email, otp },
    }),

  resetPassword: (payload) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: payload,
    }),

  resendForgotOtp: (email) =>
    apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: { email, type: 'forgot_password' },
    }),
}

export const storeResetToken = (token) => {
  if (token) sessionStorage.setItem(sessionKeys.RESET_TOKEN_KEY, token)
  else sessionStorage.removeItem(sessionKeys.RESET_TOKEN_KEY)
}

export const getResetToken = () => sessionStorage.getItem(sessionKeys.RESET_TOKEN_KEY)
