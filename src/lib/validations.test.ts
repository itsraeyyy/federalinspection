import { newsSchema, documentSchema, personnelSchema, complaintSchema, adminSchema } from './validations';

describe('Zod Validations', () => {
  describe('newsSchema', () => {
    it('should validate a valid news object', () => {
      const validNews = {
        title: 'Important News Update',
        description: 'A brief description',
        language: 'Amharic',
        category: 'Updates',
        body: 'This is the main body of the news article which must be long enough.',
        status: 'Published'
      };
      
      const result = newsSchema.safeParse(validNews);
      expect(result.success).toBe(true);
    });

    it('should reject a news object with a short title', () => {
      const invalidNews = {
        title: 'News', // < 5 chars
        language: 'Amharic',
        category: 'Updates',
        body: 'This is the main body of the news article.',
      };
      
      const result = newsSchema.safeParse(invalidNews);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be at least 5 characters.');
      }
    });
  });

  describe('documentSchema', () => {
    it('should validate a valid document', () => {
      const validDoc = {
        title: 'Q3 Report',
        folderCode: 'FIN-2026',
        visibility: 'Internal'
      };
      
      const result = documentSchema.safeParse(validDoc);
      expect(result.success).toBe(true);
    });

    it('should reject invalid visibility', () => {
      const invalidDoc = {
        title: 'Secret Doc',
        folderCode: 'SEC',
        visibility: 'TopSecret' // Invalid enum
      };
      
      const result = documentSchema.safeParse(invalidDoc);
      expect(result.success).toBe(false);
    });
  });

  describe('personnelSchema', () => {
    it('should validate valid personnel data', () => {
      const validPersonnel = {
        name: 'Abebe Bekele',
        position: 'Manager',
        officeCategory: 'HQ',
        department: 'HR',
        email: 'abebe@example.com',
        phone: '0911223344'
      };
      const result = personnelSchema.safeParse(validPersonnel);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidPersonnel = {
        name: 'Abebe Bekele',
        position: 'Manager',
        officeCategory: 'HQ',
        department: 'HR',
        email: 'abebe.example', // invalid email
        phone: '0911223344'
      };
      const result = personnelSchema.safeParse(invalidPersonnel);
      expect(result.success).toBe(false);
    });
  });

  describe('complaintSchema', () => {
    it('should validate a valid complaint', () => {
      const validComplaint = {
        name: 'John Doe',
        phone: '0987654321',
        type: 'Complaint',
        subject: 'Internet Issue',
        message: 'The internet has been down for 3 hours.'
      };
      const result = complaintSchema.safeParse(validComplaint);
      expect(result.success).toBe(true);
    });
  });

  describe('adminSchema', () => {
    it('should validate valid admin configuration', () => {
      const validAdmin = {
        name: 'Admin User',
        email: 'admin@system.com',
        phone: '0911223344',
        accessLevel: 'all',
        status: 'Active'
      };
      const result = adminSchema.safeParse(validAdmin);
      expect(result.success).toBe(true);
    });
  });
});
