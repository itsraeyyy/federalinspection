import { supabase } from '@/lib/supabaseClient';

export interface Folder {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  created_at: string;
  filesCount?: number;
}

export interface Document {
  id: string;
  folder_id: string;
  title: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  version: string;
  visibility: 'Public' | 'Internal' | 'Restricted';
  created_at: string;
}

export const documentService = {
  getFolders: async (parentId: string | null = null): Promise<Folder[]> => {
    let query = supabase.from('document_folders').select('*, documents(count)');
    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    
    return data.map((f: any) => ({
      ...f,
      filesCount: f.documents?.[0]?.count || 0
    })) as Folder[];
  },

  createFolder: async (name: string, parentId: string): Promise<Folder> => {
    const { data, error } = await supabase
      .from('document_folders')
      .insert([{ name, code: 'SUB', parent_id: parentId }])
      .select()
      .single();
    if (error) throw error;
    return data as Folder;
  },

  getDocumentsByFolder: async (folderId: string): Promise<Document[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Document[];
  },

  getRecentDocuments: async (): Promise<Document[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data as Document[];
  },

  uploadDocument: async (file: File, folderId: string, visibility: string): Promise<Document> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
    const storagePath = `${folderId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file);
      
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        folder_id: folderId,
        title: file.name,
        storage_path: storagePath,
        file_type: fileExt?.toUpperCase() || 'UNKNOWN',
        file_size: file.size,
        uploaded_by: 'Current Admin',
        visibility
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data as Document;
  },

  downloadDocument: async (doc: Document): Promise<void> => {
    // 1. Log access
    await supabase.from('document_access_logs').insert([{
      document_id: doc.id,
      accessed_by: 'Current Admin',
      action: 'download'
    }]);

    // 2. Get signed URL
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60); // 60 seconds
      
    if (error) throw error;
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  }
};
