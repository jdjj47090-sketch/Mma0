import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Mahdi — Independent Digital Creator', description: 'Thoughtful digital experiences, made to matter. Explore the work and practice of Mahdi.', metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), openGraph:{title:'Mahdi — Digital Creator',description:'Thoughtful digital experiences, made to matter.',type:'website'}, twitter:{card:'summary_large_image',title:'Mahdi — Digital Creator',description:'Thoughtful digital experiences, made to matter.'}, robots:{index:true,follow:true} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
