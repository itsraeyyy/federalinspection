import { apiClient } from '../lib/api-client';
import { Document } from '../types';

const mockDocs: Document[] = [
  { id: '1', title: 'HR Policy 2026', description: 'Updated HR policies for the new year.', folderCode: 'ADMIN_DEFINED', fileType: 'PDF', uploadDate: 'Oct 14, 2026', uploadedBy: 'Admin', version: 'v1.2', visibility: 'Internal' },
  { id: '2', title: 'Q3 Budget Allocation', description: 'Budget breakdown for branch offices.', folderCode: '14', fileType: 'XLSX', uploadDate: 'Oct 12, 2026', uploadedBy: 'Finance Dept', version: 'v1.0', visibility: 'Restricted' },
];

export const documentService = {
  getDocuments: async (): Promise<Document[]> => {
    await apiClient.get('/documents');
    return mockDocs;
  },
  uploadDocument: async (data: FormData | any): Promise<Document> => {
    await apiClient.post('/documents/upload', data);
    const newDoc = { id: Date.now().toString(), title: data.title || 'New Doc', folderCode: data.folderCode, fileType: 'PDF', uploadDate: 'Today', uploadedBy: 'Admin', version: 'v1.0', visibility: data.visibility || 'Internal' } as Document;
    mockDocs.push(newDoc);
    return newDoc;
  }
};
