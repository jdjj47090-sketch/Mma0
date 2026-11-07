import {PrismaClient} from '@prisma/client';import bcrypt from 'bcryptjs';
const db=new PrismaClient();
async function main(){const email=process.env.ADMIN_EMAIL?.toLowerCase();const password=process.env.ADMIN_PASSWORD;if(!email||!password||password.length<12)throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before seeding.');await db.admin.upsert({where:{email},update:{},create:{email,passwordHash:await bcrypt.hash(password,12)}});await db.siteSettings.upsert({where:{id:'main'},update:{},create:{id:'main',name:'Mahdi',bio:'Editable biography placeholder.',location:'Add your location',email:'Add your contact email'}});console.log('Admin and editable site settings are ready.');}
main().finally(()=>db.$disconnect());
