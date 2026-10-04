import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'

const VerifyEmail = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(
          `/users/verify-email/${token}`
        )

        setStatus('success')
        setMessage(
          response.data.message ||
            'Email verified successfully. You can now log in.'
        )
      } catch (error) {
        setStatus('error')
        setMessage(
          error.response?.data?.message ||
            'Invalid or expired verification link.'
        )
      }
    }

    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('Verification token is missing.')
    }
  }, [token])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
        }}
      >
        {status === 'verifying' && (
          <>
            <h2>Verifying Email...</h2>
            <p>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>

            <button
              onClick={() => navigate('/login')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2>Email Verification Failed</h2>
            <p>{message}</p>

            <button
              onClick={() => navigate('/login')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
