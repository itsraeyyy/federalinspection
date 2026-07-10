import { supabase } from '../lib/supabaseClient';
import { Admin, AccessLevel } from '../types';
import { formatECDateTime } from '@/lib/date-formatter';

export const adminService = {
  getAdmins: async (): Promise<Admin[]> => {
    const { data, error } = await supabase.from('admin_profiles').select('*');
    if (error) {
      console.error('Error fetching admins:', error);
      return [];
    }

    return data.map((profile: any) => ({
      id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      email: profile.email || '',
      phone: profile.phone || '',
      accessLevel: (profile.access_level || 'specific') as AccessLevel,
      groups: profile.groups || [],
      modules: profile.modules || [],
      status: profile.status || 'Active',
      lastLogin: profile.last_login ? formatECDateTime(profile.last_login) : '-',
      createdAt: formatECDateTime(profile.created_at),
    }));
  },

  getAdminById: async (id: string): Promise<Admin | undefined> => {
    const { data, error } = await supabase.from('admin_profiles').select('*').eq('id', id).single();
    if (error || !data) {
      console.error('Error fetching admin:', error);
      return undefined;
    }

    return {
      id: data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      accessLevel: (data.access_level || 'specific') as AccessLevel,
      groups: data.groups || [],
      modules: data.modules || [],
      status: data.status || 'Active',
      lastLogin: data.last_login ? formatECDateTime(data.last_login) : '-',
      createdAt: formatECDateTime(data.created_at),
    };
  },

  updateAdmin: async (id: string, updateData: Partial<Admin>): Promise<void> => {
    const payload: any = {};
    if (updateData.name) {
      const parts = updateData.name.split(' ');
      payload.first_name = parts[0];
      payload.last_name = parts.slice(1).join(' ');
    }
    if (updateData.email) payload.email = updateData.email;
    if (updateData.phone) payload.phone = updateData.phone;
    if (updateData.accessLevel) payload.access_level = updateData.accessLevel;
    if (updateData.groups) payload.groups = updateData.groups;
    if (updateData.modules !== undefined) payload.modules = updateData.modules;
    if (updateData.status) payload.status = updateData.status;

    const { error } = await supabase.from('admin_profiles').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  deleteAdmin: async (id: string): Promise<void> => {
    const { error } = await supabase.from('admin_profiles').delete().eq('id', id);
    if (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },
};
