import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'

import {
  loginUser,
  resendVerificationEmail,
} from '../../services/userService'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [captchaToken, setCaptchaToken] = useState(null)

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showResend, setShowResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setResendMessage('')
    setShowResend(false)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (!captchaToken) {
      setError('Please complete the CAPTCHA.')
      return
    }

    setLoading(true)

    try {
      const response = await loginUser(
        email.trim(),
        password,
        captchaToken
      )

      const user = response.user

      localStorage.setItem(
        'token',
        response.token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      )

      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else if (user.role === 'STAFF') {
        navigate('/staff')
      } else {
        navigate('/')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Login failed. Please check your email and password.'

      setError(message)

      if (
        message.toLowerCase().includes('verify your email')
      ) {
        setShowResend(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setSuccess('')
    setResendMessage('')

    if (!email.trim()) {
      setResendMessage(
        'Please enter your email address first.'
      )
      return
    }

    setResendLoading(true)

    try {
      const response =
        await resendVerificationEmail(
          email.trim()
        )

      setResendMessage(
        response.message ||
          'Verification email sent. Please check your email.'
      )
    } catch (err) {
      setResendMessage(
        err.response?.data?.message ||
          'Failed to send verification email.'
      )
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-md md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-gray-600">
              Login to your Complaint Management System
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                  setResendMessage('')
                }}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={
                  import.meta.env.VITE_RECAPTCHA_SITE_KEY
                }
                onChange={(token) =>
                  setCaptchaToken(token)
                }
                onExpired={() =>
                  setCaptchaToken(null)
                }
                onErrored={() =>
                  setCaptchaToken(null)
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </button>
          </form>

          {showResend && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Your email has not been verified yet.
              </p>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="mt-3 w-full rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendLoading
                  ? 'Sending...'
                  : 'Resend Verification Email'}
              </button>

              {resendMessage && (
                <p className="mt-3 text-sm text-blue-800">
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login