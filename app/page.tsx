import Portfolio from '@/components/Portfolio';import AnalyticsPing from '@/components/AnalyticsPing';import {db} from '@/lib/db';import {projects as defaults} from '@/lib/content';
export const dynamic='force-dynamic';
export default async function Home(){let items:typeof defaults[number][]=[...defaults];try{const records=await db.project.findMany({where:{published:true},orderBy:{sortOrder:'asc'}});items=records}catch{}return <><AnalyticsPing/><Portfolio initialProjects={items}/></>}
