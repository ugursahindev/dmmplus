import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { UserRole } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: number;
      username: string;
      fullName: string;
      role: UserRole;
      institution?: string | null;
      apiToken: string;
    };
    apiToken?: string;
    redirectPath?: string;
  }

  interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: UserRole;
    institution?: string | null;
    apiToken: string;
    redirectPath?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: number;
    username?: string;
    email?: string;
    fullName?: string;
    role?: UserRole;
    institution?: string | null;
    apiToken?: string;
    redirectPath?: string;
  }
}

