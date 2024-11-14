import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CarList } from './pages/CarList';
import { CarForm } from './pages/CarForm';
import { CarDetail } from './pages/CarDetail';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/cars"
              element={
                <PrivateRoute>
                  <CarList />
                </PrivateRoute>
              }
            />
            <Route
              path="/cars/new"
              element={
                <PrivateRoute>
                  <CarForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/cars/:id"
              element={
                <PrivateRoute>
                  <CarDetail />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/cars" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;