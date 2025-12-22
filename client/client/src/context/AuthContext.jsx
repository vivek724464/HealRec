import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser({ ...JSON.parse(savedUser), token });
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Assuming backend returns user object with _id, username/name, role
    const userObj = {
      id: userData._id || userData.id,
      name: userData.username || userData.name,
      email: userData.email,
      role: userData.role,
      token
    };
    setUser(userObj);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};