import { Navigate, Outlet } from 'react-router-dom'

function RoleProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  )

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }

    if (user.role === 'STAFF') {
      return <Navigate to="/staff" replace />
    }

    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RoleProtectedRoute