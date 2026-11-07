import {NextRequest,NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {z} from 'zod';
import {db} from '@/lib/db';
import {createSession} from '@/lib/auth';
import {rateLimit} from '@/lib/rate-limit';
const schema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(200)});
export async function POST(req:NextRequest){const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';if(!rateLimit(`login:${ip}`,5))return NextResponse.json({error:'Try again later.'},{status:429});const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid credentials.'},{status:400});const admin=await db.admin.findUnique({where:{email:parsed.data.email.toLowerCase()}});if(!admin||!(await bcrypt.compare(parsed.data.password,admin.passwordHash)))return NextResponse.json({error:'Invalid credentials.'},{status:401});const token=await createSession(admin.id);const response=NextResponse.json({ok:true});response.cookies.set('mahdi_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:8*60*60});return response;}
