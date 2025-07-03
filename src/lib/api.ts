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
  recommendationDMM?: string;
  recommendationDMK?: string;
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

    const response = await fetch(`${API_BASE_URL}/api/tasks?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Görevler yüklenemedi');
    }

    return data;
  },

  // Get single task by ID
  getTask: async (token: string, taskId: number): Promise<{ task: Task }> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tasks/stats`, {
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

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments?${params}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
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
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
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

    const response = await fetch(`${API_BASE_URL}/api/cases/legal?${params}`, {
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
}; 