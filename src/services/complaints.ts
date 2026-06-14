import { apiClient } from '../lib/api-client';
import { Complaint } from '../types';

const mockComplaints: Complaint[] = [
  { id: '1', name: 'Anonymous', type: 'Complaint', subject: 'Service Delay in Branch 4', date: 'Oct 14, 2026', status: 'New' },
  { id: '2', name: 'Kassa T.', type: 'Suggestion', subject: 'Online Application Portal Improvements', date: 'Oct 13, 2026', status: 'Under Review' },
];

export const complaintService = {
  getComplaints: async (): Promise<Complaint[]> => {
    await apiClient.get('/complaints');
    return mockComplaints;
  },
  updateComplaintStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.put(`/complaints/${id}/status`, { status });
  }
};
