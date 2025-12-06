import { useNavigate } from 'react-router-dom'

const SimpleAdminDashboard = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Success Message */}
        <div className="bg-green-800 border border-green-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-300 mb-2">✅ Admin Dashboard Working!</h2>
          <p className="text-green-200">You have successfully logged in as an administrator.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-800 p-6 rounded-lg">
            <h3 className="text-blue-300 text-sm uppercase tracking-wide">Total Users</h3>
            <p className="text-3xl font-bold text-white">2</p>
          </div>
          <div className="bg-green-800 p-6 rounded-lg">
            <h3 className="text-green-300 text-sm uppercase tracking-wide">Students</h3>
            <p className="text-3xl font-bold text-white">1</p>
          </div>
          <div className="bg-purple-800 p-6 rounded-lg">
            <h3 className="text-purple-300 text-sm uppercase tracking-wide">Instructors</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-red-800 p-6 rounded-lg">
            <h3 className="text-red-300 text-sm uppercase tracking-wide">Admins</h3>
            <p className="text-3xl font-bold text-white">1</p>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Username</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">admin</td>
                  <td className="py-3 px-4">admin@example.com</td>
                  <td className="py-3 px-4">
                    <span className="bg-red-600 px-2 py-1 rounded text-sm">Admin</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm mr-2">
                      Edit
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">yash</td>
                  <td className="py-3 px-4">yash@test.com</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-600 px-2 py-1 rounded text-sm">Student</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm mr-2">
                      Edit
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            Try Full Dashboard
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleAdminDashboard