export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'content_editor';
  avatar?: string;
}

// @BACKEND: This is the permission model for admin role-based access.
// Expected API shape: GET /admins → Admin[], POST /admins → Admin, PUT /admins/:id → Admin, DELETE /admins/:id → void
// Permission groups are defined on frontend for now — backend should store group/module IDs as strings.

export type PermissionGroupId = 'content' | 'communications' | 'management' | 'system';

export const PERMISSION_GROUPS: Record<PermissionGroupId, { label: string; labelAm: string; modules: string[] }> = {
  content: { label: 'Content Management', labelAm: 'ይዘት አስተዳደር', modules: ['news', 'documents'] },
  communications: { label: 'Communications', labelAm: 'ኮሙኒኬሽን', modules: ['complaints', 'feedback'] },
  management: { label: 'Management', labelAm: 'ማኔጅመንት', modules: ['personnel', 'qr-access', 'statistics', 'assessment'] },
  system: { label: 'System', labelAm: 'ሲስተም', modules: ['admins', 'settings'] },
};

export const ALL_MODULES = [
  { id: 'news', label: 'News', labelAm: 'ዜና' },
  { id: 'documents', label: 'Documents', labelAm: 'ሰነዶች' },
  { id: 'complaints', label: 'Complaints', labelAm: 'ቅሬታዎች' },
  { id: 'feedback', label: 'Feedback', labelAm: 'አስተያየት' },
  { id: 'personnel', label: 'Personnel', labelAm: 'ሰራተኞች' },
  { id: 'qr-access', label: 'QR Access', labelAm: 'QR መዳረሻ' },
  { id: 'statistics', label: 'Statistics', labelAm: 'ስታቲስቲክስ' },
  { id: 'assessment', label: 'Assessment', labelAm: 'ምዘና' },
  { id: 'admins', label: 'Admins', labelAm: 'አስተዳዳሪዎች' },
  { id: 'settings', label: 'Settings', labelAm: 'ቅንብሮች' },
] as const;

export type AccessLevel = 'all' | 'specific' | 'group';

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  accessLevel: AccessLevel;
  groups: PermissionGroupId[];
  modules: string[];
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  lang: string;
  status: 'Published' | 'Draft';
  author: string;
  created: string;
  published: string;
  article_type?: 'News' | 'Message';
  body?: string;
  content?: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  excerpt?: string;
  description?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  fileType: string;
  fileSize: string;
}

export type OfficeType = 'main' | 'branch';

export const OFFICES: { code: OfficeType; name: string }[] = [
  { code: 'main', name: 'ኮሚሽን ዋና ጽ/ቤት' },
  { code: 'branch', name: 'ቅርንጫፍ ጽ/ቤቶች' },
];

export interface Document {
  id: string;
  title: string;
  description?: string;
  office: OfficeType;
  mainCategory: string;
  subCategory: string;
  year: string;
  files: DocumentFile[];
  uploadDate: string;
  uploadedBy: string;
  is_public?: boolean;
}

// @BACKEND: Commission hierarchy positions — both Amharic and English names.
export const COMMISSION_POSITIONS = [
  { id: 'chief', nameAm: 'ዋና ኮሚሽነር', nameEn: 'Chief Commissioner' },
  { id: 'deputy', nameAm: 'ምክትል ኮሚሽነር', nameEn: 'Deputy Commissioner' },
  { id: 'secretary', nameAm: 'የኮሚሽን ጸሃፊና ጽህፈት ቤት ሃላፊ', nameEn: 'Secretary & Office Head' },
  { id: 'member', nameAm: 'ኮሚሽን አባል', nameEn: 'Commission Member' },
  { id: 'management-committee', nameAm: 'የኮሚሽን ስራ አመራር ኮሚቴ አባላት', nameEn: 'Work Management Committee Members' },
  { id: 'management', nameAm: 'ኮሚሽን ማኔጅመንት አባላት', nameEn: 'Commission Management Members' },
  { id: 'branch-head', nameAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት ኃላፊ', nameEn: 'Branch Office Head' },
] as const;

export const OFFICE_CATEGORIES = [
  { id: 'main', nameAm: 'ኮሚሽን ዋና ጽ/ቤት', nameEn: 'Main Office' },
  { id: 'branch', nameAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', nameEn: 'Branch Office' },
  { id: 'commission-members', nameAm: 'ኮሚሽን አባላት', nameEn: 'Commission Members' },
] as const;

export interface Personnel {
  id: string;
  name: string;
  nameAm?: string;
  position: string;
  positionAm: string;
  officeCategory: string;
  officeCategoryAm: string;
  department: string;
  email: string;
  phone: string;
  photo?: string;
  message?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  whatsapp_url?: string;
  archived_at?: string;
  status: 'Active' | 'Inactive' | 'Archived';
  region?: string;
}

export interface ComplaintAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: string;
  url?: string;
}

export interface ComplaintResolution {
  message: string;
  attachments?: ComplaintAttachment[];
  resolvedAt: string;
  resolvedBy: string;
}

export type ComplaintStatus = 'New' | 'Processing' | 'Resolved' | 'Rejected';

export interface Complaint {
  id: string;
  trackingCode: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  submissionMode: string;
  memberCount?: number;
  institution?: string;
  type: 'Complaint' | 'Suggestion';
  subject: string;
  message: string;
  requestedResolution?: string;
  attachments: ComplaintAttachment[];
  date: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
  resolvedAt?: string;
  processedBy?: string;
  resolvedBy?: string;
  status: ComplaintStatus;
  resolution?: ComplaintResolution;
  groupMembers?: string[];
  assignedCommittee?: string;
  serviceName?: string;
  resolutionRating?: number;
  resolutionFeedback?: string;
}

export interface Feedback {
  id: string;
  category: string;
  rating: string;
  review: string;
  sentiment: string;
  region?: string;
  sector?: string;
  created_at: string;
}

export interface QrCode {
  id: string;
  active: boolean;
  duration: string;
  expiresAt: string;
  createdAt: string;
}

export interface ScanRequest {
  id: string;
  requesterDevice: string;
  fileName: string;
  ipAddress?: string;
  status: 'Pending' | 'Approved' | 'Denied';
  approverName?: string;
  durationGranted?: string;
  createdAt: string;
  resolvedAt?: string;
}
