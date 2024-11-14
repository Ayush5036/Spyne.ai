import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const getTokenFromStorage = () => {
    return localStorage.getItem('token');
  };

  const checkAuth = () => {
    try {
      const token = getTokenFromStorage();
      if (token) {
        // Decode the token to get the user information
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        // console.log(decodedToken);

        setUser(decodedToken);
        console.log(user);

      } else {  
        setUser(null);
      }

      
    } catch (error) {
      // Remove the token from local storage if it's invalid or missing
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Render a loading indicator
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // console.log(context);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
