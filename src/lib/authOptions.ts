import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';
import { UserRole } from '@/types';

const determineRedirectPath = (role?: string | null) => {
  switch (role) {
    case 'ADMIN':
    case 'IDP_PERSONNEL':
      return '/dashboard';
    case 'LEGAL_PERSONNEL':
      return '/legal';
    case 'INSTITUTION_USER':
      return '/institution';
    default:
      return '/dashboard';
  }
};

// Get secret from environment variables
const getSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.error('⚠️  NEXTAUTH_SECRET veya JWT_SECRET environment variable bulunamadı!');
    console.error('⚠️  Lütfen .env dosyanıza NEXTAUTH_SECRET ekleyin.');
    // Fallback for development only
    return 'development-secret-key-change-in-production';
  }
  return secret;
};

export const authOptions: NextAuthOptions = {
  secret: getSecret(),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 hours
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Kullanıcı Adı', type: 'text' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Kullanıcı adı ve şifre gereklidir');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          select: {
            id: true,
            username: true,
            password: true,
            email: true,
            fullName: true,
            role: true,
            institution: true,
            active: true,
          },
        });

        if (!user) {
          throw new Error('Geçersiz kullanıcı adı veya şifre');
        }

        if (!user.active) {
          throw new Error('Hesabınız aktif değil');
        }

        const isPasswordValid = await authUtils.verifyPassword(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Geçersiz kullanıcı adı veya şifre');
        }

        const apiToken = authUtils.generateToken({
          userId: user.id,
          username: user.username,
          role: user.role,
        });

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role as UserRole,
          institution: user.institution,
          redirectPath: determineRedirectPath(user.role),
          apiToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number((user as any).id);
        token.username = (user as any).username;
        token.email = (user as any).email;
        token.fullName = (user as any).fullName;
        token.role = (user as any).role as UserRole;
        token.institution = (user as any).institution;
        token.redirectPath = (user as any).redirectPath;
        token.apiToken = (user as any).apiToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id);
        session.user.username = token.username as string;
        session.user.email = (token.email as string) ?? session.user.email ?? '';
        session.user.fullName = token.fullName as string;
        session.user.role = token.role as UserRole;
        session.user.institution = (token.institution as string | null) ?? undefined;
        session.user.apiToken = token.apiToken as string;
      } else {
        session.user = {
          id: Number(token.id),
          username: token.username as string,
          email: (token.email as string) ?? '',
          fullName: token.fullName as string,
          role: token.role as UserRole,
          institution: (token.institution as string | null) ?? undefined,
          apiToken: token.apiToken as string,
        };
      }

      session.apiToken = token.apiToken as string;
      session.redirectPath = (token.redirectPath as string | null) ?? undefined;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Token cleanup hooks can be added here if needed
      if (token) {
        token.apiToken = undefined;
      }
    },
  },
};

