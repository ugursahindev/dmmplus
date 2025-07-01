import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

export const authUtils = {
  // Şifre hash'leme
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },

  // Şifre doğrulama
  verifyPassword: async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
  },

  // JWT token oluşturma
  generateToken: (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  // JWT token doğrulama
  verifyToken: (token: string): JWTPayload => {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Geçersiz token');
    }
  },

  // Authorization header'dan token çıkarma
  extractTokenFromHeader: (authorization: string | undefined): string | null => {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    return authorization.substring(7);
  },
}; 