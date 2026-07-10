import { supabase } from '../lib/supabaseClient';

export type PublicFileCategory = 'መተዳደርያ ደንብ' | 'የኮሚሽኑ መመሪያዎች' | 'የፓርቲ መመሪያዎች' | 'የኮሚሽኑ ሚስጥራዊ ሰነዶች' | 'ሌላ';

export interface PublicFile {
  id: string;
  title: string;
  category: PublicFileCategory;
  file_url: string;
  file_name: string;
  file_size: string;
  file_type: string;
  uploaded_by?: string;
  created_at: string;
}

export const publicFilesService = {
  getFiles: async (category?: PublicFileCategory): Promise<PublicFile[]> => {
    let query = supabase.from('public_files').select('*').order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    } else {
      query = query.neq('category', 'የኮሚሽኑ ሚስጥራዊ ሰነዶች');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching public files:', JSON.stringify(error, null, 2), error);
      return [];
    }

    return data as PublicFile[];
  },

  uploadFile: async (title: string, category: PublicFileCategory, file: File): Promise<{success: boolean, error?: string}> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      // Use a safe folder name based on category
      const folderMap: Record<string, string> = {
        'መተዳደርያ ደንብ': 'bylaws',
        'የኮሚሽኑ መመሪያዎች': 'commission_directives',
        'የፓርቲ መመሪያዎች': 'party_directives',
        'ሌላ': 'other'
      };
      
      const safeFolder = folderMap[category] || 'other';
      const filePath = `${safeFolder}/${fileName}`;
      const isConfidential = category === 'የኮሚሽኑ ሚስጥራዊ ሰነዶች';
      const bucketName = isConfidential ? 'confidential_documents' : 'public_documents';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      let fileUrlToSave = '';
      if (isConfidential) {
        fileUrlToSave = filePath; // Save internal path for secure retrieval
      } else {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        fileUrlToSave = urlData.publicUrl;
      }

      const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

      const { error: dbError } = await supabase
        .from('public_files')
        .insert({
          title,
          category,
          file_url: fileUrlToSave,
          file_name: file.name,
          file_size: fileSize,
          file_type: file.type,
          uploaded_by: userId,
        });

      if (dbError) throw dbError;

      return { success: true };
    } catch (error: any) {
      console.error('Error uploading public file:', error, JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  },

  deleteFile: async (id: string, fileUrl: string, category: PublicFileCategory): Promise<boolean> => {
    try {
      const isConfidential = category === 'የኮሚሽኑ ሚስጥራዊ ሰነዶች';
      const bucketName = isConfidential ? 'confidential_documents' : 'public_documents';

      let filePath = '';
      if (isConfidential) {
        filePath = fileUrl; // For confidential files, fileUrl is actually the path
      } else {
        const urlParts = fileUrl.split(`/${bucketName}/`);
        if (urlParts.length === 2) {
          filePath = urlParts[1];
        }
      }

      if (filePath) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Proceed to delete DB record anyway to prevent orphan records breaking UI
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('public_files')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Error deleting public file:', error);
      return false;
    }
  }
};
