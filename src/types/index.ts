export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'content_editor';
  avatar?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  lang: string;
  status: 'Published' | 'Draft';
  author: string;
  created: string;
  published: string;
  category?: string;
  content?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  folderCode: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  version: string;
  visibility: 'Public' | 'Internal' | 'Restricted';
}

export interface Personnel {
  id: string;
  name: string;
  position: string;
  officeCategory: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Complaint {
  id: string;
  name: string;
  type: 'Complaint' | 'Suggestion';
  subject: string;
  date: string;
  status: 'New' | 'Under Review' | 'Resolved' | 'Rejected';
}
