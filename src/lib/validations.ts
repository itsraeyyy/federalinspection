import * as z from 'zod';

export const newsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  language: z.string().min(1, 'Language is required.'),
  category: z.string().min(1, 'Category is required.'),
  body: z.string().min(10, 'Body content is required.'),
  status: z.enum(['Draft', 'Published']).optional(),
});

export const documentSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  description: z.string().optional(),
  folderCode: z.string().min(1, 'Folder code is required.'),
  visibility: z.enum(['Public', 'Internal', 'Restricted']),
});

export const personnelSchema = z.object({
  name: z.string().min(3, 'Name is required.'),
  position: z.string().min(2, 'Position is required.'),
  officeCategory: z.string().min(1, 'Category is required.'),
  department: z.string().min(1, 'Department is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(9, 'Phone number is too short.'),
});

export const complaintSchema = z.object({
  name: z.string().min(3, 'Full name is required.'),
  phone: z.string().min(9, 'Phone number is required.'),
  email: z.string().email().optional().or(z.literal('')),
  type: z.enum(['Complaint', 'Suggestion']),
  subject: z.string().min(5, 'Subject is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});
