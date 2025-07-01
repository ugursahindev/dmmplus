import { User, Case, CaseStatus, Priority, Platform, UserRole } from '@/types';

// Demo kullanıcılar
export const demoUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@dmm.gov.tr',
    fullName: 'Sistem Yöneticisi',
    role: 'ADMIN',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    username: 'idp_user',
    password: 'idp123',
    email: 'idp@dmm.gov.tr',
    fullName: 'IDP Personeli',
    role: 'IDP_PERSONNEL',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 3,
    username: 'legal_user',
    password: 'legal123',
    email: 'legal@dmm.gov.tr',
    fullName: 'Hukuk Personeli',
    role: 'LEGAL_PERSONNEL',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 4,
    username: 'institution_user',
    password: 'inst123',
    email: 'institution@dmm.gov.tr',
    fullName: 'Kurum Kullanıcısı',
    role: 'INSTITUTION_USER',
    institution: 'Sağlık Bakanlığı',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Demo vakalar
export const demoCases: Case[] = [
  {
    id: 1,
    caseNumber: 'DMM-2024-001',
    title: 'Sahte COVID-19 Aşısı Haberi',
    description: 'Sosyal medyada yayılan sahte COVID-19 aşısı ile ilgili yanlış bilgiler',
    platform: 'FACEBOOK',
    priority: 'HIGH',
    status: 'TAMAMLANDI',
    tags: ['COVID-19', 'Aşı', 'Sağlık'],
    geographicScope: 'NATIONAL',
    sourceType: 'SOCIAL_MEDIA',
    sourceUrl: 'https://facebook.com/fake-news',
    idpAssessment: 'Vaka detaylı incelenmiş ve doğrulanmıştır.',
    idpNotes: 'Sahte aşı haberleri toplum sağlığını tehdit etmektedir.',
    legalAssessment: 'Yasal açıdan değerlendirilmiş ve onaylanmıştır.',
    legalNotes: 'Sahte aşı haberleri yasal yaptırımlara tabidir.',
    legalApproved: true,
    legalReviewerId: 3,
    legalReviewDate: new Date('2024-01-15'),
    finalNotes: 'Son kontrol tamamlanmıştır.',
    finalApproval: true,
    finalReviewerId: 1,
    finalReviewDate: new Date('2024-01-16'),
    internalReport: 'İç rapor hazırlanmıştır.',
    externalReport: 'Dış rapor ilgili kuruma gönderilmiştir.',
    targetMinistry: 'Sağlık Bakanlığı',
    reportGeneratedDate: new Date('2024-01-17'),
    institutionResponse: 'Kurum yanıtı alınmıştır.',
    institutionResponderId: 4,
    institutionResponseDate: new Date('2024-01-20'),
    correctiveInfo: 'Düzeltme bilgileri yayınlanmıştır.',
    createdById: 2,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 2,
    caseNumber: 'DMM-2024-002',
    title: 'Yanlış Seçim Sonuçları',
    description: 'Twitter\'da yayılan yanlış seçim sonuçları',
    platform: 'TWITTER',
    priority: 'CRITICAL',
    status: 'HUKUK_INCELEMESI',
    tags: ['Seçim', 'Demokrasi', 'Yanlış Bilgi'],
    geographicScope: 'NATIONAL',
    sourceType: 'SOCIAL_MEDIA',
    sourceUrl: 'https://twitter.com/fake-election',
    idpAssessment: 'Vaka incelenmektedir.',
    idpNotes: 'Seçim sonuçları ile ilgili yanlış bilgiler tespit edilmiştir.',
    createdById: 2,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 3,
    caseNumber: 'DMM-2024-003',
    title: 'Sahte Deprem Uyarısı',
    description: 'WhatsApp\'ta yayılan sahte deprem uyarıları',
    platform: 'WHATSAPP',
    priority: 'HIGH',
    status: 'SON_KONTROL',
    tags: ['Deprem', 'Uyarı', 'Panik'],
    geographicScope: 'REGIONAL',
    sourceType: 'MESSAGING_APP',
    sourceUrl: 'https://whatsapp.com/fake-earthquake',
    idpAssessment: 'Sahte deprem uyarıları incelenmiştir.',
    idpNotes: 'Toplumda panik yaratabilecek yanlış bilgiler.',
    legalAssessment: 'Hukuki değerlendirme tamamlanmıştır.',
    legalNotes: 'Sahte uyarılar yasal yaptırımlara tabidir.',
    legalApproved: true,
    legalReviewerId: 3,
    legalReviewDate: new Date('2024-01-28'),
    createdById: 2,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: 4,
    caseNumber: 'DMM-2024-004',
    title: 'Yanlış Ekonomi Verileri',
    description: 'Instagram\'da yayılan yanlış ekonomi verileri',
    platform: 'INSTAGRAM',
    priority: 'MEDIUM',
    status: 'IDP_FORM',
    tags: ['Ekonomi', 'Veri', 'Yanlış Bilgi'],
    geographicScope: 'NATIONAL',
    sourceType: 'SOCIAL_MEDIA',
    sourceUrl: 'https://instagram.com/fake-economy',
    createdById: 2,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: 5,
    caseNumber: 'DMM-2024-005',
    title: 'Sahte Eğitim Haberi',
    description: 'YouTube\'da yayılan sahte eğitim haberi',
    platform: 'YOUTUBE',
    priority: 'LOW',
    status: 'RAPOR_URETIMI',
    tags: ['Eğitim', 'Haber', 'Yanlış Bilgi'],
    geographicScope: 'LOCAL',
    sourceType: 'SOCIAL_MEDIA',
    sourceUrl: 'https://youtube.com/fake-education',
    idpAssessment: 'Eğitim ile ilgili yanlış bilgiler tespit edilmiştir.',
    idpNotes: 'Öğrenci ve velileri etkileyebilecek yanlış bilgiler.',
    legalAssessment: 'Hukuki değerlendirme tamamlanmıştır.',
    legalNotes: 'Eğitim ile ilgili yanlış bilgiler yasal yaptırımlara tabidir.',
    legalApproved: true,
    legalReviewerId: 3,
    legalReviewDate: new Date('2024-02-01'),
    finalNotes: 'Son kontrol aşamasındadır.',
    finalApproval: true,
    finalReviewerId: 1,
    finalReviewDate: new Date('2024-02-02'),
    createdById: 2,
    createdAt: new Date('2024-01-29'),
    updatedAt: new Date('2024-02-02'),
  },
];

