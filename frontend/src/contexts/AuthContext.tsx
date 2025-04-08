import { createContext, useContext, useEffect, useReducer, useMemo, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
};

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT'; payload?: undefined }
  | { type: 'LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'LOADING':
      return { 
        ...state, 
        loading: action.payload 
      };
    default:
      return state;
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const validateToken = useCallback(() => {
    dispatch({ type: 'LOADING', payload: true });
    
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        console.log('No token or user found in localStorage');
        logout();
        return;
      }
      
      try {
        // Check if token has the correct format (has at least 3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length < 3) {
          console.log('Invalid token format');
          logout();
          return;
        }

        // Make sure the base64 string is properly padded
        const base64Url = tokenParts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        if (!payload || !payload.exp) {
          console.log('Invalid token payload');
          logout();
          return;
        }
        
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        
        if (expirationTime <= Date.now()) {
          console.log('Token has expired');
          logout();
          return;
        }
        
        const user = JSON.parse(userStr);
        login(user, token);
        console.log('Token validation successful');
      } catch (error) {
        console.error('Error parsing token:', error);
        logout();
      }
    } catch (error) {
      console.error('Error validating token:', error);
      logout();
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  }, [logout, login, dispatch]);

  useEffect(() => {
    validateToken();
    
    const checkTokenInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 <= Date.now()) {
            console.log('Token expired during session');
            logout();
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkTokenInterval);
  }, [validateToken, logout]);

  const contextValue = useMemo(() => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout
  }), [state.user, state.token, state.isAuthenticated, state.loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
