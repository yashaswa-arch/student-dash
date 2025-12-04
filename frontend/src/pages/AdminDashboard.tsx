import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Float, Box, Sphere } from '@react-three/drei'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  BarChart3, 
  Activity, 
  Settings, 
  LogOut, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Clock,
  Home
} from 'lucide-react'
import { adminAPI } from '../api/services'

// Types
interface User {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
}

interface Stats {
  totalUsers: number
  studentCount: number
  instructorCount: number
  adminCount: number
  recentUsers: User[]
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<any>
  trend?: string
  color?: string
}

interface UserRowProps {
  user: User
}

// 3D Admin Background
const AdminDashboardScene = () => {
  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1}>
        <Box position={[-6, 2, -8]} scale={0.3} args={[1, 1, 1]}>
          <meshStandardMaterial color="#dc2626" opacity={0.1} transparent />
        </Box>
      </Float>
      <Float speed={0.8} rotationIntensity={0.6} floatIntensity={1.5}>
        <Sphere position={[4, -2, -10]} scale={0.4} args={[1, 32, 32]}>
          <meshStandardMaterial color="#991b1b" opacity={0.15} transparent />
        </Sphere>
      </Float>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} />
    </group>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    studentCount: 0,
    instructorCount: 0,
    adminCount: 0,
    recentUsers: []
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  const navigate = useNavigate()

  // Load admin data
  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      console.log('🔄 Loading admin data...')
      
      // Try to load admin data
      const [statsResponse, usersResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ])

      console.log('📊 Stats response:', statsResponse)
      console.log('👥 Users response:', usersResponse)
      console.log('👥 Users array:', usersResponse.users)
      console.log('👥 Number of users:', usersResponse.users?.length)

      // Set the data
      setStats(statsResponse.stats || statsResponse)
      setUsers(usersResponse.users || usersResponse || [])
      
      console.log('✅ Successfully loaded real data from API')
      console.log('✅ Users state will be set to:', usersResponse.users || usersResponse || [])
    } catch (error: any) {
      console.error('❌ Failed to load admin data:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      
      // Show empty data instead of fallback
      setUsers([])
      setStats({ totalUsers: 0, studentCount: 0, instructorCount: 0, adminCount: 0, recentUsers: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole)
      await loadAdminData() // Refresh data
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId)
        await loadAdminData() // Refresh data
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-green-400 text-sm mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  )

  const UserRow: React.FC<UserRowProps> = ({ user }) => (
    <motion.tr
      className="border-b border-gray-700 hover:bg-white/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-white font-medium">{user.username}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
          user.role === 'instructor' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-blue-500/20 text-blue-300'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-300">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedUser(user)
              setShowUserModal(true)
            }}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleUpdateUserRole(user._id, user.role === 'student' ? 'instructor' : 'student')}
            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          {user.role !== 'admin' && (
            <button
              onClick={() => handleDeleteUser(user._id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <AdminDashboardScene />
        </Canvas>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-red-400" />
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoHome}
                  className="flex items-center space-x-2 px-4 py-2 text-white hover:text-red-300 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Debug Information */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-purple-300 font-bold mb-2">🔍 Debug Information</h3>
            <div className="text-sm text-purple-200 space-y-1">
              <p><strong>Users loaded:</strong> {users.length}</p>
              <p><strong>Loading state:</strong> {loading ? 'Loading...' : 'Complete'}</p>
              <p><strong>Sample user data:</strong> {users.length > 0 ? JSON.stringify(users[0], null, 2) : 'No users'}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-purple-300">View all users data</summary>
                <pre className="mt-2 text-xs bg-black/30 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(users, null, 2)}
                </pre>
              </details>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              trend="+12% this month"
              color="blue"
            />
            <StatCard
              title="Students"
              value={stats.studentCount}
              icon={BookOpen}
              trend="+8% this month"
              color="green"
            />
            <StatCard
              title="Instructors"
              value={stats.instructorCount}
              icon={UserCheck}
              trend="+5% this month"
              color="yellow"
            />
            <StatCard
              title="Admins"
              value={stats.adminCount}
              icon={Shield}
              trend="No change"
              color="red"
            />
          </div>

          {/* User Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="instructor">Instructors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <UserRow key={user._id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <UserX className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Username</label>
                <p className="text-white font-medium">{selectedUser.username}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Role</label>
                <p className="text-white font-medium capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Joined</label>
                <p className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard