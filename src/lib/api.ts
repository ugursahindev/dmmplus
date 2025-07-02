import { User, Case } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiError {
  error: string;
}

export interface CasesResponse {
  cases: Case[];
  totalPages: number;
  currentPage: number;
  totalCases: number;
  limit: number;
}

export interface CreateCaseData {
  caseNumber: string;
  title: string;
  description: string;
  platform: string;
  priority: string;
  tags?: string[];
  geographicScope: string;
  sourceType: string;
  sourceUrl?: string;
}

export interface UpdateCaseData {
  title?: string;
  description?: string;
  platform?: string;
  priority?: string;
  tags?: string[];
  geographicScope?: string;
  sourceType?: string;
  sourceUrl?: string;
  status?: string;
  idpAssessment?: string;
  idpNotes?: string;
  legalAssessment?: string;
  legalNotes?: string;
  legalApproved?: boolean;
  finalNotes?: string;
  finalApproval?: boolean;
  internalReport?: string;
  externalReport?: string;
  targetMinistry?: string;
  institutionResponse?: string;
  correctiveInfo?: string;
  newsHeadline?: string;
  newspaperAuthor?: string;
  newsSummary?: string;
  ministryInfo?: string;
  relatedMinistry?: string;
  submittedTo?: string;
  submittingUnit?: string;
  preparedBy?: string;
  disinformationType?: string;
  expertEvaluation?: string;
  legalEvaluation?: string;
  recommendationDMM?: string;
  recommendationDMK?: string;
}

export const api = {
  // Login
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Giriş başarısız');
    }

    return data;
  },

  // Logout
  logout: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Çıkış başarısız');
    }
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Kullanıcı bilgileri alınamadı');
    }

    return data.user;
  },

  // Get cases with pagination and filters
  getCases: async (
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    priority?: string,
    platform?: string
  ): Promise<CasesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(platform && { platform }),
    });

    const response = await fetch(`${API_BASE_URL}/api/cases?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Vakalar yüklenemedi');
    }

    return data;
  },

  // Get single case by ID
  getCase: async (token: string, caseId: number): Promise<Case> => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Vaka detayları yüklenemedi');
    }

    return data;
  },

  // Create new case
  createCase: async (token: string, caseData: CreateCaseData): Promise<{ message: string; case: Case }> => {
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Vaka oluşturulamadı');
    }

    return data;
  },

  // Update case
  updateCase: async (token: string, caseId: number, caseData: UpdateCaseData): Promise<{ message: string; case: Case }> => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Vaka güncellenemedi');
    }

    return data;
  },

  // Delete case
  deleteCase: async (token: string, caseId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Vaka silinemedi');
    }

    return data;
  },
}; 