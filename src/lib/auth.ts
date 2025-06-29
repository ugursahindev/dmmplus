import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { JWTPayload, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = '8h';

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canViewCase(userRole: UserRole, caseStatus: string): boolean {
  switch (userRole) {
    case 'ADMIN':
    case 'IDP_PERSONNEL':
      return true;
    case 'LEGAL_PERSONNEL':
      return ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'].includes(caseStatus);
    case 'INSTITUTION_USER':
      return ['KURUM_BEKLENIYOR', 'TAMAMLANDI'].includes(caseStatus);
    default:
      return false;
  }
}

export function canEditCase(userRole: UserRole, caseStatus: string): boolean {
  switch (userRole) {
    case 'ADMIN':
      return true;
    case 'IDP_PERSONNEL':
      return ['IDP_FORM', 'SON_KONTROL', 'RAPOR_URETIMI'].includes(caseStatus);
    case 'LEGAL_PERSONNEL':
      return caseStatus === 'HUKUK_INCELEMESI';
    case 'INSTITUTION_USER':
      return caseStatus === 'KURUM_BEKLENIYOR';
    default:
      return false;
  }
}