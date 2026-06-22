'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type AdminProfile = {
  id: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  first_name?: string;
  last_name?: string;
  access_level?: string;
  modules?: string[];
  email?: string;
};

type AdminContextType = {
  profile: AdminProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
};

const AdminContext = createContext<AdminContextType>({
  profile: null,
  loading: true,
  isSuperAdmin: false,
  hasPermission: () => false,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching admin profile:', error);
      }

      if (!error && data && mounted) {
        setProfile(data);
      }
      
      if (mounted) setLoading(false);
    }

    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else if (event === 'SIGNED_IN') {
        loadProfile();
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isSuperAdmin = profile?.role === 'super_admin';
  
  const hasPermission = (permission: string) => {
    if (isSuperAdmin) return true;
    return profile?.permissions.includes(permission) ?? false;
  };

  return (
    <AdminContext.Provider value={{ profile, loading, isSuperAdmin, hasPermission }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
