import { User, Case } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Global logout callback that will be set by the AuthProvider
let globalLogoutCallback: (() => void) | null = null;

// Function to set the logout callback
export const setApiLogoutCallback = (callback: () => void) => {
  globalLogoutCallback = callback;
};

// Central fetch wrapper that handles errors
const apiRequest = async (url: string, options: RequestInit = {}) => {
  let response: Response;
  
  try {
    response = await fetch(url, options);
  } catch (error) {
    // Network error - don't logout, just throw
    console.error('Network error:', error);
    throw new Error('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.');
  }

  // Handle 401 Unauthorized - only logout if it's a real auth error
  if (response.status === 401) {
    // Check if it's a login endpoint - don't logout on login failures
    if (!url.includes('/api/auth/login')) {
      // Read response to check error type
      try {
        const errorData = await response.clone().json();
        // Only logout if it's a token/auth related error
        if (errorData.error && (
          errorData.error.includes('Token') || 
          errorData.error.includes('token') ||
          errorData.error.includes('Oturum') ||
          errorData.error.includes('Yetkiniz')
        )) {
          if (globalLogoutCallback) {
            globalLogoutCallback();
          }
        }
      } catch {
        // If can't parse JSON, assume it's an auth error and logout
        if (globalLogoutCallback && !url.includes('/api/auth/login')) {
          globalLogoutCallback();
        }
      }
    }
  }

  // Don't logout on 500 errors - these are server errors, not auth errors
  if (response.status >= 500) {
    throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
  }

  return response;
};

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiError {
  error: string;
}

export interface Institution {
  id: number;
  name: string;
  type?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    cases: number;
  };
}

export interface InstitutionsResponse {
  institutions: Institution[];
}

export interface CasesResponse {
  cases: Case[];
  totalPages: number;
  currentPage: number;
  totalCases: number;
  limit: number;
}

export interface LegalCasesResponse {
  cases: Case[];
  totalPages: number;
  currentPage: number;
  totalCases: number;
  limit: number;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export interface TasksResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
  totalTasks: number;
  limit: number;
}

export interface TaskStats {
  overview: {
    totalTasks: number;
    recentTasks: number;
    recentCompletedTasks: number;
    overdueTasks: number;
    dueThisWeek: number;
    averageCompletionDays: number;
  };
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  userDistribution?: Array<{
    assignedToId: number;
    _count: { assignedToId: number };
    user: {
      id: number;
      username: string;
      fullName: string;
      role: string;
    };
  }>;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedToId: number;
  assignedById: number;
  caseId?: number;
  dueDate?: string;
  completedAt?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: number;
    username: string;
    fullName: string;
  };
  assignedBy: {
    id: number;
    username: string;
    fullName: string;
  };
  case?: {
    id: number;
    caseNumber: string;
    title: string;
  };
  _count: {
    comments: number;
  };
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority?: string;
  assignedToId: number;
  caseId?: number;
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedToId?: number;
  caseId?: number;
  dueDate?: string;
  feedback?: string;
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
  recommendation?: string;
}

export interface TaskComment {
  id: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
}

export interface TaskCommentsResponse {
  comments: TaskComment[];
  totalPages: number;
  currentPage: number;
  totalComments: number;
  limit: number;
}

export interface CreateTaskCommentData {
  comment: string;
}

