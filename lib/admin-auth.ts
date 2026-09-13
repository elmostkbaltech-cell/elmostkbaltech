import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  email?: string;
}

export interface SeededAdminRecord extends AdminUser {
  passwordHash: string;
}

export const SEEDED_ADMINS: SeededAdminRecord[] = [
  {
    id: 'admin-walid',
    username: 'وليد',
    displayName: 'وليد (المدير التنفيذي)',
    role: 'SUPER_ADMIN',
    email: 'elmostkbaltech@gmail.com',
    passwordHash: '$2b$10$WSisBhOD/5cZaHNY7Prymu46SNu1MVFwE4toDtgirPGEKo.WZaTzi',
  },
  {
    id: 'admin-karim',
    username: 'كريم',
    displayName: 'كريم (مسؤول الصيانة والضمانات)',
    role: 'ADMIN',
    email: 'elmostkbaltech@gmail.com',
    passwordHash: '$2b$10$N4QBnpZgHIO6wJJgxa6P8.YMBspq1q8Ui4hBMf99xe9otE06L1/Cm',
  },
  {
    id: 'admin-abdelrahman',
    username: 'عبد الرحمن',
    displayName: 'عبد الرحمن (مسؤول الشحنات والمخزون)',
    role: 'ADMIN',
    email: 'elmostkbaltech@gmail.com',
    passwordHash: '$2b$10$phph/LHCPXdHbHbyt4BR/uWJQLhHbRWolNqQqZhroEPVM9USXNqyG',
  },
];

export function authenticateAdmin(usernameInput: string, passwordInput: string): AdminUser | null {
  const normalizedUser = usernameInput.trim().toLowerCase();
  
  const found = SEEDED_ADMINS.find(
    (u) => u.username.toLowerCase() === normalizedUser || 
           (u.email && u.email.toLowerCase() === normalizedUser)
  );

  if (!found) {
    return null;
  }

  const isPasswordValid = bcrypt.compareSync(passwordInput, found.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  const { passwordHash: _, ...cleanUser } = found;
  return cleanUser;
}

const ADMIN_SESSION_KEY = 'mostaqbal_admin_session';

export function getStoredAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch (e) {
    console.error('Failed to get admin session', e);
    return null;
  }
}

export function saveAdminSession(user: AdminUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear admin session', e);
  }
}
