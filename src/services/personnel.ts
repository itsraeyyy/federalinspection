import { supabase } from '@/lib/supabaseClient';
import { Personnel } from '@/types';

export const personnelService = {
  getPersonnel: async (): Promise<Personnel[]> => {
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching personnel:', error);
      throw error;
    }
    
    // Map snake_case to camelCase
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      nameAm: item.name_am,
      position: item.position,
      positionAm: item.position_am,
      officeCategory: item.office_category,
      officeCategoryAm: item.office_category_am,
      department: item.department,
      email: item.email,
      phone: item.phone,
      photo: item.photo,
      message: item.message,
      status: item.status,
    })) as Personnel[];
  },
  
  getPersonnelById: async (id: string): Promise<Personnel | null> => {
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching personnel by id:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      nameAm: data.name_am,
      position: data.position,
      positionAm: data.position_am,
      officeCategory: data.office_category,
      officeCategoryAm: data.office_category_am,
      department: data.department,
      email: data.email,
      phone: data.phone,
      photo: data.photo,
      message: data.message,
      status: data.status,
    } as Personnel;
  },
  
  createPersonnel: async (data: Omit<Personnel, 'id'>): Promise<Personnel> => {
    const payload = {
      name: data.name,
      name_am: data.nameAm,
      position: data.position,
      position_am: data.positionAm,
      office_category: data.officeCategory,
      office_category_am: data.officeCategoryAm,
      department: data.department,
      email: data.email,
      phone: data.phone,
      photo: data.photo,
      message: data.message,
      status: data.status,
    };
    
    const { data: insertedData, error } = await supabase
      .from('personnel')
      .insert(payload)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating personnel:', error);
      throw error;
    }
    
    return {
      id: insertedData.id,
      ...data
    } as Personnel;
  },
  
  updatePersonnel: async (id: string, data: Partial<Personnel>): Promise<Personnel> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.nameAm !== undefined) payload.name_am = data.nameAm;
    if (data.position !== undefined) payload.position = data.position;
    if (data.positionAm !== undefined) payload.position_am = data.positionAm;
    if (data.officeCategory !== undefined) payload.office_category = data.officeCategory;
    if (data.officeCategoryAm !== undefined) payload.office_category_am = data.officeCategoryAm;
    if (data.department !== undefined) payload.department = data.department;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.photo !== undefined) payload.photo = data.photo;
    if (data.message !== undefined) payload.message = data.message;
    if (data.status !== undefined) payload.status = data.status;
    
    const { data: updatedData, error } = await supabase
      .from('personnel')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating personnel:', error);
      throw error;
    }
    
    return {
      id: updatedData.id,
      ...data
    } as Personnel;
  },
  
  deletePersonnel: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting personnel:', error);
      throw error;
    }
  },
  
  uploadPhoto: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('personnel_photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('personnel_photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
