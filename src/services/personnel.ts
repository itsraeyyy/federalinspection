import { apiClient } from '../lib/api-client';
import { Personnel } from '../types';

const mockPersonnel: Personnel[] = [
  { id: '1', name: 'Dr. Tadesse W.', position: 'Commissioner', officeCategory: 'Main Office', department: 'Executive', email: 'tadesse@commission.gov', phone: '+251911234567', status: 'Active' },
  { id: '2', name: 'W/ro Almaz G.', position: 'Deputy Commissioner', officeCategory: 'Branch 14', department: 'Operations', email: 'almaz@commission.gov', phone: '+251922345678', status: 'Active' },
];

export const personnelService = {
  getPersonnel: async (): Promise<Personnel[]> => {
    await apiClient.get('/personnel');
    return mockPersonnel;
  },
  createPersonnel: async (data: Partial<Personnel>): Promise<Personnel> => {
    await apiClient.post('/personnel', data);
    const newMember = { ...data, id: Date.now().toString(), status: 'Active' } as Personnel;
    mockPersonnel.push(newMember);
    return newMember;
  }
};
