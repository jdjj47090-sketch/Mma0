import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const key = () => { const value = process.env.AUTH_SECRET; if (!value || value.length < 32) throw new Error('AUTH_SECRET must contain at least 32 characters'); return new TextEncoder().encode(value); };
export async function createSession(subject: string) { return new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setSubject(subject).setIssuedAt().setExpirationTime('8h').sign(key()); }
export async function getSession() { const token = (await cookies()).get('mahdi_session')?.value; if (!token) return null; try { return (await jwtVerify(token, key())).payload; } catch { return null; } }
