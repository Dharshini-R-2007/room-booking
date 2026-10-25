import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken, isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage token on initial load
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = decodeToken(storedToken);
        if (decoded && !isTokenExpired(decoded)) {
          setToken(storedToken);
          setUser(decoded.sub || 'User');
          // Extract role from JWT claims (role, roles, or authorities)
          const extractedRole = decoded.role || (decoded.roles && decoded.roles[0]) || null;
          setRole(extractedRole);
          setIsAuthenticated(true);
        } else {
          // Token expired or malformed
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    const decoded = decodeToken(newToken);
    const extractedRole = decoded?.role || (decoded?.roles && decoded?.roles[0]) || null;

    setToken(newToken);
    setUser(decoded?.sub || 'User');
    setRole(extractedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
