import { createHash } from 'crypto';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + (process.env.PASSWORD_SALT ?? 'sedan-salt')).digest('hex');
}