export interface StatsResponse {
  summary: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byPlatform: Record<string, number>;
  recentCases: Array<{
    id: number;
    caseNumber: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  userActivity: Array<{
    user: string;
    cases: number;
    role: string;
  }>;
  byGeographicScope: Array<{
    name: string;
    value: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  ministryDistribution: Array<{
    ministry: string;
    count: number;
  }>;
}

export const api = {
  // Login
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/auth/login`, {
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
    const response = await apiRequest(`${API_BASE_URL}/api/auth/logout`, {
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
    const response = await apiRequest(`${API_BASE_URL}/api/auth/me`, {
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

    const response = await apiRequest(`${API_BASE_URL}/api/cases?${params}`, {
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
    const response = await apiRequest(`${API_BASE_URL}/api/cases/${caseId}`, {
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
    const response = await apiRequest(`${API_BASE_URL}/api/cases`, {
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
    const response = await apiRequest(`${API_BASE_URL}/api/cases/${caseId}`, {
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
    const response = await apiRequest(`${API_BASE_URL}/api/cases/${caseId}`, {
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

  // Get tasks with pagination and filters
  getTasks: async (
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    priority?: string,
    assignedTo?: string,
    assignedBy?: string,
    caseId?: string
  ): Promise<TasksResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo && { assignedTo }),
      ...(assignedBy && { assignedBy }),
      ...(caseId && { caseId }),
    });

    const response = await apiRequest(`${API_BASE_URL}/api/tasks?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görevler yüklenemedi');
    }

    //---

    return data;
  },

  // Get single task by ID
  getTask: async (token: string, taskId: number): Promise<{ task: Task }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görev detayları yüklenemedi');
    }

    return data;
  },

  // Create new task
  createTask: async (token: string, taskData: CreateTaskData): Promise<{ message: string; task: Task }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görev oluşturulamadı');
    }

    return data;
  },

  // Update task
  updateTask: async (token: string, taskId: number, taskData: UpdateTaskData): Promise<{ message: string; task: Task }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görev güncellenemedi');
    }

    return data;
  },

  // Delete task
  deleteTask: async (token: string, taskId: number): Promise<{ message: string }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görev silinemedi');
    }

    return data;
  },

  // Get task statistics
  getTaskStats: async (token: string): Promise<TaskStats> => {
    const response = await apiRequest(`${API_BASE_URL}/api/tasks/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görev istatistikleri yüklenemedi');
    }

    return data;
  },

  // Get task comments
  getTaskComments: async (
    token: string,
    taskId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<TaskCommentsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(`${API_BASE_URL}/api/tasks/${taskId}/comments?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görev yorumları yüklenemedi');
    }

    return data;
  },

  // Create task comment
  createTaskComment: async (
    token: string,
    taskId: number,
    commentData: CreateTaskCommentData
  ): Promise<{ message: string; comment: TaskComment }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Yorum eklenemedi');
    }

    return data;
  },

  // Get statistics
  getStats: async (token: string): Promise<StatsResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'İstatistikler yüklenemedi');
    }

    return data;
  },

  // Get legal cases with pagination and filters
  getLegalCases: async (
    token: string,
    page: number = 1,
    limit: number = 50,
    search?: string,
    priority?: string,
    platform?: string,
    legalStatus?: string
  ): Promise<LegalCasesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(priority && { priority }),
      ...(platform && { platform }),
      ...(legalStatus && { legalStatus }),
    });

    const response = await apiRequest(`${API_BASE_URL}/api/cases/legal?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Hukuki vakalar yüklenemedi');
    }

    return data;
  },

  // Update user profile
  updateProfile: async (token: string, profileData: { fullName: string; email: string; username: string }): Promise<{ message: string; user: User }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Profil güncellenemedi');
    }

    return data;
  },

  // Update user password
  updatePassword: async (token: string, passwordData: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Şifre güncellenemedi');
    }

    return data;
  },

  // Get user settings
  getSettings: async (token: string): Promise<{ settings: any }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ayarlar yüklenemedi');
    }

    return data;
  },

  // Update user settings
  updateSettings: async (token: string, settings: { notifications?: any; system?: any }): Promise<{ message: string }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/users/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ayarlar güncellenemedi');
    }

    return data;
  },

  // Get institutions
  getInstitutions: async (token: string, params?: { search?: string; type?: string; active?: boolean }): Promise<InstitutionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());

    const url = `${API_BASE_URL}/api/institutions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Kurumlar yüklenemedi');
    }

    return data;
  },
}; 