'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserRole, UserProfile } from '@/types';

interface RoleContextValue {
  role: UserRole;
  user: UserProfile | null;
  switchRole: (newRole: UserRole) => Promise<void>;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: 'family_admin',
  user: null,
  switchRole: async () => {},
  isLoading: true
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('family_admin');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await axios.get('/api/auth/session');
        if (res.data?.success && res.data?.data) {
          setUser(res.data.data);
          setRole(res.data.data.role);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, []);

  const switchRole = async (newRole: UserRole) => {
    try {
      const res = await axios.post('/api/auth/switch-role', { role: newRole });
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        setRole(res.data.data.role);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <RoleContext.Provider value={{ role, user, switchRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