// Local Storage anahtarları
const STORAGE_KEYS = {
  USERS: 'dmm_demo_users',
  CASES: 'dmm_demo_cases',
  CURRENT_USER: 'dmm_demo_current_user',
  AUTH_TOKEN: 'dmm_demo_token',
};

// Local Storage yardımcı fonksiyonları
export const storage = {
  // Kullanıcılar
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return demoUsers;
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : demoUsers;
  },

  setUsers: (users: User[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Vakalar
  getCases: (): Case[] => {
    if (typeof window === 'undefined') return demoCases;
    const stored = localStorage.getItem(STORAGE_KEYS.CASES);
    return stored ? JSON.parse(stored) : demoCases;
  },

  setCases: (cases: Case[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  },

  // Mevcut kullanıcı
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  // Demo verilerini sıfırla
  resetDemoData: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(demoCases));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

// Demo API fonksiyonları
export const demoAPI = {
  // Authentication
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const users = storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Geçersiz kullanıcı adı veya şifre');
    }

    const token = `demo_token_${user.id}_${Date.now()}`;
    storage.setCurrentUser(user);
    storage.setToken(token);
    
    return { user, token };
  },

  logout: async (): Promise<void> => {
    storage.setCurrentUser(null);
    storage.setToken(null);
  },

  getCurrentUser: async (): Promise<User> => {
    const user = storage.getCurrentUser();
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    return user;
  },

  // Vakalar
  getCases: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
  }): Promise<{ cases: Case[]; totalPages: number; total: number }> => {
    let cases = storage.getCases();
    
    // Filtreleme
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      cases = cases.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.caseNumber.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    if (params?.status) {
      cases = cases.filter(c => c.status === params.status);
    }

    if (params?.priority) {
      cases = cases.filter(c => c.priority === params.priority);
    }

    // Sayfalama
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCases = cases.slice(startIndex, endIndex);
    const totalPages = Math.ceil(cases.length / limit);

    return {
      cases: paginatedCases,
      totalPages,
      total: cases.length,
    };
  },

  getCase: async (id: number): Promise<Case> => {
    const cases = storage.getCases();
    const caseItem = cases.find(c => c.id === id);
    if (!caseItem) {
      throw new Error('Vaka bulunamadı');
    }
    return caseItem;
  },

  createCase: async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> => {
    const cases = storage.getCases();
    const newCase: Case = {
      ...caseData,
      id: Math.max(...cases.map(c => c.id), 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    cases.push(newCase);
    storage.setCases(cases);
    return newCase;
  },

  updateCase: async (id: number, updates: Partial<Case>): Promise<Case> => {
    const cases = storage.getCases();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Vaka bulunamadı');
    }

    cases[index] = {
      ...cases[index],
      ...updates,
      updatedAt: new Date(),
    };

    storage.setCases(cases);
    return cases[index];
  },

  deleteCase: async (id: number): Promise<void> => {
    const cases = storage.getCases();
    const filteredCases = cases.filter(c => c.id !== id);
    storage.setCases(filteredCases);
  },

  // İstatistikler
  getStats: async (): Promise<{
    summary: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
    };
    recentCases: Array<{
      id: number;
      caseNumber: string;
      title: string;
      status: string;
      priority: string;
      createdAt: string;
    }>;
  }> => {
    const cases = storage.getCases();
    
    const summary = {
      total: cases.length,
      pending: cases.filter(c => c.status === 'IDP_FORM').length,
      inProgress: cases.filter(c => 
        ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR'].includes(c.status)
      ).length,
      completed: cases.filter(c => c.status === 'TAMAMLANDI').length,
    };

    const recentCases = cases
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt.toISOString(),
      }));

    return { summary, recentCases };
  },
}; 