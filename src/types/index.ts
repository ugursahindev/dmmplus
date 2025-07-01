export type UserRole = 'ADMIN' | 'IDP_PERSONNEL' | 'LEGAL_PERSONNEL' | 'INSTITUTION_USER';

export type CaseStatus = 
  | 'IDP_FORM'
  | 'HUKUK_INCELEMESI'
  | 'SON_KONTROL'
  | 'RAPOR_URETIMI'
  | 'KURUM_BEKLENIYOR'
  | 'TAMAMLANDI';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Platform = 
  | 'TWITTER'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'WHATSAPP'
  | 'TELEGRAM'
  | 'TIKTOK'
  | 'OTHER';

export type GeographicScope = 
  | 'LOCAL'
  | 'REGIONAL'
  | 'NATIONAL'
  | 'INTERNATIONAL';

export type SourceType = 
  | 'SOCIAL_MEDIA'
  | 'NEWS_SITE'
  | 'BLOG'
  | 'FORUM'
  | 'MESSAGING_APP'
  | 'OTHER';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: UserRole;
  institution?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  platform: Platform;
  priority: Priority;
  status: CaseStatus;
  tags: string[];
  geographicScope: GeographicScope;
  sourceType: SourceType;
  sourceUrl?: string;
  
  // IDP Form fields
  idpAssessment?: string;
  idpNotes?: string;
  
  // Legal Review fields
  legalAssessment?: string;
  legalNotes?: string;
  legalApproved?: boolean;
  legalReviewerId?: number;
  legalReviewDate?: Date;
  
  // Final Control fields
  finalNotes?: string;
  finalApproval?: boolean;
  finalReviewerId?: number;
  finalReviewDate?: Date;
  
  // Report fields
  internalReport?: string;
  externalReport?: string;
  targetMinistry?: string;
  reportGeneratedDate?: Date;
  
  // Institution Response fields
  institutionResponse?: string;
  institutionResponderId?: number;
  institutionResponseDate?: Date;
  correctiveInfo?: string;
  
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  files?: CaseFile[];
}

export interface CaseFile {
  id: number;
  caseId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedById: number;
  uploadedAt: Date;
}

export interface CaseHistory {
  id: number;
  caseId: number;
  userId: number;
  action: string;
  oldStatus: CaseStatus;
  newStatus: CaseStatus;
  notes?: string;
  createdAt: Date;
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
  institution?: string;
}