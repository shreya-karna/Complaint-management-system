import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ProtectedRoute from './ProtectedRoute'
import RoleProtectedRoute from './RoleProtectedRoute'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'

import CitizenDashboard from '../pages/citizen/CitizenDashboard'
import DepartmentSelection from '../pages/citizen/DepartmentSelection'
import ComplaintForm from '../pages/citizen/ComplaintForm'
import ComplaintSubmitted from '../pages/citizen/ComplaintSubmitted'
import MyComplaints from '../pages/citizen/MyComplaints'
import ComplaintDetails from '../pages/citizen/ComplaintDetails'
import TrackComplaint from '../pages/citizen/TrackComplaint'
import PublicComplaints from '../pages/citizen/PublicComplaints'

import StaffDashboard from '../pages/staff/StaffDashboard'
import AssignedComplaints from '../pages/staff/AssignedComplaints'
import StaffComplaintDetails from '../pages/staff/StaffComplaintDetails'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import ManageDepartments from '../pages/admin/ManageDepartments'
import ManageCategories from '../pages/admin/ManageCategories'
import AdminComplaints from '../pages/admin/AdminComplaints'
import AdminComplaintDetails from '../pages/admin/AdminComplaintDetails'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/verify-email/:token"
          element={<VerifyEmail />}
        />

        {/* Citizen routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={['CITIZEN']}
              />
            }
          >
            <Route path="/" element={<CitizenDashboard />} />

            <Route
              path="/select-department"
              element={<DepartmentSelection />}
            />

            <Route
              path="/submit-complaint"
              element={<ComplaintForm />}
            />

            <Route
              path="/complaint-submitted"
              element={<ComplaintSubmitted />}
            />

            <Route
              path="/my-complaints"
              element={<MyComplaints />}
            />

            <Route
              path="/track-complaint"
              element={<TrackComplaint />}
            />

            <Route
              path="/public-complaints"
              element={<PublicComplaints />}
            />

            <Route
              path="/complaints/:id"
              element={<ComplaintDetails />}
            />
          </Route>
        </Route>

        {/* Staff routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={['STAFF']}
              />
            }
          >
            <Route
              path="/staff"
              element={<StaffDashboard />}
            />

            <Route
              path="/staff/complaints"
              element={<AssignedComplaints />}
            />

            <Route
              path="/staff/complaints/:id"
              element={<StaffComplaintDetails />}
            />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={['ADMIN']}
              />
            }
          >
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<ManageUsers />}
            />

            <Route
              path="/admin/departments"
              element={<ManageDepartments />}
            />

            <Route
              path="/admin/categories"
              element={<ManageCategories />}
            />

            <Route
              path="/admin/complaints"
              element={<AdminComplaints />}
            />

            <Route
              path="/admin/complaints/:id"
              element={<AdminComplaintDetails />}
            />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes