'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = Cookies.get('auth_token');
      if (savedToken) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            setToken(savedToken);
          } else {
            Cookies.remove('auth_token');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          Cookies.remove('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        Cookies.set('auth_token', data.token, { expires: 7 });
        router.push('/dashboard');
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        Cookies.set('auth_token', data.token, { expires: 7 });
        router.push('/dashboard');
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
