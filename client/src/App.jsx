import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ProtectedRoute from './component/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Signup from './pages/SignUp'
import Workout from './pages/Workout'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
