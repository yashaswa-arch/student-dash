import React from 'react'
import { Navigate } from 'react-router-dom'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken')
  const adminUser = localStorage.getItem('adminUser')
  
  // Check if admin is authenticated
  if (!adminToken || !adminUser) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />
  }

  try {
    const user = JSON.parse(adminUser)
    // Verify user has admin role
    if (user.role !== 'admin') {
      return <Navigate to="/admin/login" replace />
    }
  } catch (error) {
    // Invalid user data, redirect to login
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

export default AdminProtectedRoute