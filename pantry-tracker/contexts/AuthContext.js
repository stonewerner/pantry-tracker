// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInAnonymousUser } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInAnonymously = async () => {
    try {
      await signInAnonymousUser();
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      throw error; //throw again so it can be caught in the component
    }
  };

  const value = {
    user,
    loading,
    signInAnonymously
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}