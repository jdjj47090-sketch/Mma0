import { randomInt } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const PASSWORD_LENGTH = 24;
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}:,.?';
const PASSWORD_CHARACTERS = `${UPPERCASE}${LOWERCASE}${DIGITS}${SYMBOLS}`;

function pick(characters: string): string {
  return characters[randomInt(characters.length)];
}

export function generateStrongPassword(): string {
  const password = [pick(UPPERCASE), pick(LOWERCASE), pick(DIGITS), pick(SYMBOLS)];
  while (password.length < PASSWORD_LENGTH) password.push(pick(PASSWORD_CHARACTERS));

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }

  return password.join('');
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

async function createAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const databaseUrl = process.env.DATABASE_URL;

  if (!email) throw new Error('ADMIN_EMAIL is required.');
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ADMIN_EMAIL must be a valid email address.');

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  try {
    const existingAdmin = await db.admin.findUnique({ where: { email }, select: { id: true } });
    if (existingAdmin) {
      console.log(`Admin account already exists: ${email}`);
      return;
    }

    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (configuredPassword && configuredPassword.length < 12) {
      throw new Error('ADMIN_PASSWORD must contain at least 12 characters when provided.');
    }

    const generatedPassword = configuredPassword ? undefined : generateStrongPassword();
    const passwordHash = await bcrypt.hash(configuredPassword ?? generatedPassword!, 12);

    try {
      await db.admin.create({ data: { email, passwordHash } });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        console.log(`Admin account already exists: ${email}`);
        return;
      }
      throw error;
    }

    console.log(`Admin account created: ${email}`);
    if (generatedPassword) console.log(`Generated admin password (shown once): ${generatedPassword}`);
  } finally {
    await db.$disconnect();
  }
}

async function main(): Promise<void> {
  try {
    await createAdmin();
  } catch {
    console.error('Admin creation failed. Check the required environment variables, database connection, and applied migrations.');
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  void main();
}
